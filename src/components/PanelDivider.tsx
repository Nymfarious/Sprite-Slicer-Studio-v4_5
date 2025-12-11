import { useState, useCallback } from 'react';

interface PanelDividerProps {
  orientation: 'vertical' | 'horizontal';
  onResize: (delta: number) => void;
  className?: string;
}

export function PanelDivider({ orientation, onResize, className }: PanelDividerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const startPos = orientation === 'vertical' ? e.clientX : e.clientY;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = orientation === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos;
      onResize(delta);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [orientation, onResize]);

  const isVertical = orientation === 'vertical';
  
  return (
    <div
      className={`
        ${isVertical ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}
        bg-border hover:bg-primary/50 transition-colors
        flex items-center justify-center
        group
        ${isDragging ? 'bg-primary/70' : ''}
        ${className}
      `}
      onMouseDown={handleMouseDown}
    >
      {/* Subtle pill grabber */}
      <div 
        className={`
          ${isVertical ? 'w-1 h-8' : 'w-8 h-1'}
          rounded-full
          bg-muted-foreground/30 
          group-hover:bg-primary/70
          transition-colors
        `}
      />
    </div>
  );
}
