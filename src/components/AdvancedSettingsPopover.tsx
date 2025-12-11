import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GridSettings } from '@/types/sprite';

interface AdvancedSettingsPopoverProps {
  gridSettings: GridSettings;
  onGridChange: (settings: Partial<GridSettings>) => void;
  disabled?: boolean;
}

export function AdvancedSettingsPopover({ gridSettings, onGridChange, disabled }: AdvancedSettingsPopoverProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={disabled}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Advanced Grid Settings</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Advanced Settings
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Offset X</Label>
                <span className="text-xs font-mono text-muted-foreground">{gridSettings.offsetX}px</span>
              </div>
              <Slider
                value={[gridSettings.offsetX]}
                onValueChange={([value]) => onGridChange({ offsetX: value })}
                max={100}
                step={1}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Offset Y</Label>
                <span className="text-xs font-mono text-muted-foreground">{gridSettings.offsetY}px</span>
              </div>
              <Slider
                value={[gridSettings.offsetY]}
                onValueChange={([value]) => onGridChange({ offsetY: value })}
                max={100}
                step={1}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Spacing X</Label>
                <span className="text-xs font-mono text-muted-foreground">{gridSettings.spacingX}px</span>
              </div>
              <Slider
                value={[gridSettings.spacingX]}
                onValueChange={([value]) => onGridChange({ spacingX: value })}
                max={20}
                step={1}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Spacing Y</Label>
                <span className="text-xs font-mono text-muted-foreground">{gridSettings.spacingY}px</span>
              </div>
              <Slider
                value={[gridSettings.spacingY]}
                onValueChange={([value]) => onGridChange({ spacingY: value })}
                max={20}
                step={1}
                className="py-1"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
