import { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizableOverlayPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  title?: string;
}

export function ResizableOverlayPanel({
  children,
  isOpen,
  onClose,
  defaultWidth = 400,
  minWidth = 300,
  maxWidth = 75, // percentage of screen
}: ResizableOverlayPanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const newWidth = windowWidth - e.clientX;
      const maxWidthPx = (maxWidth / 100) * windowWidth;
      
      setWidth(Math.min(Math.max(newWidth, minWidth), maxWidthPx));
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
  }, [isDragging, minWidth, maxWidth]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        ref={panelRef}
        className="fixed inset-y-0 right-0 border-l border-border shadow-2xl z-50"
        style={{ 
          width: `${width}px`,
          background: 'hsl(var(--card) / 0.92)',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        {/* Drag Handle - Left Edge */}
        <div
          className={`
            absolute left-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize
            hover:bg-primary/10 transition-colors z-10
            ${isDragging ? 'bg-primary/20' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className={`w-3 h-3 text-primary/50 ${isDragging ? 'text-primary' : ''}`} />
        </div>

        {/* Content with left padding for handle */}
        <div className="h-full pl-3">
          {children}
        </div>

        {/* Overlay when dragging */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize" />
        )}
      </div>
    </>
  );
}
