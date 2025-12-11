import { PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FreeformSlicingToolbar } from './freeform/FreeformToolbar';
import { FreeformTool, SliceLine, SliceRegion, AISuggestion } from './freeform/types';

interface FreeformPopoverProps {
  disabled?: boolean;
  freeformEnabled: boolean;
  selectedTool: FreeformTool;
  expectedSpriteCount: number;
  lines: SliceLine[];
  regions: SliceRegion[];
  suggestions: AISuggestion[];
  isDetecting: boolean;
  onToggle: () => void;
  onToolChange: (tool: FreeformTool) => void;
  onSpriteCountChange: (count: number) => void;
  onSmartDetect: () => void;
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onClearAll: () => void;
}

export function FreeformPopover({
  disabled,
  freeformEnabled,
  selectedTool,
  expectedSpriteCount,
  lines,
  regions,
  suggestions,
  isDetecting,
  onToggle,
  onToolChange,
  onSpriteCountChange,
  onSmartDetect,
  onAcceptSuggestion,
  onRejectSuggestion,
  onClearAll,
}: FreeformPopoverProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant={freeformEnabled ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
              onClick={(e) => {
                // If freeform is not enabled, just toggle it on
                if (!freeformEnabled) {
                  e.preventDefault();
                  onToggle();
                }
              }}
            >
              <PenTool className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-[200px]">
          <p className="font-medium">Freeform Mode</p>
          <p className="text-muted-foreground">Draw lines, rectangles, lasso, or polygon selections</p>
        </TooltipContent>
      </Tooltip>

      {freeformEnabled && (
        <PopoverContent align="start" className="w-72 bg-popover border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Freeform Slicing</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={onToggle}
              >
                Exit Mode
              </Button>
            </div>
            
            <FreeformSlicingToolbar
              selectedTool={selectedTool}
              expectedSpriteCount={expectedSpriteCount}
              lines={lines}
              regions={regions}
              suggestions={suggestions}
              onToolChange={onToolChange}
              onSpriteCountChange={onSpriteCountChange}
              onSmartDetect={onSmartDetect}
              onAcceptSuggestion={onAcceptSuggestion}
              onRejectSuggestion={onRejectSuggestion}
              onClearAll={onClearAll}
              isDetecting={isDetecting}
            />
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
