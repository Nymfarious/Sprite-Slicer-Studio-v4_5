import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { FreeformTool, SliceLine, SliceRegion, AISuggestion } from './types';

interface FreeformCanvasOverlayProps {
  imageWidth: number;
  imageHeight: number;
  scale: number;
  panOffset: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  selectedTool: FreeformTool;
  lines: SliceLine[];
  regions: SliceRegion[];
  suggestions: AISuggestion[];
  selectedLineId: string | null;
  onAddLine: (line: Omit<SliceLine, 'id'>) => void;
  onUpdateLine: (id: string, updates: Partial<SliceLine>) => void;
  onDeleteLine: (id: string) => void;
  onAddRegion: (region: Omit<SliceRegion, 'id'>) => void;
  onSelectLine: (id: string | null) => void;
}

const HANDLE_SIZE = 8;
const SNAP_THRESHOLD = 10;

export function FreeformCanvasOverlay({
  imageWidth,
  imageHeight,
  scale,
  panOffset,
  containerRef,
  selectedTool,
  lines,
  regions,
  suggestions,
  selectedLineId,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  onSelectLine,
  onAddRegion,
}: FreeformCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
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

  // Convert screen coords to image coords
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

  // Snap to edges or other lines
  const snapPosition = useCallback((pos: number, type: 'x' | 'y'): number => {
    const edges = type === 'x' ? [0, imageWidth] : [0, imageHeight];
    const linePositions = lines
      .filter(l => l.type === (type === 'x' ? 'vertical' : 'horizontal'))
      .map(l => l.position);
    
    const allSnapPoints = [...edges, ...linePositions];
    
    for (const snapPoint of allSnapPoints) {
      if (Math.abs(pos - snapPoint) < SNAP_THRESHOLD / scale) {
        return snapPoint;
      }
    }
    return pos;
  }, [lines, imageWidth, imageHeight, scale]);

  // Draw overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const imageLeft = centerX - scaledWidth / 2 + panOffset.x;
    const imageTop = centerY - scaledHeight / 2 + panOffset.y;

    ctx.save();
    ctx.translate(imageLeft, imageTop);
    ctx.scale(scale, scale);

    // Draw existing lines
    lines.forEach(line => {
      const isSelected = line.id === selectedLineId;
      
      ctx.strokeStyle = isSelected ? 'hsl(var(--primary))' : 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = (isSelected ? 3 : 2) / scale;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      if (line.type === 'horizontal') {
        ctx.moveTo(line.start, line.position);
        ctx.lineTo(line.end, line.position);
      } else {
        ctx.moveTo(line.position, line.start);
        ctx.lineTo(line.position, line.end);
      }
      ctx.stroke();

      if (isSelected) {
        const handlePositions = line.type === 'horizontal'
          ? [
              { x: line.start, y: line.position },
              { x: (line.start + line.end) / 2, y: line.position },
              { x: line.end, y: line.position },
            ]
          : [
              { x: line.position, y: line.start },
              { x: line.position, y: (line.start + line.end) / 2 },
              { x: line.position, y: line.end },
            ];

        handlePositions.forEach(({ x, y }, idx) => {
          ctx.fillStyle = idx === 1 ? 'hsl(var(--warning))' : 'hsl(var(--primary))';
          ctx.beginPath();
          ctx.arc(x, y, HANDLE_SIZE / 2 / scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1.5 / scale;
          ctx.stroke();
        });
      }
    });

    // Draw existing regions
    regions.forEach(region => {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([5 / scale, 3 / scale]);

      if (region.type === 'rectangle') {
        ctx.beginPath();
        ctx.rect(region.bounds.x, region.bounds.y, region.bounds.width, region.bounds.height);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        region.points.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw AI suggestions
    suggestions
      .filter(s => s.accepted === null)
      .forEach(suggestion => {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([8 / scale, 4 / scale]);

        if (suggestion.type === 'line') {
          const line = suggestion.data as SliceLine;
          ctx.beginPath();
          if (line.type === 'horizontal') {
            ctx.moveTo(line.start, line.position);
            ctx.lineTo(line.end, line.position);
          } else {
            ctx.moveTo(line.position, line.start);
            ctx.lineTo(line.position, line.end);
          }
          ctx.stroke();
        } else {
          const region = suggestion.data as SliceRegion;
          ctx.beginPath();
          ctx.rect(region.bounds.x, region.bounds.y, region.bounds.width, region.bounds.height);
          ctx.fill();
          ctx.stroke();
        }
      });

    // Draw current drawing preview
    ctx.setLineDash([]);
    if (isDrawing && drawStart) {
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.9)';
      ctx.lineWidth = 2 / scale;

      if (selectedTool === 'rectangle' && currentPoints.length > 0) {
        const end = currentPoints[currentPoints.length - 1];
        ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
        ctx.beginPath();
        ctx.rect(
          Math.min(drawStart.x, end.x),
          Math.min(drawStart.y, end.y),
          Math.abs(end.x - drawStart.x),
          Math.abs(end.y - drawStart.y)
        );
        ctx.fill();
        ctx.stroke();
      } else if ((selectedTool === 'lasso' || selectedTool === 'polygon') && currentPoints.length > 0) {
        ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (selectedTool === 'polygon') {
          currentPoints.forEach(point => {
            ctx.fillStyle = 'hsl(var(--primary))';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4 / scale, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
    }

    ctx.restore();
  }, [lines, regions, suggestions, selectedLineId, scale, panOffset, isDrawing, drawStart, currentPoints, selectedTool, imageWidth, imageHeight]);

  const finishPolygon = useCallback(() => {
    if (currentPoints.length >= 3) {
      const xs = currentPoints.map(p => p.x);
      const ys = currentPoints.map(p => p.y);
      const bounds = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
      
      onAddRegion({ type: 'polygon', points: currentPoints, bounds });
      toast.success('Polygon region added');
    }
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentPoints([]);
  }, [currentPoints, onAddRegion]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'select') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pos = screenToImage(e.clientX, e.clientY, rect);

    const clampedPos = {
      x: Math.max(0, Math.min(imageWidth, pos.x)),
      y: Math.max(0, Math.min(imageHeight, pos.y)),
    };

    if (selectedTool === 'h-line') {
      const snappedY = snapPosition(clampedPos.y, 'y');
      onAddLine({ type: 'horizontal', position: snappedY, start: 0, end: imageWidth });
      toast.success('Horizontal line added');
    } else if (selectedTool === 'v-line') {
      const snappedX = snapPosition(clampedPos.x, 'x');
      onAddLine({ type: 'vertical', position: snappedX, start: 0, end: imageHeight });
      toast.success('Vertical line added');
    } else if (selectedTool === 'rectangle' || selectedTool === 'lasso') {
      setIsDrawing(true);
      setDrawStart(clampedPos);
      setCurrentPoints([clampedPos]);
    } else if (selectedTool === 'polygon') {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawStart(clampedPos);
        setCurrentPoints([clampedPos]);
      } else {
        const firstPoint = currentPoints[0];
        if (currentPoints.length >= 3) {
          const distToFirst = Math.sqrt(
            Math.pow(clampedPos.x - firstPoint.x, 2) + 
            Math.pow(clampedPos.y - firstPoint.y, 2)
          );
          if (distToFirst < 15 / scale) {
            finishPolygon();
            return;
          }
        }
        setCurrentPoints(prev => [...prev, clampedPos]);
      }
    }
  }, [selectedTool, screenToImage, imageWidth, imageHeight, snapPosition, onAddLine, isDrawing, currentPoints, scale, finishPolygon]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pos = screenToImage(e.clientX, e.clientY, rect);
    
    const clampedPos = {
      x: Math.max(0, Math.min(imageWidth, pos.x)),
      y: Math.max(0, Math.min(imageHeight, pos.y)),
    };

    if (selectedTool === 'rectangle') {
      setCurrentPoints([clampedPos]);
    } else if (selectedTool === 'lasso') {
      setCurrentPoints(prev => [...prev, clampedPos]);
    }
  }, [isDrawing, drawStart, selectedTool, screenToImage, imageWidth, imageHeight]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawStart) return;

    if (selectedTool === 'rectangle' && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      const bounds = {
        x: Math.min(drawStart.x, end.x),
        y: Math.min(drawStart.y, end.y),
        width: Math.abs(end.x - drawStart.x),
        height: Math.abs(end.y - drawStart.y),
      };
      
      if (bounds.width > 10 && bounds.height > 10) {
        onAddRegion({
          type: 'rectangle',
          points: [
            { x: bounds.x, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
            { x: bounds.x, y: bounds.y + bounds.height },
          ],
          bounds,
        });
        toast.success('Rectangle region added');
      }
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentPoints([]);
    } else if (selectedTool === 'lasso' && currentPoints.length >= 3) {
      const xs = currentPoints.map(p => p.x);
      const ys = currentPoints.map(p => p.y);
      const bounds = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
      
      onAddRegion({ type: 'lasso', points: currentPoints, bounds });
      toast.success('Lasso region added');
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentPoints([]);
    }
  }, [isDrawing, drawStart, selectedTool, currentPoints, onAddRegion]);

  const handleDoubleClick = useCallback(() => {
    if (selectedTool === 'polygon' && isDrawing) {
      finishPolygon();
    }
  }, [selectedTool, isDrawing, finishPolygon]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentPoints([]);
      onSelectLine(null);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedLineId) {
        onDeleteLine(selectedLineId);
        onSelectLine(null);
        toast.success('Line deleted');
      }
    }
  }, [selectedLineId, onDeleteLine, onSelectLine]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width || 800}
      height={canvasSize.height || 600}
      className="absolute inset-0 pointer-events-auto"
      style={{
        cursor: selectedTool === 'select' 
          ? 'default' 
          : selectedTool === 'h-line'
          ? 'row-resize'
          : selectedTool === 'v-line'
          ? 'col-resize'
          : 'crosshair',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  );
}
