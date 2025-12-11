import { useState } from 'react';
import { Square, Circle, Octagon, Lock, Unlock, Trash2, Check, X, Crop, RotateCcw, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { CropShape, CropMode, CropSelection } from './CropTool';

interface CropToolPopoverProps {
  isActive: boolean;
  onToggle: () => void;
  shape: CropShape;
  onShapeChange: (shape: CropShape) => void;
  mode: CropMode;
  onModeChange: (mode: CropMode) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  selection: CropSelection | null;
  onApply: () => void;
  onApplyAndSave?: () => void;
  onCancel: () => void;
  onClearSelection?: () => void;
  useGridSelection?: boolean;
  onUseGridSelectionChange?: (use: boolean) => void;
  hasGridSelection?: boolean;
  disabled?: boolean;
}

export function CropToolPopover({
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
  onApplyAndSave,
  onCancel,
  onClearSelection,
  useGridSelection,
  onUseGridSelectionChange,
  hasGridSelection,
  disabled = false,
}: CropToolPopoverProps) {
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
    <>
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

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant={isActive ? "default" : "ghost"} 
                size="icon" 
                className="h-8 w-8"
                disabled={disabled}
              >
                <Crop className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : ''}`} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {disabled ? 'Upload an image to use crop tool' : 'Quick Crop'}
          </TooltipContent>
        </Tooltip>
        <PopoverContent 
          side="bottom" 
          align="start" 
          className="w-auto p-3 bg-card border-border"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-muted-foreground tracking-wider">
                Quick Crop
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className={isActive ? 'border-primary text-primary hover:bg-primary/10' : ''}
              >
                <Crop className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-primary' : ''}`} />
                Crop
              </Button>
            </div>

            {/* Grid Selection Option */}
            {hasGridSelection && (
              <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
                <Checkbox
                  id="use-grid-selection-popover"
                  checked={useGridSelection}
                  onCheckedChange={handleGridSelectionChange}
                />
                <label
                  htmlFor="use-grid-selection-popover"
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
                      onClick={() => {
                        onShapeChange('rectangle');
                        if (!isActive) onToggle();
                      }}
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
                      onClick={() => {
                        onShapeChange('ellipse');
                        if (!isActive) onToggle();
                      }}
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
                      onClick={() => {
                        onShapeChange('octagon');
                        if (!isActive) onToggle();
                      }}
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
                    {isLocked ? 'Proportional' : 'Free resize'}
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
                      Remove unwanted artifacts or borders
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Selection Info & Actions */}
            {selection && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="font-mono">
                    {Math.round(selection.width)} × {Math.round(selection.height)}
                  </Badge>
                  <span className="text-muted-foreground">
                    at ({Math.round(selection.x)}, {Math.round(selection.y)})
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={onCancel}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onApply}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Apply
                  </Button>
                  {onApplyAndSave && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          onClick={onApplyAndSave}
                        >
                          <Library className="w-3.5 h-3.5 mr-1" />
                          Save
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        Apply crop and save to Library
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </>
            )}

            {/* Clear Selection Button */}
            {onClearSelection && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={onClearSelection}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear Selection
              </Button>
            )}

            {/* Instructions */}
            <p className="text-[10px] text-muted-foreground">
              Draw selection on canvas • Drag corners to resize • Press S to snap
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
