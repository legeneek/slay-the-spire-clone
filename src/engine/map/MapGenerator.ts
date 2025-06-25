import { v4 as uuidv4 } from "uuid";
import { shuffle, sample, uniq, cloneDeep } from "lodash-es";
import { type GameMap, type MapNode, MapNodeType } from "./types";

const MAP_CONSTANTS = {
  COLUMNS: 15,
  LANES: 6,
  BRANCH_CHANCE: 0.2,
  MERGE_CHANCE: 0.4,
};

type NodeTypeWeights = Partial<Record<MapNodeType, number>>;

const GENERATION_RULES = {
  FORCED_MONSTER_COLUMNS: 1,
  MIN_REST_SITES: 3,
  MIN_SHOPS: 1,
  ELITE_START_COLUMN: 5,
  NODE_TYPE_WEIGHTS: {
    [MapNodeType.MONSTER]: 6,
    [MapNodeType.EVENT]: 5,
    [MapNodeType.SHOP]: 2,
    [MapNodeType.REST]: 4,
    [MapNodeType.ELITE]: 3,
  } as NodeTypeWeights,
};

export class MapGenerator {
  private nodes: Record<string, MapNode> = {};
  private grid: (MapNode | null)[][];
  private generatedCounts: Record<MapNodeType, number> = {
    [MapNodeType.MONSTER]: 0,
    [MapNodeType.ELITE]: 0,
    [MapNodeType.EVENT]: 0,
    [MapNodeType.REST]: 0,
    [MapNodeType.SHOP]: 0,
    [MapNodeType.TREASURE]: 0,
    [MapNodeType.BOSS]: 0,
  };

  constructor() {
    this.grid = Array.from({ length: MAP_CONSTANTS.COLUMNS }, () =>
      Array(MAP_CONSTANTS.LANES).fill(null)
    );
  }

  public static generateAct1Map(): GameMap {
    const generator = new MapGenerator();
    return generator.generate();
  }

  private generate(): GameMap {
    let previousColumnNodeIds: string[] = [];
    const startingNodeIds: string[] = [];

    // 1. Create initial fan-out of starting paths.
    this.getStartingLanes().forEach((y) => {
      const startNode = this.createNode(0, y, MapNodeType.MONSTER);
      this.addNode(startNode);
      previousColumnNodeIds.push(startNode.id);
      startingNodeIds.push(startNode.id);
    });

    // 2. Generate the main body of the map, column by column.
    for (let x = 1; x < MAP_CONSTANTS.COLUMNS - 1; x++) {
      let currentColumnNodeIds: string[] = [];
      const parentNodesInColumn = cloneDeep(previousColumnNodeIds);

      parentNodesInColumn.forEach((parentId) => {
        const parentNode = this.nodes[parentId];
        if (!parentNode) return;

        this.createPath(parentNode, x, currentColumnNodeIds);
        if (Math.random() < MAP_CONSTANTS.BRANCH_CHANCE) {
          this.createPath(parentNode, x, currentColumnNodeIds);
        }
      });

      if (
        Math.random() < MAP_CONSTANTS.MERGE_CHANCE &&
        currentColumnNodeIds.length > 1
      ) {
        this.mergePaths(currentColumnNodeIds);
      }
      previousColumnNodeIds = uniq(currentColumnNodeIds);
    }

    // 3. Post-generation validation and correction passes.
    this.enforceMinimums();
    this.connectOrphans();

    // 4. Create the final boss node and connect all loose ends to it.
    const bossNode = this.createNode(
      MAP_CONSTANTS.COLUMNS - 1,
      Math.floor(MAP_CONSTANTS.LANES / 2),
      MapNodeType.BOSS
    );
    this.addNode(bossNode);
    this.connectAllToEnd(bossNode);

    return { nodes: this.nodes, startingNodeIds, bossNodeId: bossNode.id };
  }

  // --- CORE HELPER METHODS ---

  private createNode(x: number, y: number, type: MapNodeType): MapNode {
    return { id: uuidv4(), type, x, y, children: [] };
  }

  private addNode(node: MapNode) {
    this.nodes[node.id] = node;
    this.grid[node.x][node.y] = node;
    this.generatedCounts[node.type]++;
  }

  private createPath(
    parentNode: MapNode,
    currentX: number,
    currentColumnNodeIds: string[]
  ) {
    const newY = this.findEmptyLane(currentX, parentNode.y);
    if (newY === -1) return;

    const nodeType = this.getValidNodeType(currentX, parentNode.type);
    const newNode = this.createNode(currentX, newY, nodeType);

    this.addNode(newNode);
    parentNode.children.push(newNode.id);
    currentColumnNodeIds.push(newNode.id);
  }

  private getValidNodeType(x: number, parentType: MapNodeType): MapNodeType {
    if (x < GENERATION_RULES.FORCED_MONSTER_COLUMNS) {
      return MapNodeType.MONSTER;
    }

    let weightedPool: MapNodeType[] = [];
    const rules = GENERATION_RULES.NODE_TYPE_WEIGHTS;

    for (const [typeStr, weight] of Object.entries(rules)) {
      const nodeType = typeStr as MapNodeType; // Still need to cast the key string to an enum

      // Skip if weight is not defined
      if (weight === undefined) continue;

      // Rule 3: Prevent adjacent special nodes
      if (nodeType === parentType && nodeType !== MapNodeType.MONSTER) {
        continue;
      }
      // Rule 4: Constrain Elites to later columns
      if (
        nodeType === MapNodeType.ELITE &&
        x < GENERATION_RULES.ELITE_START_COLUMN
      ) {
        continue;
      }

      for (let i = 0; i < weight; i++) {
        weightedPool.push(nodeType);
      }
    }

    if (weightedPool.length === 0) return MapNodeType.MONSTER;
    return sample(weightedPool)!;
  }

  private enforceMinimums() {
    this.ensureNodeType(MapNodeType.REST, GENERATION_RULES.MIN_REST_SITES);
    this.ensureNodeType(MapNodeType.SHOP, GENERATION_RULES.MIN_SHOPS);
  }

  private ensureNodeType(type: MapNodeType, minCount: number) {
    let attempts = 0;
    while (this.generatedCounts[type] < minCount && attempts < 50) {
      this.replaceRandomNodeWithType(type);
      attempts++;
    }
  }

  private replaceRandomNodeWithType(typeToPlace: MapNodeType) {
    const validColumns = Array.from(
      {
        length:
          MAP_CONSTANTS.COLUMNS - GENERATION_RULES.FORCED_MONSTER_COLUMNS - 2,
      }, // -2 to avoid last columns
      (_, i) => i + GENERATION_RULES.FORCED_MONSTER_COLUMNS
    );
    const randomX = sample(validColumns)!;

    const potentialNodes = this.grid[randomX]?.filter(
      (node) =>
        node &&
        (node.type === MapNodeType.MONSTER || node.type === MapNodeType.EVENT)
    );
    if (potentialNodes && potentialNodes.length > 0) {
      const nodeToReplace = sample(potentialNodes)!;
      this.generatedCounts[nodeToReplace.type]--;
      nodeToReplace.type = typeToPlace;
      this.generatedCounts[typeToPlace]++;
    }
  }

  // --- UTILITY AND GEOMETRY METHODS ---

  private findEmptyLane(x: number, preferredY: number): number {
    const potentialY = shuffle([preferredY, preferredY - 1, preferredY + 1]);
    for (const y of potentialY) {
      if (y >= 0 && y < MAP_CONSTANTS.LANES && this.grid[x][y] === null)
        return y;
    }
    const allLanes = shuffle(
      Array.from({ length: MAP_CONSTANTS.LANES }, (_, i) => i)
    );
    for (const y of allLanes) {
      if (this.grid[x][y] === null) return y;
    }
    return -1; // No empty lanes found
  }

  private getStartingLanes(): number[] {
    const lanes = Array.from({ length: MAP_CONSTANTS.LANES }, (_, i) => i);
    const shuffled = shuffle(lanes);
    const chosen = [shuffled[0]];
    for (let i = 1; i < shuffled.length && chosen.length < 3; i++) {
      if (chosen.every((c) => Math.abs(c - shuffled[i]) > 1)) {
        chosen.push(shuffled[i]);
      }
    }
    while (chosen.length < 3 && chosen.length < shuffled.length) {
      const nextLane = shuffled.find((l) => !chosen.includes(l));
      if (nextLane !== undefined) chosen.push(nextLane);
      else break;
    }
    return chosen.sort((a, b) => a - b);
  }

  private mergePaths(currentColumnNodeIds: string[]) {
    const nodeToKeepId = sample(currentColumnNodeIds)!;
    const nodeToRemoveId = sample(
      currentColumnNodeIds.filter((id) => id !== nodeToKeepId)
    )!;

    const nodeToKeep = this.nodes[nodeToKeepId];
    const nodeToRemove = this.nodes[nodeToRemoveId];
    if (!nodeToKeep || !nodeToRemove) return;

    Object.values(this.nodes).forEach((p) => {
      if (p.children.includes(nodeToRemoveId)) {
        p.children = p.children.filter((cId) => cId !== nodeToRemoveId);
        if (!p.children.includes(nodeToKeepId)) {
          p.children.push(nodeToKeepId);
        }
      }
    });

    delete this.nodes[nodeToRemoveId];
    this.grid[nodeToRemove.x][nodeToRemove.y] = null;
    const index = currentColumnNodeIds.indexOf(nodeToRemoveId);
    if (index > -1) currentColumnNodeIds.splice(index, 1);
  }

  private connectOrphans() {
    for (let x = 0; x < MAP_CONSTANTS.COLUMNS - 2; x++) {
      for (let y = 0; y < MAP_CONSTANTS.LANES; y++) {
        const currentNode = this.grid[x][y];
        if (currentNode && currentNode.children.length === 0) {
          let connected = false;
          // Search downwards from current lane for a connection in the next column
          for (let searchY = y; searchY < MAP_CONSTANTS.LANES; searchY++) {
            const potentialTarget = this.grid[x + 1]?.[searchY];
            if (potentialTarget) {
              currentNode.children.push(potentialTarget.id);
              connected = true;
              break;
            }
          }
          // If not found, search upwards
          if (!connected) {
            for (let searchY = y - 1; searchY >= 0; searchY--) {
              const potentialTarget = this.grid[x + 1]?.[searchY];
              if (potentialTarget) {
                currentNode.children.push(potentialTarget.id);
                break;
              }
            }
          }
        }
      }
    }
  }

  private connectAllToEnd(bossNode: MapNode) {
    // Connect all nodes in the second-to-last column
    for (let y = 0; y < MAP_CONSTANTS.LANES; y++) {
      const node = this.grid[MAP_CONSTANTS.COLUMNS - 2]?.[y];
      if (node) {
        node.children = [bossNode.id];
      }
    }
    // Final safety net for any other remaining orphans
    Object.values(this.nodes).forEach((node) => {
      if (node.children.length === 0 && node.type !== MapNodeType.BOSS) {
        node.children.push(bossNode.id);
      }
    });
  }
}
