import { useState, useCallback, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 25,
  minLeftWidth = 20,
  maxLeftWidth = 50,
}: ResizablePanelsProps) {
  const isMobile = useIsMobile();
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      setLeftWidth(Math.min(Math.max(newWidth, minLeftWidth), maxLeftWidth));
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
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  // Mobile: Stack vertically
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[45%] border-b border-border overflow-hidden">
          {leftPanel}
        </div>
        <div className="flex-1 overflow-hidden">
          {rightPanel}
        </div>
      </div>
    );
  }

  // Desktop: Side by side with drag handle
  return (
    <div ref={containerRef} className="flex h-full">
      <div 
        className="overflow-hidden border-r border-border"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>

      {/* Drag Handle */}
      <div
        className={`drag-handle shrink-0 ${isDragging ? 'bg-primary' : ''}`}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'col-resize' : 'col-resize' }}
      />

      <div 
        className="overflow-hidden"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>

      {/* Overlay when dragging to prevent iframe interactions */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
}
