import React from "react";
import { SimulationSettings } from "@/types/diagram";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SettingsPanelProps {
  simulationSettings: SimulationSettings;
  onSimulationSettingsChange: (settings: SimulationSettings) => void;
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes (1 hour)" },
  { value: 120, label: "120 minutes (2 hours)" },
  { value: 240, label: "240 minutes (4 hours)" },
  { value: 480, label: "480 minutes (8 hours)" },
  { value: 720, label: "720 minutes (12 hours)" },
  { value: 1440, label: "1440 minutes (24 hours)" },
];

const INTERVAL_OPTIONS = [
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
];

const SettingsPanel = ({
  simulationSettings,
  onSimulationSettingsChange,
}: SettingsPanelProps) => {
  const handleDurationChange = (value: string) => {
    onSimulationSettingsChange({
      ...simulationSettings,
      totalDuration: parseInt(value),
    });
  };

  const handleIntervalChange = (value: string) => {
    onSimulationSettingsChange({
      ...simulationSettings,
      interval: parseInt(value),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Total Duration</Label>
            <Select
              value={simulationSettings.totalDuration.toString()}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Interval</Label>
            <Select
              value={simulationSettings.interval.toString()}
              onValueChange={handleIntervalChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPanel;
