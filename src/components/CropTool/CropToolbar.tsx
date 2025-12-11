import { useState } from 'react';
import {
  Square,
  Circle,
  Octagon,
  Scissors,
  Trash2,
  Check,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CropToolbarProps } from './types';

export function CropToolbar({
  isActive,
  onToggle,
  shape,
  onShapeChange,
  mode,
  onModeChange,
  isLocked,
  onLockToggle,
  selection,
  onApply,
  onCancel,
  useGridSelection,
  onUseGridSelectionChange,
  hasGridSelection,
}: CropToolbarProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingGridSelection, setPendingGridSelection] = useState(false);

  const handleGridSelectionChange = (checked: boolean) => {
    if (checked) {
      setPendingGridSelection(true);
      setShowConfirmDialog(true);
    } else {
      onUseGridSelectionChange?.(false);
    }
  };

  const confirmGridSelection = () => {
    onUseGridSelectionChange?.(pendingGridSelection);
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground tracking-wider">
          Quick Crop
        </span>
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={onToggle}
          className={isActive ? 'bg-primary text-primary-foreground' : ''}
        >
          <Scissors className="w-3.5 h-3.5 mr-1.5" />
          {isActive ? 'Cropping' : 'Crop'}
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use Grid Selection for Cropping?</AlertDialogTitle>
            <AlertDialogDescription>
              This will use your current grid cell selections to define the crop area. 
              Any selected cells will be combined into a single crop region.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingGridSelection(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGridSelection}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isActive && (
        <div className="space-y-2 animate-fade-in">
          {/* Grid Selection Option */}
          {hasGridSelection && (
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
              <Checkbox
                id="use-grid-selection"
                checked={useGridSelection}
                onCheckedChange={handleGridSelectionChange}
              />
              <label
                htmlFor="use-grid-selection"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Use grid selections to define crop area
              </label>
            </div>
          )}

          {/* Shape Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">Shape:</span>
            <div className="flex gap-1 p-0.5 bg-secondary/50 rounded-md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={shape === 'rectangle' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onShapeChange('rectangle')}
                    disabled={useGridSelection}
                  >
                    <Square className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Rectangle <span className="opacity-60">(R)</span>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={shape === 'ellipse' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onShapeChange('ellipse')}
                    disabled={useGridSelection}
                  >
                    <Circle className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Ellipse <span className="opacity-60">(E)</span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={shape === 'octagon' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onShapeChange('octagon')}
                    disabled={useGridSelection}
                  >
                    <Octagon className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Octagon <span className="opacity-60">(O)</span>
                </TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-border mx-0.5" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isLocked ? 'default' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={onLockToggle}
                  >
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isLocked ? 'Proportional' : 'Free resize'} <span className="opacity-60">(S)</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Crop Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">Mode:</span>
            <div className="flex gap-1">
              <Button
                variant={mode === 'keep' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => onModeChange('keep')}
              >
                Inside
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === 'remove' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onModeChange('remove')}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Outside
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                  <p className="font-medium">Punch out selection</p>
                  <p className="text-muted-foreground">
                    Remove unwanted artifacts, borders, or empty space from your own artwork
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Selection Info */}
          {selection && (
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="font-mono">
                {Math.round(selection.width)} × {Math.round(selection.height)}
              </Badge>
              <span className="text-muted-foreground">
                at ({Math.round(selection.x)}, {Math.round(selection.y)})
              </span>
            </div>
          )}

          {/* Apply/Cancel Buttons */}
          {selection && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={onCancel}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={onApply}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Apply {mode === 'keep' ? 'Crop' : 'Removal'}
              </Button>
            </div>
          )}

          {/* Instructions */}
          <p className="text-[10px] text-muted-foreground">
            Draw selection on canvas • Drag corners to resize • Press S to snap to square/circle
          </p>
        </div>
      )}
    </div>
  );
}
