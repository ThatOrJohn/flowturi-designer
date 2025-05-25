import React, { useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import NodePalette from "./NodePalette";
import Canvas from "./Canvas";
import NodePropertiesPanel from "./NodePropertiesPanel";
import SettingsPanel from "./SettingsPanel";
import ThemeToggle from "./ThemeToggle";
import { NodeType, ConnectionType, SimulationSettings } from "@/types/diagram";
import { Factory, Cpu, Target, Save, Undo, Redo } from "lucide-react";
import { generateHistoricalData, saveHistoricalData } from "@/utils/export";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useDiagramStore } from "@/store/diagramStore";

const DiagramEditor = () => {
  const {
    nodes,
    connections,
    selectedNode,
    connectingFrom,
    simulationSettings,
    title,
    setNodes,
    setConnections,
    setSelectedNode,
    setConnectingFrom,
    setSimulationSettings,
    setTitle,
    pushToHistory,
    undo,
    redo,
    past,
    future,
  } = useDiagramStore();

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over, delta } = event;

      if (!over || over.id !== "canvas") return;

      const nodeType = active.data.current?.type;
      if (!nodeType) return;

      const canvasElement = document.getElementById("canvas");
      if (!canvasElement) return;

      const canvasRect = canvasElement.getBoundingClientRect();

      // Use the delta from drag start to calculate the final position
      const initialRect = active.rect.current.initial;
      const finalX = initialRect.left + delta.x - canvasRect.left - 72; // Center the node (144/2 = 72)
      const finalY = initialRect.top + delta.y - canvasRect.top - 48; // Center the node (96/2 = 48)

      const dropPosition = {
        x: Math.max(0, Math.min(canvasRect.width - 144, finalX)),
        y: Math.max(0, Math.min(canvasRect.height - 96, finalY)),
      };

      // Count existing nodes of this type
      const typeLabelMap: Record<string, string> = {
        source: "Source",
        intermediate: "Process",
        sink: "Sink",
      };
      const typeLabel = typeLabelMap[nodeType] || "Node";
      const typeCount = nodes.filter((n) => n.type === nodeType).length + 1;
      const newNode: NodeType = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position: dropPosition,
        label: `${typeLabel} ${typeCount}`,
      };

      setNodes([...nodes, newNode]);
      setSelectedNode(newNode.id);
      pushToHistory();
    },
    [nodes, setNodes, setSelectedNode, pushToHistory]
  );

  const handleNodeMove = useCallback(
    (nodeId: string, newPosition: { x: number; y: number }) => {
      setNodes(
        nodes.map((node) =>
          node.id === nodeId ? { ...node, position: newPosition } : node
        )
      );
      pushToHistory();
    },
    [nodes, setNodes, pushToHistory]
  );

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId || null);
      setConnectingFrom(null);
    },
    [setSelectedNode, setConnectingFrom]
  );

  const handleNodeRename = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes(
        nodes.map((node) =>
          node.id === nodeId ? { ...node, label: newLabel } : node
        )
      );
      pushToHistory();
    },
    [nodes, setNodes, pushToHistory]
  );

  const handleConnectionStart = useCallback(
    (nodeId: string) => {
      if (connectingFrom === nodeId) {
        setConnectingFrom(null);
      } else {
        setConnectingFrom(nodeId);
      }
    },
    [connectingFrom, setConnectingFrom]
  );

  const handleConnectionEnd = useCallback(
    (targetNodeId: string) => {
      if (connectingFrom && connectingFrom !== targetNodeId) {
        const connectionExists = connections.some(
          (conn) =>
            (conn.source === connectingFrom && conn.target === targetNodeId) ||
            (conn.source === targetNodeId && conn.target === connectingFrom)
        );

        if (!connectionExists) {
          const newConnection: ConnectionType = {
            id: `connection-${Date.now()}`,
            source: connectingFrom,
            target: targetNodeId,
          };
          setConnections([...connections, newConnection]);
          pushToHistory();
        }
      }
      setConnectingFrom(null);
    },
    [
      connectingFrom,
      connections,
      setConnections,
      setConnectingFrom,
      pushToHistory,
    ]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nodes.filter((node) => node.id !== nodeId));
      setConnections(
        connections.filter(
          (conn) => conn.source !== nodeId && conn.target !== nodeId
        )
      );
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
      setConnectingFrom(null);
      pushToHistory();
    },
    [
      nodes,
      connections,
      selectedNode,
      setNodes,
      setConnections,
      setSelectedNode,
      setConnectingFrom,
      pushToHistory,
    ]
  );

  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      setConnections(connections.filter((conn) => conn.id !== connectionId));
      pushToHistory();
    },
    [connections, setConnections, pushToHistory]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, updates: Partial<NodeType>) => {
      setNodes(
        nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        )
      );
      pushToHistory();
    },
    [nodes, setNodes, pushToHistory]
  );

  const handleSave = useCallback(() => {
    const historicalData = generateHistoricalData(
      nodes,
      connections,
      simulationSettings
    );
    saveHistoricalData(historicalData, title);
  }, [nodes, connections, simulationSettings, title]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      pushToHistory();
    },
    [setTitle, pushToHistory]
  );

  const selectedNodeData = selectedNode
    ? nodes.find((n) => n.id === selectedNode)
    : null;

  const getDragOverlayContent = () => {
    if (!activeId) return null;

    const nodeType = activeId.replace("palette-", "") as
      | "source"
      | "intermediate"
      | "sink";

    const getIcon = () => {
      switch (nodeType) {
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
      switch (nodeType) {
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

    return (
      <div
        className={`
        w-36 h-24 rounded-lg border-2 p-3
        bg-gradient-to-br ${getNodeColor()} text-white
        shadow-xl opacity-90
      `}
      >
        <div className="flex items-center space-x-2 h-full">
          {getIcon()}
          <div className="flex-1">
            <div className="text-sm font-semibold truncate">
              {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node
            </div>
            <div className="text-xs opacity-90 capitalize">{nodeType}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-background">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col">
          <NodePalette />
          <NodePropertiesPanel
            node={selectedNodeData}
            onNodeUpdate={handleNodeUpdate}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="bg-background border-b border-border px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1 max-w-xl">
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  className="text-2xl font-bold h-12"
                  placeholder="Untitled Diagram"
                />
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={past.length === 0}
                  className="flex items-center gap-2"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={future.length === 0}
                  className="flex items-center gap-2"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Generate Flowturi Data
                </Button>
                <ThemeToggle />
                <SettingsPanel
                  simulationSettings={simulationSettings}
                  onSimulationSettingsChange={setSimulationSettings}
                />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Drag nodes from palette to canvas. Double-click to rename. Click
              to select. Right-click to remove. Shift+click to connect nodes.
            </p>
          </div>
          <Canvas
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            connectingFrom={connectingFrom}
            onNodeMove={handleNodeMove}
            onNodeSelect={handleNodeSelect}
            onNodeRename={handleNodeRename}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onDeleteNode={handleDeleteNode}
            onDeleteConnection={handleDeleteConnection}
          />
        </div>
        <DragOverlay>{getDragOverlayContent()}</DragOverlay>
      </DndContext>
    </div>
  );
};

export default DiagramEditor;
