import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { CropCanvasOverlayProps, CropShape } from './types';
import { drawOctagon } from './cropHelpers';

const HANDLE_SIZE = 10;

export function CropCanvasOverlay({
  imageWidth,
  imageHeight,
  scale,
  panOffset,
  containerRef,
  shape,
  mode,
  isLocked,
  selection,
  onSelectionChange,
}: CropCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Update canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  // Convert screen coords to image coords (accounting for centered canvas)
  const screenToImage = useCallback((screenX: number, screenY: number, canvasRect: DOMRect) => {
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const imageLeft = centerX - scaledWidth / 2 + panOffset.x;
    const imageTop = centerY - scaledHeight / 2 + panOffset.y;
    
    const x = (screenX - canvasRect.left - imageLeft) / scale;
    const y = (screenY - canvasRect.top - imageTop) / scale;
    return { x, y };
  }, [scale, panOffset, imageWidth, imageHeight]);

  // Draw the crop overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!selection) return;

    ctx.save();
    
    // Calculate position on screen
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const imageLeft = centerX - scaledWidth / 2 + panOffset.x;
    const imageTop = centerY - scaledHeight / 2 + panOffset.y;

    const selX = imageLeft + selection.x * scale;
    const selY = imageTop + selection.y * scale;
    const selW = selection.width * scale;
    const selH = selection.height * scale;

    // Draw dimmed overlay outside selection
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the selection area
    ctx.globalCompositeOperation = 'destination-out';
    
    if (shape === 'rectangle') {
      ctx.fillRect(selX, selY, selW, selH);
    } else if (shape === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(selX + selW / 2, selY + selH / 2, selW / 2, selH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'octagon') {
      drawOctagon(ctx, selX, selY, selW, selH);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    // Draw selection border
    ctx.strokeStyle = mode === 'keep' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (shape === 'rectangle') {
      ctx.strokeRect(selX, selY, selW, selH);
    } else if (shape === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(selX + selW / 2, selY + selH / 2, selW / 2, selH / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === 'octagon') {
      drawOctagon(ctx, selX, selY, selW, selH);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw resize handles
    const handles = [
      { x: selX, y: selY, cursor: 'nw-resize' },
      { x: selX + selW, y: selY, cursor: 'ne-resize' },
      { x: selX, y: selY + selH, cursor: 'sw-resize' },
      { x: selX + selW, y: selY + selH, cursor: 'se-resize' },
      { x: selX + selW / 2, y: selY, cursor: 'n-resize' },
      { x: selX + selW / 2, y: selY + selH, cursor: 's-resize' },
      { x: selX, y: selY + selH / 2, cursor: 'w-resize' },
      { x: selX + selW, y: selY + selH / 2, cursor: 'e-resize' },
    ];

    handles.forEach(handle => {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = mode === 'keep' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }, [selection, shape, mode, scale, panOffset, imageWidth, imageHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pos = screenToImage(e.clientX, e.clientY, rect);

    // Check if clicking on a handle
    if (selection) {
      const handles = [
        { id: 'nw', x: selection.x, y: selection.y },
        { id: 'ne', x: selection.x + selection.width, y: selection.y },
        { id: 'sw', x: selection.x, y: selection.y + selection.height },
        { id: 'se', x: selection.x + selection.width, y: selection.y + selection.height },
        { id: 'n', x: selection.x + selection.width / 2, y: selection.y },
        { id: 's', x: selection.x + selection.width / 2, y: selection.y + selection.height },
        { id: 'w', x: selection.x, y: selection.y + selection.height / 2 },
        { id: 'e', x: selection.x + selection.width, y: selection.y + selection.height / 2 },
      ];

      for (const handle of handles) {
        const dist = Math.sqrt(Math.pow(pos.x - handle.x, 2) + Math.pow(pos.y - handle.y, 2));
        if (dist < HANDLE_SIZE / scale) {
          setIsDragging(true);
          setDragHandle(handle.id);
          setDragStart(pos);
          return;
        }
      }

      // Check if clicking inside selection (to move)
      const inSelection = 
        pos.x >= selection.x && 
        pos.x <= selection.x + selection.width &&
        pos.y >= selection.y && 
        pos.y <= selection.y + selection.height;

      if (inSelection) {
        setIsDragging(true);
        setDragHandle('move');
        setDragStart(pos);
        return;
      }
    }

    // Start new selection
    setIsDrawing(true);
    setDrawStart(pos);
    onSelectionChange({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      shape,
    });
  }, [selection, screenToImage, scale, shape, onSelectionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pos = screenToImage(e.clientX, e.clientY, rect);

    if (isDrawing && drawStart) {
      let width = pos.x - drawStart.x;
      let height = pos.y - drawStart.y;

      if (isLocked) {
        const size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
      }

      onSelectionChange({
        x: width < 0 ? drawStart.x + width : drawStart.x,
        y: height < 0 ? drawStart.y + height : drawStart.y,
        width: Math.abs(width),
        height: Math.abs(height),
        shape,
      });
    } else if (isDragging && dragStart && selection) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      let newSelection = { ...selection };

      switch (dragHandle) {
        case 'move':
          newSelection.x = Math.max(0, Math.min(imageWidth - selection.width, selection.x + dx));
          newSelection.y = Math.max(0, Math.min(imageHeight - selection.height, selection.y + dy));
          break;
        case 'se':
          newSelection.width = Math.max(10, selection.width + dx);
          newSelection.height = isLocked ? newSelection.width : Math.max(10, selection.height + dy);
          break;
        case 'nw':
          newSelection.x = selection.x + dx;
          newSelection.y = selection.y + dy;
          newSelection.width = Math.max(10, selection.width - dx);
          newSelection.height = isLocked ? newSelection.width : Math.max(10, selection.height - dy);
          break;
        case 'ne':
          newSelection.y = selection.y + dy;
          newSelection.width = Math.max(10, selection.width + dx);
          newSelection.height = isLocked ? newSelection.width : Math.max(10, selection.height - dy);
          break;
        case 'sw':
          newSelection.x = selection.x + dx;
          newSelection.width = Math.max(10, selection.width - dx);
          newSelection.height = isLocked ? newSelection.width : Math.max(10, selection.height + dy);
          break;
        case 'n':
          newSelection.y = selection.y + dy;
          newSelection.height = Math.max(10, selection.height - dy);
          if (isLocked) newSelection.width = newSelection.height;
          break;
        case 's':
          newSelection.height = Math.max(10, selection.height + dy);
          if (isLocked) newSelection.width = newSelection.height;
          break;
        case 'w':
          newSelection.x = selection.x + dx;
          newSelection.width = Math.max(10, selection.width - dx);
          if (isLocked) newSelection.height = newSelection.width;
          break;
        case 'e':
          newSelection.width = Math.max(10, selection.width + dx);
          if (isLocked) newSelection.height = newSelection.width;
          break;
      }

      onSelectionChange(newSelection);
      setDragStart(pos);
    }
  }, [isDrawing, drawStart, isDragging, dragStart, dragHandle, selection, isLocked, screenToImage, shape, imageWidth, imageHeight, onSelectionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDrawStart(null);
    setIsDragging(false);
    setDragHandle(null);
    setDragStart(null);
  }, []);

  // Keyboard shortcuts for shape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 's' && selection) {
        // Snap to square/circle
        const size = Math.max(selection.width, selection.height);
        onSelectionChange({
          ...selection,
          width: size,
          height: size,
        });
        toast.info(`Snapped to ${shape === 'rectangle' ? 'square' : 'perfect circle'}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, shape, onSelectionChange]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width || 800}
      height={canvasSize.height || 600}
      className="absolute inset-0 pointer-events-auto z-30"
      style={{ cursor: isDrawing ? 'crosshair' : isDragging ? 'move' : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
