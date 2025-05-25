import React, { useRef, useCallback, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import CanvasNode from "./CanvasNode";
import Connection from "./Connection";
import { NodeType, ConnectionType } from "@/types/diagram";
import ContextMenu from "./ContextMenu";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface CanvasProps {
  nodes: NodeType[];
  connections: ConnectionType[];
  selectedNode: string | null;
  connectingFrom: string | null;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeSelect: (nodeId: string) => void;
  onNodeRename: (nodeId: string, newLabel: string) => void;
  onConnectionStart: (nodeId: string) => void;
  onConnectionEnd: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}

const GRID_SIZE = 20; // Size of grid cells in pixels

const Canvas = ({
  nodes,
  connections,
  selectedNode,
  connectingFrom,
  onNodeMove,
  onNodeSelect,
  onNodeRename,
  onConnectionStart,
  onConnectionEnd,
  onDeleteNode,
  onDeleteConnection,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    connectionId: string;
  } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onNodeSelect("");
      }
    },
    [onNodeSelect]
  );

  const handleConnectionContextMenu = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, connectionId });
    },
    []
  );

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const getConnectionPath = (source: NodeType, target: NodeType) => {
    const sourceX = source.position.x + 144; // Node width
    const sourceY = source.position.y + 48; // Half node height
    const targetX = target.position.x;
    const targetY = target.position.y + 48; // Half node height

    const controlPoint1X = sourceX + (targetX - sourceX) * 0.5;
    const controlPoint2X = sourceX + (targetX - sourceX) * 0.5;

    return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${sourceY}, ${controlPoint2X} ${targetY}, ${targetX} ${targetY}`;
  };

  return (
    <div
      id="canvas"
      ref={(node) => {
        setNodeRef(node);
        canvasRef.current = node;
      }}
      className={`flex-1 relative overflow-hidden bg-background transition-colors duration-100 ${
        isOver ? "bg-muted/50" : ""
      }`}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
          radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    >
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
        <Switch
          id="snap-to-grid"
          checked={snapToGrid}
          onCheckedChange={setSnapToGrid}
        />
        <Label htmlFor="snap-to-grid" className="text-sm">
          Snap to Grid
        </Label>
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {connections.map((connection) => {
          const sourceNode = nodes.find((n) => n.id === connection.source);
          const targetNode = nodes.find((n) => n.id === connection.target);
          if (!sourceNode || !targetNode) return null;

          return (
            <g
              key={connection.id}
              className="pointer-events-auto"
              onContextMenu={(e) =>
                handleConnectionContextMenu(e, connection.id)
              }
            >
              <path
                d={getConnectionPath(sourceNode, targetNode)}
                className="stroke-4 stroke-primary fill-none hover:stroke-primary/80 transition-colors"
                style={{ cursor: "context-menu" }}
              />
            </g>
          );
        })}
      </svg>

      {nodes.map((node) => (
        <CanvasNode
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          isConnecting={connectingFrom === node.id}
          isConnectTarget={
            connectingFrom !== null &&
            connectingFrom !== node.id &&
            !connections.some(
              (conn) =>
                (conn.source === connectingFrom && conn.target === node.id) ||
                (conn.source === node.id && conn.target === connectingFrom)
            )
          }
          onMove={(nodeId, position) => {
            onNodeMove(nodeId, {
              x: snapToGridValue(position.x),
              y: snapToGridValue(position.y),
            });
          }}
          onSelect={onNodeSelect}
          onRename={onNodeRename}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          onDelete={onDeleteNode}
        />
      ))}

      {connectingFrom && (
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg z-50">
          Click another node to connect
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={() => onDeleteConnection(contextMenu.connectionId)}
          type="connection"
        />
      )}
    </div>
  );
};

export default Canvas;
