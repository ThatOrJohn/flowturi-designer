import React from "react";
import { Trash2, Edit2 } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onRename?: () => void;
  type: "node" | "connection";
}

const ContextMenu = ({
  x,
  y,
  onClose,
  onDelete,
  onRename,
  type,
}: ContextMenuProps) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {onRename && (
        <button
          className="w-full px-4 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
          onClick={() => {
            onRename();
            onClose();
          }}
        >
          <Edit2 className="w-4 h-4" />
          Rename
        </button>
      )}
      <button
        className="w-full px-4 py-2 text-sm text-left text-destructive hover:bg-muted flex items-center gap-2"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="w-4 h-4" />
        Delete {type}
      </button>
    </div>
  );
};

export default ContextMenu;
