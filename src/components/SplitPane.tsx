import { useState, useCallback, useRef, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';

interface SplitPaneProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  defaultTopHeight?: number;
  minTopHeight?: number;
  maxTopHeight?: number;
  className?: string;
}

export function SplitPane({
  top,
  bottom,
  defaultTopHeight = 50,
  minTopHeight = 30,
  maxTopHeight = 70,
  className = '',
}: SplitPaneProps) {
  const [topHeight, setTopHeight] = useState(defaultTopHeight);
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
      const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      setTopHeight(Math.min(Math.max(newHeight, minTopHeight), maxTopHeight));
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
  }, [isDragging, minTopHeight, maxTopHeight]);

  return (
    <div ref={containerRef} className={`flex flex-col h-full ${className}`}>
      {/* Top Section */}
      <div 
        className="overflow-hidden"
        style={{ height: `${topHeight}%` }}
      >
        {top}
      </div>

      {/* Drag Handle */}
      <div
        className={`
          shrink-0 h-2 flex items-center justify-center cursor-row-resize
          bg-border/50 hover:bg-primary/30 transition-colors
          ${isDragging ? 'bg-primary/50' : ''}
        `}
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Bottom Section */}
      <div 
        className="overflow-hidden flex-1"
        style={{ height: `${100 - topHeight - 2}%` }}
      >
        {bottom}
      </div>

      {/* Overlay when dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-row-resize" />
      )}
    </div>
  );
}
