import { Trash2, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FreeformTool, SliceLine, SliceRegion, AISuggestion, tools } from './types';

interface FreeformToolbarProps {
  selectedTool: FreeformTool;
  expectedSpriteCount: number;
  lines: SliceLine[];
  regions: SliceRegion[];
  suggestions: AISuggestion[];
  onToolChange: (tool: FreeformTool) => void;
  onSpriteCountChange: (count: number) => void;
  onSmartDetect: () => void;
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onClearAll: () => void;
  isDetecting: boolean;
}

export function FreeformSlicingToolbar({
  selectedTool,
  expectedSpriteCount,
  lines,
  regions,
  suggestions,
  onToolChange,
  onSpriteCountChange,
  onSmartDetect,
  onAcceptSuggestion,
  onRejectSuggestion,
  onClearAll,
  isDetecting,
}: FreeformToolbarProps) {
  const pendingSuggestions = suggestions.filter(s => s.accepted === null);
  
  return (
    <div className="space-y-3">
      {/* Tool Selection */}
      <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg">
        {tools.map(tool => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTool === tool.id ? 'default' : 'ghost'}
                size="icon"
                className={`h-8 w-8 ${selectedTool === tool.id ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => onToolChange(tool.id)}
              >
                <tool.icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {tool.label}
              {tool.shortcut && <span className="ml-2 opacity-60">({tool.shortcut})</span>}
            </TooltipContent>
          </Tooltip>
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onClearAll}
              disabled={lines.length === 0 && regions.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Clear All Lines & Regions
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Expected Sprite Count */}
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground whitespace-nowrap">
          Expected sprites:
        </Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={expectedSpriteCount}
          onChange={(e) => onSpriteCountChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="h-7 w-16 text-xs font-mono"
        />
        <Badge variant="outline" className="text-xs">
          {lines.length} lines • {regions.length} regions
        </Badge>
      </div>

      {/* Smart Detect Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSmartDetect}
        disabled={isDetecting}
        className="w-full relative overflow-hidden"
      >
        <Sparkles className={`w-4 h-4 mr-2 ${isDetecting ? 'animate-pulse text-warning' : 'text-primary'}`} />
        {isDetecting ? 'Analyzing boundaries...' : 'Smart Detect Boundaries'}
        {isDetecting && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
        )}
      </Button>

      {/* AI Suggestions */}
      {pendingSuggestions.length > 0 && (
        <div className="space-y-2 p-2 bg-warning/10 rounded-lg border border-warning/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-warning">
              {pendingSuggestions.length} AI Suggestion{pendingSuggestions.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-success hover:text-success"
                onClick={() => pendingSuggestions.forEach(s => onAcceptSuggestion(s.id))}
              >
                <Check className="w-3 h-3 mr-1" />
                Accept All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive hover:text-destructive"
                onClick={() => pendingSuggestions.forEach(s => onRejectSuggestion(s.id))}
              >
                <X className="w-3 h-3 mr-1" />
                Reject All
              </Button>
            </div>
          </div>
          
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {pendingSuggestions.slice(0, 5).map(suggestion => (
              <div 
                key={suggestion.id}
                className="flex items-center justify-between text-xs py-1 px-2 bg-background/50 rounded"
              >
                <span>
                  {suggestion.type === 'line' ? '━' : '▢'} 
                  <span className="ml-1 opacity-70">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-success hover:text-success"
                    onClick={() => onAcceptSuggestion(suggestion.id)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={() => onRejectSuggestion(suggestion.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingSuggestions.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{pendingSuggestions.length - 5} more...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-[10px] text-muted-foreground space-y-0.5">
        {selectedTool === 'select' && <p>Click lines/regions to select, drag to move</p>}
        {selectedTool === 'h-line' && <p>Click to place horizontal line, drag endpoints to adjust</p>}
        {selectedTool === 'v-line' && <p>Click to place vertical line, drag endpoints to adjust</p>}
        {selectedTool === 'rectangle' && <p>Click and drag to draw rectangle selection</p>}
        {selectedTool === 'lasso' && <p>Click and drag to draw freeform selection</p>}
        {selectedTool === 'polygon' && <p>Click to add points, double-click to close polygon</p>}
      </div>
    </div>
  );
}
