
import React from 'react';
import { NodeType } from '@/types/diagram';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NodePropertiesPanelProps {
  node: NodeType | null;
  onNodeUpdate: (nodeId: string, updates: Partial<NodeType>) => void;
}

const NodePropertiesPanel = ({ node, onNodeUpdate }: NodePropertiesPanelProps) => {
  if (!node) {
    return (
      <div className="w-64 bg-background border-t border-border p-3">
        <h3 className="text-sm font-semibold mb-2">Node Properties</h3>
        <p className="text-xs text-muted-foreground">Select a node to edit its properties</p>
      </div>
    );
  }

  const handleFlowTypeChange = (value: string) => {
    onNodeUpdate(node.id, { flowType: value as 'batch' | 'stream' });
  };

  const handleVolumeChange = (value: string) => {
    onNodeUpdate(node.id, { volume: value as 'tiny' | 'small' | 'medium' | 'large' | 'x-large' });
  };

  return (
    <div className="w-64 bg-background border-t border-border p-3">
      <h3 className="text-sm font-semibold mb-3">Node Properties</h3>
      
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Node Type</Label>
          <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
        </div>
        
        <div>
          <Label className="text-xs font-medium">Label</Label>
          <p className="text-xs text-muted-foreground">{node.label}</p>
        </div>
        
        <div>
          <Label htmlFor="flowType" className="text-xs">Flow Type</Label>
          <Select value={node.flowType || ''} onValueChange={handleFlowTypeChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select flow type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="batch">Batch</SelectItem>
              <SelectItem value="stream">Stream</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="volume" className="text-xs">Relative Volume</Label>
          <Select value={node.volume || ''} onValueChange={handleVolumeChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select volume" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiny">Tiny</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="x-large">X-Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;
