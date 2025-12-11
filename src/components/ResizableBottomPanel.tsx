import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GripHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableBottomPanelProps {
  children: React.ReactNode;
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  storageKey?: string;
  parentHeight?: number;
}

export function ResizableBottomPanel({
  children,
  defaultHeight = 200,
  minHeight = 80,
  maxHeight = 500,
  storageKey = 'bottom-panel-height',
  parentHeight,
}: ResizableBottomPanelProps) {
  const [height, setHeight] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) return Math.max(minHeight, Math.min(maxHeight, parseInt(saved, 10)));
    }
    return defaultHeight;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(height);

  // Calculate dynamic limits based on parent height (50-75% of screen)
  const getHeightLimits = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    const screenHeight = parent?.clientHeight || parentHeight || window.innerHeight;
    const minPercent = screenHeight * 0.25; // Minimum 25% (panel rolled up to 75%)
    const maxPercent = screenHeight * 0.75; // Maximum 75% (panel expanded to 75%)
    return {
      min: Math.max(minHeight, minPercent),
      max: Math.min(maxHeight, maxPercent),
    };
  }, [minHeight, maxHeight, parentHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = height;
  }, [height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const { min, max } = getHeightLimits();
    const deltaY = startY.current - e.clientY;
    const newHeight = Math.max(min, Math.min(max, startHeight.current + deltaY));
    setHeight(newHeight);
  }, [isDragging, getHeightLimits]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (storageKey) localStorage.setItem(storageKey, height.toString());
    }
  }, [isDragging, height, storageKey]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeight.current = height;
  }, [height]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const { min, max } = getHeightLimits();
    const deltaY = startY.current - e.touches[0].clientY;
    const newHeight = Math.max(min, Math.min(max, startHeight.current + deltaY));
    setHeight(newHeight);
  }, [isDragging, getHeightLimits]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (storageKey) localStorage.setItem(storageKey, height.toString());
    }
  }, [isDragging, height, storageKey]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Quick snap buttons
  const snapToMin = () => {
    const { min } = getHeightLimits();
    setHeight(min);
    if (storageKey) localStorage.setItem(storageKey, min.toString());
  };

  const snapToMax = () => {
    const { max } = getHeightLimits();
    setHeight(max);
    if (storageKey) localStorage.setItem(storageKey, max.toString());
  };

  const { min: currentMin, max: currentMax } = getHeightLimits();
  const isAtMin = height <= currentMin + 10;
  const isAtMax = height >= currentMax - 10;

  return (
    <div ref={containerRef} className="flex-shrink-0 flex flex-col border-t border-border" style={{ height }}>
      <div
        className={cn(
          "h-3 flex items-center justify-center cursor-ns-resize bg-muted/50 hover:bg-muted transition-colors border-b border-border relative group",
          isDragging && "bg-primary/20"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Quick snap buttons on hover */}
        <button
          onClick={snapToMax}
          className={cn(
            "absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded",
            isAtMax && "text-muted-foreground/50"
          )}
          disabled={isAtMax}
          title="Expand panel (75%)"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        
        <GripHorizontal className="h-3 w-3 text-muted-foreground" />
        
        <button
          onClick={snapToMin}
          className={cn(
            "absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded",
            isAtMin && "text-muted-foreground/50"
          )}
          disabled={isAtMin}
          title="Collapse panel (50%)"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
