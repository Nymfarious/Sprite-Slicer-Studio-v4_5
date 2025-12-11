import { useState } from 'react';
import { Grid3X3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface GridPreset {
  name: string;
  columns: number;
  rows: number;
  description?: string;
}

const regularPresets: GridPreset[] = [
  { name: '2×2', columns: 2, rows: 2 },
  { name: '2×3', columns: 2, rows: 3 },
  { name: '3×2', columns: 3, rows: 2 },
  { name: '3×3', columns: 3, rows: 3 },
  { name: '4×4', columns: 4, rows: 4 },
  { name: '4×6', columns: 4, rows: 6 },
];

const irregularPresets: GridPreset[] = [
  { name: 'Top-heavy', columns: 3, rows: 2, description: '3 top / 2 bottom' },
  { name: 'Bottom-heavy', columns: 2, rows: 3, description: '2 top / 3 bottom' },
  { name: '5-die', columns: 2, rows: 3, description: '2-1-2 pattern' },
  { name: 'Wide', columns: 6, rows: 2, description: 'Horizontal strip' },
];

interface CookieCutterPopoverProps {
  disabled?: boolean;
  onPresetSelect: (columns: number, rows: number) => void;
  onAIDetect: () => void;
  isAnalyzing?: boolean;
}

export function CookieCutterPopover({ 
  disabled, 
  onPresetSelect, 
  onAIDetect,
  isAnalyzing 
}: CookieCutterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [customCols, setCustomCols] = useState('4');
  const [customRows, setCustomRows] = useState('4');

  const handlePresetClick = (columns: number, rows: number) => {
    onPresetSelect(columns, rows);
    setOpen(false);
  };

  const handleCustomApply = () => {
    const cols = parseInt(customCols) || 4;
    const rows = parseInt(customRows) || 4;
    onPresetSelect(cols, rows);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={disabled}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Cookie Cutter Presets</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Cookie Cutter Tool
          </div>
          
          {/* Regular presets in 2-column grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {regularPresets.map(preset => (
              <Button 
                key={preset.name}
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-mono justify-center"
                onClick={() => handlePresetClick(preset.columns, preset.rows)}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          <Separator className="bg-border" />

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Irregular Layouts
          </div>
          
          {/* Irregular presets in 2-column grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {irregularPresets.map(preset => (
              <Tooltip key={preset.name}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs justify-center"
                    onClick={() => handlePresetClick(preset.columns, preset.rows)}
                  >
                    {preset.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {preset.description}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator className="bg-border" />

          {/* AI Detection */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-xs"
            onClick={() => {
              onAIDetect();
              setOpen(false);
            }}
            disabled={isAnalyzing}
          >
            <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'AI Auto-Detect'}
          </Button>

          <Separator className="bg-border" />

          {/* Custom grid */}
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Custom Grid
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground">Cols</Label>
              <Input 
                type="number" 
                min="1" 
                max="20"
                value={customCols}
                onChange={(e) => setCustomCols(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <span className="text-muted-foreground mt-4">×</span>
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground">Rows</Label>
              <Input 
                type="number" 
                min="1" 
                max="20"
                value={customRows}
                onChange={(e) => setCustomRows(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <Button 
              size="sm" 
              className="h-7 mt-4 px-3 text-xs"
              onClick={handleCustomApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
