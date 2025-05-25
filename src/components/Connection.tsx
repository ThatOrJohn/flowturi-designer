
import React from 'react';

interface ConnectionProps {
  source: { x: number; y: number };
  target: { x: number; y: number };
  onClick?: () => void;
}

const Connection = ({ source, target, onClick }: ConnectionProps) => {
  // Calculate the center points of the nodes (assuming 128px width, 80px height)
  const sourceX = source.x + 128; // right edge of source node
  const sourceY = source.y + 40;  // middle of source node
  const targetX = target.x;       // left edge of target node
  const targetY = target.y + 40;  // middle of target node

  // Create a curved path
  const midX = (sourceX + targetX) / 2;
  const pathData = `M ${sourceX} ${sourceY} Q ${midX} ${sourceY} ${midX} ${(sourceY + targetY) / 2} Q ${midX} ${targetY} ${targetX} ${targetY}`;

  return (
    <g>
      <path
        d={pathData}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        className="drop-shadow-sm"
      />
      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#3b82f6"
          />
        </marker>
      </defs>
      <path
        d={pathData}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="cursor-pointer hover:stroke-red-500 transition-colors"
        onClick={onClick}
        style={{ pointerEvents: 'stroke' }}
      />
    </g>
  );
};

export default Connection;
