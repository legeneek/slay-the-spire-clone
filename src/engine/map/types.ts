export enum MapNodeType {
  MONSTER = "MONSTER",
  ELITE = "ELITE",
  EVENT = "EVENT",
  REST = "REST",
  SHOP = "SHOP",
  TREASURE = "TREASURE",
  BOSS = "BOSS",
}

export interface MapNode {
  id: string; // Unique ID for this node
  type: MapNodeType;
  // Position on the map grid. 'x' is the column, 'y' is the vertical lane.
  x: number;
  y: number;
  // An array of node IDs that this node connects to.
  children: string[];
}

export interface GameMap {
  nodes: Record<string, MapNode>; // A dictionary of all nodes, keyed by their ID
  startingNodeIds: string[]; // Possible starting points
  bossNodeId: string;
}
