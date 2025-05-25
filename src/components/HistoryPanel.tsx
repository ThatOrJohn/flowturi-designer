import React from "react";
import { useDiagramStore } from "@/store/diagramStore";
import { Button } from "./ui/button";
import { Undo, Redo } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { NodeType, ConnectionType } from "@/types/diagram";

const HistoryPanel = () => {
  const { past, future, undo, redo } = useDiagramStore();

  return (
    <div className="w-64 border-l border-border bg-background p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={past.length === 0}
            className="flex items-center gap-1"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={future.length === 0}
            className="flex items-center gap-1"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {past.map((state, index) => {
            const action = getActionDescription(
              state,
              index === past.length - 1 ? null : past[index + 1]
            );
            return (
              <div
                key={index}
                className="p-2 rounded bg-muted/50 text-sm hover:bg-muted cursor-pointer"
                onClick={() => {
                  // Jump to this state
                  for (let i = past.length - 1; i > index; i--) {
                    undo();
                  }
                }}
              >
                {action}
              </div>
            );
          })}
          {future.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">
                Future Actions
              </div>
              {future.map((state, index) => {
                const action = getActionDescription(
                  index === 0 ? past[past.length - 1] : future[index - 1],
                  state
                );
                return (
                  <div
                    key={index}
                    className="p-2 rounded bg-muted/30 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                    onClick={() => {
                      // Jump to this state
                      for (let i = 0; i <= index; i++) {
                        redo();
                      }
                    }}
                  >
                    {action}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

function getActionDescription(
  current: { nodes: NodeType[]; connections: ConnectionType[] },
  previous: { nodes: NodeType[]; connections: ConnectionType[] } | null
): string {
  if (!previous) return "Initial State";

  const nodeDiff = current.nodes.length - previous.nodes.length;
  const connectionDiff =
    current.connections.length - previous.connections.length;

  if (nodeDiff > 0) return `Added ${nodeDiff} node${nodeDiff > 1 ? "s" : ""}`;
  if (nodeDiff < 0)
    return `Removed ${Math.abs(nodeDiff)} node${
      Math.abs(nodeDiff) > 1 ? "s" : ""
    }`;
  if (connectionDiff > 0)
    return `Added ${connectionDiff} connection${connectionDiff > 1 ? "s" : ""}`;
  if (connectionDiff < 0)
    return `Removed ${Math.abs(connectionDiff)} connection${
      Math.abs(connectionDiff) > 1 ? "s" : ""
    }`;

  // Check for node movements or renames
  const movedNodes = current.nodes.filter((node, i) => {
    const prevNode = previous.nodes[i];
    return (
      prevNode &&
      (node.position.x !== prevNode.position.x ||
        node.position.y !== prevNode.position.y)
    );
  });
  if (movedNodes.length > 0)
    return `Moved ${movedNodes.length} node${movedNodes.length > 1 ? "s" : ""}`;

  const renamedNodes = current.nodes.filter((node, i) => {
    const prevNode = previous.nodes[i];
    return prevNode && node.label !== prevNode.label;
  });
  if (renamedNodes.length > 0)
    return `Renamed ${renamedNodes.length} node${
      renamedNodes.length > 1 ? "s" : ""
    }`;

  return "Modified diagram";
}

export default HistoryPanel;
