import { create } from "zustand";
import { NodeType, ConnectionType, SimulationSettings } from "@/types/diagram";

const MAX_HISTORY_SIZE = 25;

interface DiagramState {
  title: string;
  nodes: NodeType[];
  connections: ConnectionType[];
  simulationSettings: SimulationSettings;
  selectedNode: string | null;
  connectingFrom: string | null;
  // History
  past: Array<{
    nodes: NodeType[];
    connections: ConnectionType[];
    title: string;
  }>;
  future: Array<{
    nodes: NodeType[];
    connections: ConnectionType[];
    title: string;
  }>;
  // Actions
  setTitle: (title: string) => void;
  setNodes: (nodes: NodeType[]) => void;
  setConnections: (connections: ConnectionType[]) => void;
  setSimulationSettings: (settings: SimulationSettings) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setConnectingFrom: (nodeId: string | null) => void;
  // History actions
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  addNode: (position: { x: number; y: number }) => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  title: "Untitled Diagram",
  nodes: [],
  connections: [],
  simulationSettings: {
    totalDuration: 60,
    interval: 15,
  },
  selectedNode: null,
  connectingFrom: null,
  past: [],
  future: [],

  setTitle: (title) => set({ title }),
  setNodes: (nodes) => set({ nodes }),
  setConnections: (connections) => set({ connections }),
  setSimulationSettings: (simulationSettings) => set({ simulationSettings }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setConnectingFrom: (connectingFrom) => set({ connectingFrom }),

  pushToHistory: () => {
    const { nodes, connections, title } = get();
    set((state) => {
      const newPast = [...state.past, { nodes, connections, title }];
      // Keep only the last MAX_HISTORY_SIZE entries
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        future: [], // Clear future when new action is performed
      };
    });
  },

  undo: () => {
    const { past, future, nodes, connections, title } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [{ nodes, connections, title }, ...future],
      nodes: previous.nodes,
      connections: previous.connections,
      title: previous.title,
    });
  },

  redo: () => {
    const { past, future, nodes, connections, title } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, { nodes, connections, title }],
      future: newFuture,
      nodes: next.nodes,
      connections: next.connections,
      title: next.title,
    });
  },

  addNode: (position: { x: number; y: number }) => {
    const nodes = get().nodes;
    const nodeCount = nodes.length + 1;
    const newNode: NodeType = {
      id: `node-${Date.now()}`,
      label: `Node ${nodeCount}`,
      position,
      data: { label: `Node ${nodeCount}` },
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    get().pushToHistory();
  },
}));
