import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { PaletteNodeType } from "@/types/diagram";
import { Factory, Cpu, Target } from "lucide-react";
import { useDiagramStore } from "@/store/diagramStore";
import { NodeType } from "@/types/diagram";
import TitlePanel from "./TitlePanel";

const paletteNodes: PaletteNodeType[] = [
  {
    type: "source",
    label: "Source",
    description: "Input node",
    icon: "factory",
  },
  {
    type: "intermediate",
    label: "Process",
    description: "Intermediate node",
    icon: "cpu",
  },
  {
    type: "sink",
    label: "Sink",
    description: "Sink node",
    icon: "target",
  },
];

const PaletteNode = ({ node }: { node: PaletteNodeType }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${node.type}`,
      data: {
        type: node.type,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const getIcon = () => {
    switch (node.icon) {
      case "factory":
        return <Factory className="w-6 h-6" />;
      case "cpu":
        return <Cpu className="w-6 h-6" />;
      case "target":
        return <Target className="w-6 h-6" />;
      default:
        return <div className="w-6 h-6 bg-gray-400 rounded" />;
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
        return "from-gray-400 to-gray-600 border-gray-300";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab active:cursor-grabbing p-4 rounded-lg border-2 
        bg-gradient-to-br ${getNodeColor()} text-white
        hover:shadow-lg transition-all duration-200 hover:scale-105
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <div className="font-semibold text-sm">{node.label}</div>
          <div className="text-xs opacity-90">{node.description}</div>
        </div>
      </div>
    </div>
  );
};

const NodePalette = () => {
  const addNode = useDiagramStore((state) => state.addNode);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeType)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 border-r bg-background">
      <TitlePanel />
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Node Palette</h2>
        <div className="space-y-4">
          {paletteNodes.map((node) => (
            <PaletteNode key={node.type} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
