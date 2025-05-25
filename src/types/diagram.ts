export interface NodeType {
  id: string;
  label: string;
  position: { x: number; y: number };
  data?: { label: string };
  type?: string;
  flowType?: "batch" | "stream";
  volume?: "tiny" | "small" | "medium" | "large" | "x-large";
}

export interface ConnectionType {
  id: string;
  source: string;
  target: string;
}

export interface PaletteNodeType {
  type: "source" | "intermediate" | "sink";
  label: string;
  description: string;
  icon: string;
}

export interface SimulationSettings {
  totalDuration: number; // in minutes
  interval: number; // in seconds
}
