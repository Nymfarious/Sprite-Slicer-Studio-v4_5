import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface GuidePositions {
  verticalGuides: number[]; // X positions for vertical lines (column dividers)
  horizontalGuides: number[]; // Y positions for horizontal lines (row dividers)
}

interface ElasticGridOverlayProps {
  imageWidth: number;
  imageHeight: number;
  scale: number;
  panOffset: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  guides: GuidePositions;
  onGuidesChange: (guides: GuidePositions) => void;
  selectedCells: Set<string>;
  onCellClick: (cellKey: string) => void;
  enabled: boolean;
}

type DragTarget = {
  type: 'vertical' | 'horizontal';
  index: number;
} | null;

export function ElasticGridOverlay({
  imageWidth,
  imageHeight,
  scale,
  panOffset,
  containerRef,
  guides,
  onGuidesChange,
  selectedCells,
  onCellClick,
  enabled,
}: ElasticGridOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [hoveredGuide, setHoveredGuide] = useState<DragTarget>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const MIN_GUIDE_GAP = 8; // Minimum pixels between guides

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    const imageX = (screenX - containerRect.left - centerX - panOffset.x) / scale + imageWidth / 2;
    const imageY = (screenY - containerRect.top - centerY - panOffset.y) / scale + imageHeight / 2;
    
    return { x: imageX, y: imageY };
  }, [containerRef, panOffset, scale, imageWidth, imageHeight]);

  // Handle guide drag
  const handleMouseDown = useCallback((e: React.MouseEvent, target: DragTarget) => {
    if (!enabled || !target) return;
    e.preventDefault();
    e.stopPropagation();
    setDragTarget(target);
  }, [enabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragTarget || !enabled) return;

    const { x, y } = screenToImage(e.clientX, e.clientY);

    if (dragTarget.type === 'vertical') {
      const newGuides = [...guides.verticalGuides];
      let newX = Math.max(0, Math.min(imageWidth, x));
      
      // Prevent crossing adjacent guides
      const prevGuide = dragTarget.index > 0 ? newGuides[dragTarget.index - 1] : 0;
      const nextGuide = dragTarget.index < newGuides.length - 1 ? newGuides[dragTarget.index + 1] : imageWidth;
      
      newX = Math.max(prevGuide + MIN_GUIDE_GAP, Math.min(nextGuide - MIN_GUIDE_GAP, newX));
      newGuides[dragTarget.index] = Math.round(newX);
      
      onGuidesChange({ ...guides, verticalGuides: newGuides });
    } else {
      const newGuides = [...guides.horizontalGuides];
      let newY = Math.max(0, Math.min(imageHeight, y));
      
      // Prevent crossing adjacent guides
      const prevGuide = dragTarget.index > 0 ? newGuides[dragTarget.index - 1] : 0;
      const nextGuide = dragTarget.index < newGuides.length - 1 ? newGuides[dragTarget.index + 1] : imageHeight;
      
      newY = Math.max(prevGuide + MIN_GUIDE_GAP, Math.min(nextGuide - MIN_GUIDE_GAP, newY));
      newGuides[dragTarget.index] = Math.round(newY);
      
      onGuidesChange({ ...guides, horizontalGuides: newGuides });
    }
  }, [dragTarget, enabled, screenToImage, guides, onGuidesChange, imageWidth, imageHeight]);

  const handleMouseUp = useCallback(() => {
    setDragTarget(null);
  }, []);

  useEffect(() => {
    if (dragTarget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragTarget, handleMouseMove, handleMouseUp]);

  // Calculate cell boundaries from guides
  const getCellBounds = useCallback(() => {
    const vGuides = [0, ...guides.verticalGuides, imageWidth];
    const hGuides = [0, ...guides.horizontalGuides, imageHeight];
    
    const cells: Array<{
      key: string;
      x: number;
      y: number;
      width: number;
      height: number;
      col: number;
      row: number;
    }> = [];

    for (let row = 0; row < hGuides.length - 1; row++) {
      for (let col = 0; col < vGuides.length - 1; col++) {
        cells.push({
          key: `${col}-${row}`,
          x: vGuides[col],
          y: hGuides[row],
          width: vGuides[col + 1] - vGuides[col],
          height: hGuides[row + 1] - hGuides[row],
          col,
          row,
        });
      }
    }

    return cells;
  }, [guides, imageWidth, imageHeight]);

  const handleCellClick = useCallback((e: React.MouseEvent, cellKey: string) => {
    // Don't handle cell clicks while dragging a guide
    if (dragTarget) return;
    e.stopPropagation();
    e.preventDefault();
    onCellClick(cellKey);
  }, [dragTarget, onCellClick]);

  // Hit area for guides
  const GUIDE_HIT_WIDTH = 24;
  // Handle size at edge
  const HANDLE_SIZE = 20;

  if (!enabled) return null;

  const cells = getCellBounds();
  const numCols = guides.verticalGuides.length + 1;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
      }}
    >
      {/* Combined SVG layer - cells are clickable, guides have handles at edges */}
      <svg
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          width: imageWidth,
          height: imageHeight,
        }}
      >
        {/* Cells Layer - clickable */}
        <g className="pointer-events-auto">
          {cells.map((cell) => {
            const isSelected = selectedCells.has(cell.key);
            const isHovered = hoveredCell === cell.key;
            const cellNumber = cell.row * numCols + cell.col + 1;

            return (
              <g key={cell.key}>
                {/* Cell background - clickable */}
                <rect
                  x={cell.x}
                  y={cell.y}
                  width={cell.width}
                  height={cell.height}
                  fill={isSelected ? 'rgba(45, 212, 191, 0.35)' : isHovered ? 'rgba(45, 212, 191, 0.15)' : 'transparent'}
                  stroke="rgba(45, 212, 191, 0.8)"
                  strokeWidth={1.5 / scale}
                  strokeDasharray={`${4 / scale} ${4 / scale}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleCellClick(e, cell.key)}
                  onMouseEnter={() => setHoveredCell(cell.key)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
                
                {/* Cell number - positioned in top-right corner, larger */}
                {cell.width > 40 && cell.height > 40 && (
                  <>
                    <rect
                      x={cell.x + cell.width - 32}
                      y={cell.y + 6}
                      width={26}
                      height={22}
                      rx={4}
                      fill={isSelected ? 'rgba(45, 212, 191, 0.95)' : 'rgba(15, 23, 42, 0.9)'}
                      pointerEvents="none"
                    />
                    <text
                      x={cell.x + cell.width - 19}
                      y={cell.y + 18}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? 'rgba(15, 23, 42, 1)' : 'rgba(45, 212, 191, 1)'}
                      fontSize={16}
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      pointerEvents="none"
                    >
                      {cellNumber}
                    </text>
                  </>
                )}

                {/* Checkbox - larger size */}
                <rect
                  x={cell.x + 6}
                  y={cell.y + 6}
                  width={26}
                  height={26}
                  rx={4}
                  fill={isSelected ? 'rgba(45, 212, 191, 1)' : 'rgba(30, 41, 59, 0.95)'}
                  stroke="rgba(45, 212, 191, 0.9)"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleCellClick(e, cell.key)}
                />
                {isSelected && (
                  <path
                    d={`M${cell.x + 12} ${cell.y + 19} L${cell.x + 17} ${cell.y + 24} L${cell.x + 26} ${cell.y + 12}`}
                    stroke="rgba(15, 23, 42, 1)"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Guide Lines - visible but not interactive here */}
        <g pointerEvents="none">
          {/* Vertical guide lines */}
          {guides.verticalGuides.map((x, index) => {
            const isActive = dragTarget?.type === 'vertical' && dragTarget.index === index;
            const isHovered = hoveredGuide?.type === 'vertical' && hoveredGuide.index === index;
            
            return (
              <line
                key={`v-line-${index}`}
                x1={x}
                y1={0}
                x2={x}
                y2={imageHeight}
                stroke={isActive ? '#fbbf24' : isHovered ? '#fcd34d' : 'hsl(160, 84%, 39%)'}
                strokeWidth={(isActive || isHovered ? 3 : 2) / scale}
              />
            );
          })}

          {/* Horizontal guide lines */}
          {guides.horizontalGuides.map((y, index) => {
            const isActive = dragTarget?.type === 'horizontal' && dragTarget.index === index;
            const isHovered = hoveredGuide?.type === 'horizontal' && hoveredGuide.index === index;
            
            return (
              <line
                key={`h-line-${index}`}
                x1={0}
                y1={y}
                x2={imageWidth}
                y2={y}
                stroke={isActive ? '#fbbf24' : isHovered ? '#fcd34d' : 'hsl(160, 84%, 39%)'}
                strokeWidth={(isActive || isHovered ? 3 : 2) / scale}
              />
            );
          })}
        </g>

        {/* Draggable Handles - at edges only (top for horizontal, right for vertical) */}
        <g className="pointer-events-auto">
          {/* Vertical guide handles - positioned at TOP edge */}
          {guides.verticalGuides.map((x, index) => {
            const isActive = dragTarget?.type === 'vertical' && dragTarget.index === index;
            const isHovered = hoveredGuide?.type === 'vertical' && hoveredGuide.index === index;
            const handleY = -2; // At top edge
            
            return (
              <g key={`v-handle-${index}`}>
                {/* Hit area for entire line */}
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={imageHeight}
                  stroke="transparent"
                  strokeWidth={GUIDE_HIT_WIDTH / scale}
                  style={{ cursor: 'ew-resize' }}
                  onMouseDown={(e) => handleMouseDown(e, { type: 'vertical', index })}
                  onMouseEnter={() => setHoveredGuide({ type: 'vertical', index })}
                  onMouseLeave={() => setHoveredGuide(null)}
                />
                {/* Handle icon at top - gold left/right arrow */}
                <g
                  style={{ cursor: 'ew-resize' }}
                  onMouseDown={(e) => handleMouseDown(e, { type: 'vertical', index })}
                  onMouseEnter={() => setHoveredGuide({ type: 'vertical', index })}
                  onMouseLeave={() => setHoveredGuide(null)}
                >
                  <rect
                    x={x - HANDLE_SIZE / 2}
                    y={handleY}
                    width={HANDLE_SIZE}
                    height={HANDLE_SIZE}
                    rx={3}
                    fill={isActive ? '#f59e0b' : isHovered ? '#fbbf24' : '#d97706'}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                  />
                  {/* Left/Right arrows icon */}
                  <path
                    d={`M${x - 5} ${handleY + HANDLE_SIZE / 2} L${x - 2} ${handleY + HANDLE_SIZE / 2 - 3} M${x - 5} ${handleY + HANDLE_SIZE / 2} L${x - 2} ${handleY + HANDLE_SIZE / 2 + 3} M${x + 5} ${handleY + HANDLE_SIZE / 2} L${x + 2} ${handleY + HANDLE_SIZE / 2 - 3} M${x + 5} ${handleY + HANDLE_SIZE / 2} L${x + 2} ${handleY + HANDLE_SIZE / 2 + 3} M${x - 5} ${handleY + HANDLE_SIZE / 2} L${x + 5} ${handleY + HANDLE_SIZE / 2}`}
                    stroke="rgba(0,0,0,0.8)"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            );
          })}

          {/* Horizontal guide handles - positioned at RIGHT edge */}
          {guides.horizontalGuides.map((y, index) => {
            const isActive = dragTarget?.type === 'horizontal' && dragTarget.index === index;
            const isHovered = hoveredGuide?.type === 'horizontal' && hoveredGuide.index === index;
            const handleX = imageWidth - HANDLE_SIZE + 2; // At right edge
            
            return (
              <g key={`h-handle-${index}`}>
                {/* Hit area for entire line */}
                <line
                  x1={0}
                  y1={y}
                  x2={imageWidth}
                  y2={y}
                  stroke="transparent"
                  strokeWidth={GUIDE_HIT_WIDTH / scale}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleMouseDown(e, { type: 'horizontal', index })}
                  onMouseEnter={() => setHoveredGuide({ type: 'horizontal', index })}
                  onMouseLeave={() => setHoveredGuide(null)}
                />
                {/* Handle icon at right - gold up/down arrow */}
                <g
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleMouseDown(e, { type: 'horizontal', index })}
                  onMouseEnter={() => setHoveredGuide({ type: 'horizontal', index })}
                  onMouseLeave={() => setHoveredGuide(null)}
                >
                  <rect
                    x={handleX}
                    y={y - HANDLE_SIZE / 2}
                    width={HANDLE_SIZE}
                    height={HANDLE_SIZE}
                    rx={3}
                    fill={isActive ? '#f59e0b' : isHovered ? '#fbbf24' : '#d97706'}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                  />
                  {/* Up/Down arrows icon */}
                  <path
                    d={`M${handleX + HANDLE_SIZE / 2} ${y - 5} L${handleX + HANDLE_SIZE / 2 - 3} ${y - 2} M${handleX + HANDLE_SIZE / 2} ${y - 5} L${handleX + HANDLE_SIZE / 2 + 3} ${y - 2} M${handleX + HANDLE_SIZE / 2} ${y + 5} L${handleX + HANDLE_SIZE / 2 - 3} ${y + 2} M${handleX + HANDLE_SIZE / 2} ${y + 5} L${handleX + HANDLE_SIZE / 2 + 3} ${y + 2} M${handleX + HANDLE_SIZE / 2} ${y - 5} L${handleX + HANDLE_SIZE / 2} ${y + 5}`}
                    stroke="rgba(0,0,0,0.8)"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// Helper to generate initial guides from grid settings
export function generateGuidesFromGrid(
  imageWidth: number,
  imageHeight: number,
  columns: number,
  rows: number,
  offsetX: number = 0,
  offsetY: number = 0
): GuidePositions {
  const cellWidth = Math.floor((imageWidth - offsetX) / columns);
  const cellHeight = Math.floor((imageHeight - offsetY) / rows);

  const verticalGuides: number[] = [];
  const horizontalGuides: number[] = [];

  // Generate column dividers (columns - 1 guides)
  for (let i = 1; i < columns; i++) {
    verticalGuides.push(offsetX + i * cellWidth);
  }

  // Generate row dividers (rows - 1 guides)
  for (let i = 1; i < rows; i++) {
    horizontalGuides.push(offsetY + i * cellHeight);
  }

  return { verticalGuides, horizontalGuides };
}

// Helper to get cell bounds from guides (for slicing)
export function getCellBoundsFromGuides(
  guides: GuidePositions,
  imageWidth: number,
  imageHeight: number
): Array<{ x: number; y: number; width: number; height: number; col: number; row: number }> {
  const vGuides = [0, ...guides.verticalGuides, imageWidth];
  const hGuides = [0, ...guides.horizontalGuides, imageHeight];

  const cells: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    col: number;
    row: number;
  }> = [];

  for (let row = 0; row < hGuides.length - 1; row++) {
    for (let col = 0; col < vGuides.length - 1; col++) {
      cells.push({
        x: vGuides[col],
        y: hGuides[row],
        width: vGuides[col + 1] - vGuides[col],
        height: hGuides[row + 1] - hGuides[row],
        col,
        row,
      });
    }
  }

  return cells;
}
