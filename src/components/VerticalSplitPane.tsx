import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface VerticalSplitPaneProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  defaultBottomHeight?: number;
  minBottomHeight?: number;
  maxBottomHeightPercent?: number;
  className?: string;
  storageKey?: string;
}

export function VerticalSplitPane({
  top,
  bottom,
  defaultBottomHeight = 200,
  minBottomHeight = 120,
  maxBottomHeightPercent = 70,
  className = '',
  storageKey = 'vertical-split-height',
}: VerticalSplitPaneProps) {
  // Store bottom height in pixels - anchored to bottom of screen
  const [bottomHeight, setBottomHeight] = useLocalStorage<number>(
    storageKey + '-bottom-px', 
    defaultBottomHeight
  );
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      // Calculate bottom height: distance from mouse to container bottom
      // Dragging up increases height, dragging down decreases
      const newBottomHeight = containerRect.bottom - e.clientY;
      
      // Clamp between min and max
      const maxBottom = containerRect.height * (maxBottomHeightPercent / 100);
      const clampedHeight = Math.min(Math.max(newBottomHeight, minBottomHeight), maxBottom);
      setBottomHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minBottomHeight, maxBottomHeightPercent, setBottomHeight]);

  // If no bottom content, just render top filling all space
  if (!bottom) {
    return (
      <div ref={containerRef} className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 overflow-hidden min-h-0">
          {top}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col h-full ${className}`}>
      {/* Top section: flex-grow to fill remaining space above bottom */}
      <div className="flex-1 overflow-hidden min-h-0">
        {top}
      </div>

      {/* Bottom section: anchored to bottom with resizable height */}
      <div 
        className="shrink-0 flex flex-col border-t border-border"
        style={{ height: `${bottomHeight}px` }}
      >
        {/* Resize handle on TOP edge of bottom section */}
        <div
          className={`
            shrink-0 h-1.5 cursor-row-resize relative group
            hover:bg-primary/30 transition-colors
            ${isDragging ? 'bg-primary/50' : 'bg-border/30'}
          `}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary/60 transition-colors" />
          </div>
        </div>

        {/* Bottom content wrapper with overflow handling */}
        <div className="flex-1 overflow-auto min-h-0">
          {bottom}
        </div>
      </div>

      {/* Overlay during drag for smooth interaction */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-row-resize" />
      )}
    </div>
  );
}
