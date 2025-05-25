import { NodeType, ConnectionType, SimulationSettings } from "@/types/diagram";

export interface FlowturiHistoricalData {
  timestamp: string;
  tick: number;
  nodes: { name: string }[];
  links: { source: string; target: string; value: number }[];
}

export function generateHistoricalData(
  nodes: NodeType[],
  connections: ConnectionType[],
  settings: SimulationSettings
): FlowturiHistoricalData[] {
  const data: FlowturiHistoricalData[] = [];
  const startTime = new Date();
  const intervalMs = settings.interval * 1000; // Convert seconds to milliseconds
  const totalTicks = Math.ceil(
    (settings.totalDuration * 60) / settings.interval
  ); // Convert minutes to seconds, then divide by interval

  for (let tick = 0; tick < totalTicks; tick++) {
    const timestamp = new Date(startTime.getTime() + tick * intervalMs);
    const nodeData = nodes.map((node) => ({ name: node.label }));
    const linkData = connections.map((conn) => {
      const sourceNode = nodes.find((n) => n.id === conn.source);
      const targetNode = nodes.find((n) => n.id === conn.target);
      return {
        source: sourceNode?.label || "",
        target: targetNode?.label || "",
        value: Math.floor(Math.random() * 100), // Random integer value for demo
      };
    });

    data.push({
      timestamp: timestamp.toISOString().slice(0, 19).replace("T", " "), // Format: "YYYY-MM-DD HH:mm:ss"
      tick: tick + 1,
      nodes: nodeData,
      links: linkData,
    });
  }

  return data;
}

export function saveHistoricalData(
  data: FlowturiHistoricalData[],
  title: string
): void {
  // Convert title to filename-safe string
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes

  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeTitle}-historical-data.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(data: FlowturiHistoricalData[]): string {
  const headers = ["timestamp", "source", "target", "value"];
  const rows = data.flatMap((tick) =>
    tick.links.map((link) => [
      tick.timestamp,
      link.source,
      link.target,
      link.value.toString(),
    ])
  );

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
