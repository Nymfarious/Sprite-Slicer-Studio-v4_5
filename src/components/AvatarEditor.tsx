import { useState, useRef, useCallback, useEffect } from 'react';
import { Circle, Square, Octagon, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type AvatarShape = 'circle' | 'square' | 'octagon';

interface AvatarEditorProps {
  imageUrl: string;
  shape: AvatarShape;
  position: { x: number; y: number };
  onShapeChange: (shape: AvatarShape) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const SHAPE_ICONS: Record<AvatarShape, React.ComponentType<{ className?: string }>> = {
  circle: Circle,
  square: Square,
  octagon: Octagon,
};

const SHAPE_CLASSES: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
  octagon: 'clip-octagon',
};

export function AvatarEditor({
  imageUrl,
  shape,
  position,
  onShapeChange,
  onPositionChange,
}: AvatarEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Clamp values to reasonable range (-50 to 50)
    onPositionChange({
      x: Math.max(-50, Math.min(50, newX)),
      y: Math.max(-50, Math.min(50, newY)),
    });
  }, [isDragging, dragStart, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="space-y-3">
      {/* Preview with drag capability */}
      <div className="flex items-center gap-4">
        <div
          ref={containerRef}
          className={cn(
            "w-16 h-16 overflow-hidden cursor-move relative border-2 border-dashed border-border hover:border-primary transition-colors",
            SHAPE_CLASSES[shape],
            isDragging && "border-primary"
          )}
          onMouseDown={handleMouseDown}
        >
          <img
            src={imageUrl}
            alt="Avatar preview"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(1.2)`,
            }}
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <Move className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Drag to reposition</p>
          <p className="font-mono mt-1">
            x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Shape selection */}
      <div className="space-y-2">
        <Label className="text-xs">Avatar Shape</Label>
        <div className="flex gap-1">
          {(Object.keys(SHAPE_ICONS) as AvatarShape[]).map((s) => {
            const Icon = SHAPE_ICONS[s];
            return (
              <Button
                key={s}
                variant={shape === s ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onShapeChange(s)}
                title={s.charAt(0).toUpperCase() + s.slice(1)}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      {(position.x !== 0 || position.y !== 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => onPositionChange({ x: 0, y: 0 })}
        >
          Reset Position
        </Button>
      )}

      {/* CSS for octagon clip */}
      <style>{`
        .clip-octagon {
          clip-path: polygon(
            30% 0%, 70% 0%, 100% 30%, 100% 70%,
            70% 100%, 30% 100%, 0% 70%, 0% 30%
          );
        }
      `}</style>
    </div>
  );
}

// Standalone Avatar Display component
interface AvatarDisplayProps {
  imageUrl?: string;
  shape?: AvatarShape;
  position?: { x: number; y: number };
  size?: 'sm' | 'md' | 'lg';
  fallback?: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export function AvatarDisplay({
  imageUrl,
  shape = 'circle',
  position = { x: 0, y: 0 },
  size = 'md',
  fallback,
  className,
}: AvatarDisplayProps) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-secondary flex items-center justify-center",
        SIZE_CLASSES[size],
        SHAPE_CLASSES[shape],
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(1.2)`,
          }}
        />
      ) : (
        fallback
      )}
      
      {/* Octagon clip style */}
      <style>{`
        .clip-octagon {
          clip-path: polygon(
            30% 0%, 70% 0%, 100% 30%, 100% 70%,
            70% 100%, 30% 100%, 0% 70%, 0% 30%
          );
        }
      `}</style>
    </div>
  );
}
