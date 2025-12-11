import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Trash2, FlipHorizontal, FlipVertical } from "lucide-react";
import { Keyframe, EasingType, Transform } from "@/types/animation";
import { EasingCurvePreview } from "./EasingCurvePreview";
import { cn } from "@/lib/utils";

interface KeyframePropertiesPopoverProps {
  keyframe: Keyframe;
  onUpdateTransform: (transform: Partial<Transform>) => void;
  onUpdateTween: (tweenToNext: boolean, easing?: EasingType) => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export function KeyframePropertiesPopover({
  keyframe,
  onUpdateTransform,
  onUpdateTween,
  onDelete,
  children,
}: KeyframePropertiesPopoverProps) {
  const updateTransform = (key: keyof Transform, value: number) => {
    onUpdateTransform({ [key]: value });
  };

  const handleFlipH = () => {
    onUpdateTransform({ scaleX: keyframe.transform.scaleX * -1 });
  };

  const handleFlipV = () => {
    onUpdateTransform({ scaleY: keyframe.transform.scaleY * -1 });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" side="top" sideOffset={8}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Keyframe Properties</h4>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Frame {keyframe.frameIndex + 1}
            </span>
          </div>
          
          {/* Position */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Position</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground">X</Label>
                <Input
                  type="number"
                  value={keyframe.transform.x}
                  onChange={(e) => updateTransform('x', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground">Y</Label>
                <Input
                  type="number"
                  value={keyframe.transform.y}
                  onChange={(e) => updateTransform('y', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>
          </div>
          
          {/* Scale */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium">Scale</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round(keyframe.transform.scale * 100)}%
              </span>
            </div>
            <Slider
              value={[keyframe.transform.scale]}
              onValueChange={([v]) => updateTransform('scale', v)}
              min={0.1}
              max={3}
              step={0.05}
            />
          </div>

          {/* Flip buttons */}
          <div className="flex gap-2">
            <Button
              variant={keyframe.transform.scaleX < 0 ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8"
              onClick={handleFlipH}
            >
              <FlipHorizontal className="h-3 w-3 mr-1" />
              Flip H
            </Button>
            <Button
              variant={keyframe.transform.scaleY < 0 ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8"
              onClick={handleFlipV}
            >
              <FlipVertical className="h-3 w-3 mr-1" />
              Flip V
            </Button>
          </div>
          
          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium">Rotation</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {keyframe.transform.rotation}°
              </span>
            </div>
            <Slider
              value={[keyframe.transform.rotation]}
              onValueChange={([v]) => updateTransform('rotation', v)}
              min={-180}
              max={180}
              step={1}
            />
          </div>
          
          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium">Opacity</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round(keyframe.transform.opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[keyframe.transform.opacity]}
              onValueChange={([v]) => updateTransform('opacity', v)}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
          
          <div className="border-t pt-4 space-y-3">
            {/* Tween toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Weave to next</Label>
              <Switch
                checked={keyframe.tweenToNext}
                onCheckedChange={(checked) => onUpdateTween(checked, keyframe.easing)}
              />
            </div>
            
            {/* Easing selector with curve preview - only show if tweening enabled */}
            {keyframe.tweenToNext && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Easing</Label>
                  <EasingCurvePreview 
                    easing={keyframe.easing} 
                    width={60} 
                    height={36}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce', 'elastic'] as EasingType[]).map((easing) => (
                    <button
                      key={easing}
                      onClick={() => onUpdateTween(keyframe.tweenToNext, easing)}
                      className={cn(
                        "px-2 py-1.5 text-[10px] rounded border transition-colors",
                        keyframe.easing === easing
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-muted border-border"
                      )}
                    >
                      {easing.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Delete button */}
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Keyframe
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Tween marker component
export function TweenMarker({ 
  startFrame, 
  endFrame, 
  frameWidth,
  easing 
}: {
  startFrame: number;
  endFrame: number;
  frameWidth: number;
  easing: EasingType;
}) {
  const left = startFrame * frameWidth + frameWidth / 2 + 16;
  const width = (endFrame - startFrame) * frameWidth - 32;
  
  if (width <= 0) return null;
  
  // Different patterns for different easings
  const getPattern = () => {
    switch (easing) {
      case 'linear':
        return 'repeating-linear-gradient(90deg, transparent, transparent 4px, hsl(var(--primary)) 4px, hsl(var(--primary)) 8px)';
      case 'ease-in':
        return 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 100%)';
      case 'ease-out':
        return 'linear-gradient(90deg, hsl(var(--primary)) 0%, transparent 100%)';
      case 'ease-in-out':
        return 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)';
      case 'bounce':
        return 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 3px, transparent 3px, transparent 6px, hsl(var(--primary)) 6px, hsl(var(--primary)) 12px, transparent 12px, transparent 15px)';
      case 'elastic':
        return 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0px, transparent 2px, hsl(var(--primary)) 4px, transparent 6px, hsl(var(--primary)) 8px)';
      default:
        return 'hsl(var(--primary))';
    }
  };
  
  return (
    <div
      className="absolute top-1/2 h-1 -translate-y-1/2 pointer-events-none rounded-full opacity-60"
      style={{ 
        left, 
        width,
        background: getPattern(),
      }}
    />
  );
}
