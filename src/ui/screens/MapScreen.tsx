import { useGameEngine } from "../hooks/useGameEngine";
import { GameController } from "../../engine/GameController";
import { type MapNode } from "../../engine/map/types";

// --- Constants for SVG layout ---
const NODE_RADIUS = 20;
const COLUMN_WIDTH = 80;
const LANE_HEIGHT = 70;

const ICONS: Record<string, string> = {
  MONSTER: "⚔️",
  ELITE: "💀",
  EVENT: "?",
  REST: "🔥",
  SHOP: "💰",
  BOSS: "👑",
};

// --- Sub-Components for SVG ---

// Renders a single curved path between two nodes
const MapPath = ({
  start,
  end,
  isSelectable,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isSelectable: boolean;
}) => {
  // Bezier curve control points for a nice "S" curve
  const controlX1 = start.x + COLUMN_WIDTH / 2;
  const controlY1 = start.y;
  const controlX2 = end.x - COLUMN_WIDTH / 2;
  const controlY2 = end.y;

  const pathData = `M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;

  return (
    <path
      d={pathData}
      className={`map-path ${isSelectable ? "selectable" : "future"}`}
    />
  );
};

// Renders a single node with its icon
const MapNodeComponent = ({
  node,
  isCurrent,
  isSelectable,
  onClick,
}: {
  node: MapNode;
  isCurrent: boolean;
  isSelectable: boolean;
  onClick: () => void;
}) => {
  const x = node.x * COLUMN_WIDTH + 50;
  const y = node.y * LANE_HEIGHT + 50;
  const stateClass = isCurrent
    ? "current"
    : isSelectable
    ? "selectable"
    : "future";

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={`map-node ${stateClass}`}
      onClick={isSelectable ? onClick : undefined}
    >
      <circle r={NODE_RADIUS} />
      <text textAnchor="middle" dy=".3em" fontSize="20px">
        {ICONS[node.type] || "?"}
      </text>
    </g>
  );
};

// --- Main Map Screen Component ---

export default function MapScreen() {
  const { map, currentMapNodeId } = useGameEngine();

  if (!map) return <div>Loading map...</div>;

  const selectableNodeIds = currentMapNodeId
    ? map.nodes[currentMapNodeId]?.children || []
    : map.startingNodeIds;

  return (
    <div className="map-screen-container">
      <svg className="map-svg" viewBox="0 0 1300 600">
        {/* Render all paths first, so they appear underneath the nodes */}
        {Object.values(map.nodes).map((startNode) =>
          startNode.children.map((childId) => {
            const endNode = map.nodes[childId];
            if (!endNode) return null;

            const startPos = {
              x: startNode.x * COLUMN_WIDTH + 50,
              y: startNode.y * LANE_HEIGHT + 50,
            };
            const endPos = {
              x: endNode.x * COLUMN_WIDTH + 50,
              y: endNode.y * LANE_HEIGHT + 50,
            };

            return (
              <MapPath
                key={`${startNode.id}-${endNode.id}`}
                start={startPos}
                end={endPos}
                isSelectable={startNode.id === currentMapNodeId}
              />
            );
          })
        )}

        {/* Render all nodes on top of the paths */}
        {Object.values(map.nodes).map((node) => (
          <MapNodeComponent
            key={node.id}
            node={node}
            isCurrent={node.id === currentMapNodeId}
            isSelectable={selectableNodeIds.includes(node.id)}
            onClick={() => GameController.selectMapNode(node.id)}
          />
        ))}
      </svg>
    </div>
  );
}
