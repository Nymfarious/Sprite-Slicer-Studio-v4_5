import { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ResizableDrawerProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
}

export function ResizableDrawer({
  children,
  defaultWidth = 25,
  minWidth = 15,
  maxWidth = 50,
  side = 'right',
}: ResizableDrawerProps) {
  const [width, setWidth] = useLocalStorage<number>('drawer-width-preference', defaultWidth);
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
      
      const containerRect = containerRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      let newWidth: number;
      if (side === 'right') {
        newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
      } else {
        newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      }
      
      setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
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
  }, [isDragging, minWidth, maxWidth, side, setWidth]);

  return (
    <div
      ref={containerRef}
      className="relative h-full"
      style={{ width: `${width}%` }}
    >
      <div
        className={`absolute ${side === 'right' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 flex items-center`}
        style={{ transform: side === 'right' ? 'translate(-50%, -50%)' : 'translate(50%, -50%)' }}
      >
        <div
          className={`
            flex items-center justify-center py-4 px-0.5 rounded-full
            bg-primary/20 border border-primary/40
            cursor-col-resize hover:bg-primary/30 hover:border-primary
            transition-all duration-200
            ${isDragging ? 'bg-primary/40 border-primary scale-110' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-3 h-3 text-primary/80" />
        </div>
      </div>

      <div className="h-full overflow-hidden" style={{ marginLeft: side === 'right' ? '12px' : '0', marginRight: side === 'left' ? '12px' : '0' }}>
        {children}
      </div>

      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
}
