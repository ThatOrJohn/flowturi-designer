import React from "react";

interface TitlePanelProps {
  logo?: React.ReactNode;
}

const TitlePanel: React.FC<TitlePanelProps> = ({ logo }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b">
      {logo && <div className="w-6 h-6">{logo}</div>}
      <h1 className="text-lg font-semibold">Flowturi Designer</h1>
    </div>
  );
};

export default TitlePanel;
