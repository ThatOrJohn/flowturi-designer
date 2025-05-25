import React, { useRef, useCallback, useState } from "react";
import { NodeType } from "@/types/diagram";
import { Factory, Cpu, Target } from "lucide-react";
import ContextMenu from "./ContextMenu";

interface CanvasNodeProps {
  node: NodeType;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectTarget: boolean;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onSelect: (nodeId: string) => void;
  onConnectionStart: (nodeId: string) => void;
  onConnectionEnd: (nodeId: string) => void;
  onRename: (nodeId: string, newLabel: string) => void;
  onDelete: (nodeId: string) => void;
}

const CanvasNode = ({
  node,
  isSelected,
  isConnecting,
  isConnectTarget,
  onMove,
  onSelect,
  onConnectionStart,
  onConnectionEnd,
  onRename,
  onDelete,
}: CanvasNodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const nodeStartPos = useRef({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.label);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onSelect(node.id);

      if (e.shiftKey) {
        if (isConnectTarget) {
          onConnectionEnd(node.id);
        } else {
          onConnectionStart(node.id);
        }
        return;
      }

      isDragging.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      nodeStartPos.current = { x: node.position.x, y: node.position.y };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || isEditing) return;

        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        const newPosition = {
          x: Math.max(0, nodeStartPos.current.x + deltaX),
          y: Math.max(0, nodeStartPos.current.y + deltaY),
        };

        onMove(node.id, newPosition);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [
      node,
      onMove,
      onSelect,
      onConnectionStart,
      onConnectionEnd,
      isConnectTarget,
      isEditing,
    ]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleEditSubmit = useCallback(() => {
    if (editValue.trim() && editValue !== node.label) {
      onRename(node.id, editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, node.id, node.label, onRename]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        handleEditSubmit();
      } else if (e.key === "Escape") {
        setEditValue(node.label);
        setIsEditing(false);
      }
    },
    [handleEditSubmit, node.label]
  );

  const getIcon = () => {
    switch (node.type) {
      case "source":
        return <Factory className="w-5 h-5" />;
      case "intermediate":
        return <Cpu className="w-5 h-5" />;
      case "sink":
        return <Target className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5 bg-muted rounded" />;
    }
  };

  const getNodeColor = () => {
    switch (node.type) {
      case "source":
        return "from-green-400 to-green-600 border-green-300";
      case "intermediate":
        return "from-blue-400 to-blue-600 border-blue-300";
      case "sink":
        return "from-purple-400 to-purple-600 border-purple-300";
      default:
        return "from-muted to-muted-foreground border-border";
    }
  };

  const showLeftConnection =
    node.type === "intermediate" || node.type === "sink";
  const showRightConnection =
    node.type === "source" || node.type === "intermediate";

  return (
    <>
      <div
        ref={nodeRef}
        className={`
          absolute cursor-move select-none
          w-36 h-24 rounded-lg border-2 p-3
          bg-gradient-to-br ${getNodeColor()} text-white
          hover:shadow-lg transition-shadow duration-200
          ${
            isSelected ? "ring-4 ring-yellow-300 ring-opacity-50 shadow-xl" : ""
          }
          ${isConnecting ? "ring-4 ring-blue-400 ring-opacity-70" : ""}
          ${
            isConnectTarget
              ? "ring-4 ring-green-400 ring-opacity-70 animate-pulse"
              : ""
          }
          ${isEditing ? "cursor-text" : ""}
        `}
        style={{
          left: node.position.x,
          top: node.position.y,
          zIndex: isSelected ? 20 : 10,
        }}
        onMouseDown={!isEditing ? handleMouseDown : undefined}
        onContextMenu={handleContextMenu}
        onDoubleClick={() => {
          setIsEditing(true);
          setEditValue(node.label);
        }}
      >
        <div className="flex items-start space-x-2 h-full">
          {getIcon()}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={handleEditKeyDown}
                className="text-sm font-semibold bg-transparent border-none outline-none text-white w-full"
                autoFocus
                maxLength={20}
              />
            ) : (
              <div className="text-sm font-semibold truncate">{node.label}</div>
            )}
            <div className="text-xs opacity-90 capitalize">{node.type}</div>
            {(node.flowType || node.volume) && (
              <div className="text-xs opacity-75 mt-1">
                {node.flowType && (
                  <span className="capitalize">{node.flowType}</span>
                )}
                {node.flowType && node.volume && <span> • </span>}
                {node.volume && (
                  <span className="capitalize">{node.volume}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {(isSelected || isConnecting || isConnectTarget) && (
          <>
            {showLeftConnection && (
              <div
                className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 
                           bg-white border-2 border-current rounded-full"
              />
            )}
            {showRightConnection && (
              <div
                className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 
                           bg-white border-2 border-current rounded-full"
              />
            )}
          </>
        )}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={() => onDelete(node.id)}
          onRename={() => {
            setIsEditing(true);
            setEditValue(node.label);
          }}
          type="node"
        />
      )}
    </>
  );
};

export default CanvasNode;
