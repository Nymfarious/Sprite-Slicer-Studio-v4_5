import { Rows, Columns } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GridSettings, UploadedImage } from '@/types/sprite';
import { useEffect, useCallback } from 'react';
import { GridSettingsIcon } from './GridSettingsIcon';

interface GridControlsProps {
  gridSettings: GridSettings;
  uploadedImage: UploadedImage | null;
  onGridChange: (settings: Partial<GridSettings>) => void;
}

export function GridControls({ gridSettings, uploadedImage, onGridChange }: GridControlsProps) {
  // Auto-calculate cell dimensions when columns/rows change
  useEffect(() => {
    if (uploadedImage) {
      const cellWidth = Math.floor((uploadedImage.width - gridSettings.offsetX) / gridSettings.columns);
      const cellHeight = Math.floor((uploadedImage.height - gridSettings.offsetY) / gridSettings.rows);
      if (cellWidth !== gridSettings.cellWidth || cellHeight !== gridSettings.cellHeight) {
        onGridChange({ cellWidth, cellHeight });
      }
    }
  }, [gridSettings.columns, gridSettings.rows, uploadedImage, gridSettings.offsetX, gridSettings.offsetY]);

  // Mouse wheel handlers for columns/rows
  const handleColumnsWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    onGridChange({ columns: Math.max(1, Math.min(50, gridSettings.columns + delta)) });
  }, [gridSettings.columns, onGridChange]);

  const handleRowsWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    onGridChange({ rows: Math.max(1, Math.min(50, gridSettings.rows + delta)) });
  }, [gridSettings.rows, onGridChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <GridSettingsIcon className="w-4 h-4 text-primary" />
        <span>Grid Settings</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="space-y-1.5"
              onWheel={handleColumnsWheel}
            >
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Columns className="w-3 h-3" />
                Columns
              </Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={gridSettings.columns}
                onChange={(e) => onGridChange({ columns: Math.max(1, parseInt(e.target.value) || 1) })}
                className="h-8 bg-input border-border font-mono text-sm"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Scroll to adjust
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="space-y-1.5"
              onWheel={handleRowsWheel}
            >
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Rows className="w-3 h-3" />
                Rows
              </Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={gridSettings.rows}
                onChange={(e) => onGridChange({ rows: Math.max(1, parseInt(e.target.value) || 1) })}
                className="h-8 bg-input border-border font-mono text-sm"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Scroll to adjust
          </TooltipContent>
        </Tooltip>
      </div>

      {uploadedImage && (
        <div className="text-xs text-muted-foreground font-mono bg-secondary/30 rounded px-2 py-1.5">
          Cell: {gridSettings.cellWidth} × {gridSettings.cellHeight}px
        </div>
      )}

    </div>
  );
}
