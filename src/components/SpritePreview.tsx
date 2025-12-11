import { useRef, useEffect, useState, useCallback } from 'react';
import { GridSettings, UploadedImage } from '@/types/sprite';
import { CollapsibleZoomPanel } from './CollapsibleZoomPanel';
import { 
  FreeformCanvasOverlay, 
  FreeformTool, 
  SliceLine, 
  SliceRegion, 
  AISuggestion 
} from './FreeformSlicing';
import { CropCanvasOverlay, CropShape, CropMode, CropSelection } from './CropTool';
import { ElasticGridOverlay, GuidePositions } from './ElasticGridOverlay';

interface SpritePreviewProps {
  uploadedImage: UploadedImage;
  gridSettings: GridSettings;
  selectedCells: Set<string>;
  onCellClick: (cellKey: string) => void;
  isAnalyzing?: boolean;
  // Freeform slicing props
  freeformEnabled?: boolean;
  freeformTool?: FreeformTool;
  freeformLines?: SliceLine[];
  freeformRegions?: SliceRegion[];
  freeformSuggestions?: AISuggestion[];
  selectedLineId?: string | null;
  onAddLine?: (line: Omit<SliceLine, 'id'>) => void;
  onUpdateLine?: (id: string, updates: Partial<SliceLine>) => void;
  onDeleteLine?: (id: string) => void;
  onAddRegion?: (region: Omit<SliceRegion, 'id'>) => void;
  onSelectLine?: (id: string | null) => void;
  // Crop tool props
  cropEnabled?: boolean;
  cropShape?: CropShape;
  cropMode?: CropMode;
  cropIsLocked?: boolean;
  cropSelection?: CropSelection | null;
  onCropSelectionChange?: (selection: CropSelection | null) => void;
  // Elastic grid props
  elasticGridEnabled?: boolean;
  guidePositions?: GuidePositions;
  onGuidesChange?: (guides: GuidePositions) => void;
}

export function SpritePreview({ 
  uploadedImage, 
  gridSettings, 
  selectedCells, 
  onCellClick,
  isAnalyzing = false,
  freeformEnabled = false,
  freeformTool = 'select',
  freeformLines = [],
  freeformRegions = [],
  freeformSuggestions = [],
  selectedLineId = null,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  onAddRegion,
  onSelectLine,
  // Crop props
  cropEnabled = false,
  cropShape = 'rectangle',
  cropMode = 'keep',
  cropIsLocked = false,
  cropSelection = null,
  onCropSelectionChange,
  // Elastic grid props
  elasticGridEnabled = false,
  guidePositions = { verticalGuides: [], horizontalGuides: [] },
  onGuidesChange,
}: SpritePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Calculate base scale to fit image in container
  useEffect(() => {
    if (containerRef.current && uploadedImage) {
      const container = containerRef.current;
      const padding = 60;
      const maxWidth = container.clientWidth - padding;
      const maxHeight = container.clientHeight - padding;
      
      const scaleX = maxWidth / uploadedImage.width;
      const scaleY = maxHeight / uploadedImage.height;
      const fitScale = Math.min(scaleX, scaleY, 1);
      setBaseScale(fitScale);
      setScale(fitScale);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [uploadedImage]);

  // Draw canvas (only draw fixed grid when elastic mode is disabled)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Skip drawing fixed grid if elastic mode is enabled (handled by ElasticGridOverlay)
      if (elasticGridEnabled) {
        // Draw shimmer overlay when analyzing
        if (isAnalyzing) {
          ctx.fillStyle = 'rgba(45, 212, 191, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }
      
      const { columns, rows, cellWidth, cellHeight, offsetX, offsetY, spacingX, spacingY } = gridSettings;

      // Draw cells
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = offsetX + col * (cellWidth + spacingX);
          const y = offsetY + row * (cellHeight + spacingY);
          const cellKey = `${col}-${row}`;
          const cellNumber = row * columns + col + 1;
          
          // Fill selected cells
          if (selectedCells.has(cellKey)) {
            ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
            ctx.fillRect(x, y, cellWidth, cellHeight);
          }

          // Fill hovered cell
          if (hoveredCell === cellKey && !selectedCells.has(cellKey)) {
            ctx.fillStyle = 'rgba(45, 212, 191, 0.15)';
            ctx.fillRect(x, y, cellWidth, cellHeight);
          }

          // Draw dashed cell border
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, cellWidth, cellHeight);
          ctx.setLineDash([]);

          // Draw cell number - positioned in top-right corner
          ctx.font = 'bold 14px JetBrains Mono, monospace';
          const textMetrics = ctx.measureText(String(cellNumber));
          const textPadding = 5;
          const textX = x + cellWidth - textMetrics.width / 2 - textPadding - 8;
          const textY = y + 14;
          
          ctx.fillStyle = selectedCells.has(cellKey)
            ? 'rgba(45, 212, 191, 0.9)'
            : 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          ctx.roundRect(
            textX - textMetrics.width / 2 - textPadding,
            textY - 10,
            textMetrics.width + textPadding * 2,
            20,
            3
          );
          ctx.fill();
          
          ctx.fillStyle = selectedCells.has(cellKey) 
            ? 'rgba(15, 23, 42, 0.95)' 
            : 'rgba(45, 212, 191, 0.95)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cellNumber), textX, textY);

          // Draw checkbox indicator - larger size
          const checkSize = 20;
          const checkX = x + 4;
          const checkY = y + 4;
          
          ctx.fillStyle = selectedCells.has(cellKey)
            ? 'rgba(45, 212, 191, 1)'
            : 'rgba(30, 41, 59, 0.9)';
          ctx.beginPath();
          ctx.roundRect(checkX, checkY, checkSize, checkSize, 3);
          ctx.fill();
          
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(checkX, checkY, checkSize, checkSize, 3);
          ctx.stroke();

          if (selectedCells.has(cellKey)) {
            // Draw checkmark
            ctx.strokeStyle = 'rgba(15, 23, 42, 1)';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(checkX + 4, checkY + 10);
            ctx.lineTo(checkX + 8, checkY + 14);
            ctx.lineTo(checkX + 16, checkY + 6);
            ctx.stroke();
          }
        }
      }

      // Draw shimmer overlay when analyzing
      if (isAnalyzing) {
        ctx.fillStyle = 'rgba(45, 212, 191, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    img.src = uploadedImage.dataUrl;
  }, [uploadedImage, gridSettings, selectedCells, hoveredCell, isAnalyzing, elasticGridEnabled]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const { columns, rows, cellWidth, cellHeight, offsetX, offsetY, spacingX, spacingY } = gridSettings;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cellX = offsetX + col * (cellWidth + spacingX);
        const cellY = offsetY + row * (cellHeight + spacingY);
        
        if (x >= cellX && x < cellX + cellWidth && y >= cellY && y < cellY + cellHeight) {
          onCellClick(`${col}-${row}`);
          return;
        }
      }
    }
  }, [gridSettings, onCellClick, scale, isPanning]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && e.buttons === 1) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const { columns, rows, cellWidth, cellHeight, offsetX, offsetY, spacingX, spacingY } = gridSettings;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cellX = offsetX + col * (cellWidth + spacingX);
        const cellY = offsetY + row * (cellHeight + spacingY);
        
        if (x >= cellX && x < cellX + cellWidth && y >= cellY && y < cellY + cellHeight) {
          setHoveredCell(`${col}-${row}`);
          return;
        }
      }
    }
    setHoveredCell(null);
  }, [gridSettings, scale, isPanning, panStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Direct panning - no modifier needed (unless in freeform, crop, or elastic grid mode)
    if (!freeformEnabled && !cropEnabled && !elasticGridEnabled) {
      // Middle mouse button or left click with alt, or just left click for direct pan
      if (e.button === 0 || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    } else if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // In freeform/crop/elastic mode, require middle click or alt+click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [freeformEnabled, cropEnabled, elasticGridEnabled]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, baseScale * 0.5), baseScale * 4));
  }, [baseScale]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, baseScale * 4));
  }, [baseScale]);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev * 0.8, baseScale * 0.5));
  }, [baseScale]);

  const handleResetView = useCallback(() => {
    setScale(baseScale);
    setPanOffset({ x: 0, y: 0 });
  }, [baseScale]);

  // Handle thumbnail navigation click
  const handleThumbnailClick = useCallback((xPercent: number, yPercent: number) => {
    // Convert percentage to actual pan offset
    const targetX = (xPercent - 0.5) * uploadedImage.width * scale * -1;
    const targetY = (yPercent - 0.5) * uploadedImage.height * scale * -1;
    setPanOffset({ x: targetX, y: targetY });
  }, [uploadedImage, scale]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex flex-col overflow-hidden bg-background relative"
    >
      {/* Collapsible Zoom Panel - Bottom Left */}
      <CollapsibleZoomPanel
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        scale={scale}
        baseScale={baseScale}
        thumbnailSrc={uploadedImage.dataUrl}
        onThumbnailClick={handleThumbnailClick}
      />

      {/* Canvas Container */}
      <div 
        className="flex-1 flex items-center justify-center overflow-hidden grid-pattern relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isAnalyzing && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={uploadedImage.width}
          height={uploadedImage.height}
          style={{ 
            transform: `scale(${scale}) translate(${panOffset.x / scale}px, ${panOffset.y / scale}px)`,
            transformOrigin: 'center',
            cursor: freeformEnabled || cropEnabled || elasticGridEnabled ? 'default' : (isPanning ? 'grabbing' : 'pointer'),
          }}
          onClick={freeformEnabled || cropEnabled || elasticGridEnabled ? undefined : handleCanvasClick}
          onMouseMove={freeformEnabled || cropEnabled || elasticGridEnabled ? undefined : handleCanvasMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          className="rounded shadow-2xl max-w-none"
        />

        {/* Freeform Canvas Overlay */}
        {freeformEnabled && onAddLine && onUpdateLine && onDeleteLine && onAddRegion && onSelectLine && (
          <FreeformCanvasOverlay
            imageWidth={uploadedImage.width}
            imageHeight={uploadedImage.height}
            scale={scale}
            panOffset={panOffset}
            containerRef={containerRef}
            selectedTool={freeformTool}
            lines={freeformLines}
            regions={freeformRegions}
            suggestions={freeformSuggestions}
            selectedLineId={selectedLineId}
            onAddLine={onAddLine}
            onUpdateLine={onUpdateLine}
            onDeleteLine={onDeleteLine}
            onAddRegion={onAddRegion}
            onSelectLine={onSelectLine}
          />
        )}

        {/* Crop Canvas Overlay */}
        {cropEnabled && onCropSelectionChange && (
          <CropCanvasOverlay
            imageWidth={uploadedImage.width}
            imageHeight={uploadedImage.height}
            scale={scale}
            panOffset={panOffset}
            containerRef={containerRef}
            shape={cropShape}
            mode={cropMode}
            isLocked={cropIsLocked}
            selection={cropSelection}
            onSelectionChange={onCropSelectionChange}
          />
        )}

        {/* Elastic Grid Overlay */}
        {elasticGridEnabled && onGuidesChange && (
          <ElasticGridOverlay
            imageWidth={uploadedImage.width}
            imageHeight={uploadedImage.height}
            scale={scale}
            panOffset={panOffset}
            containerRef={containerRef}
            guides={guidePositions}
            onGuidesChange={onGuidesChange}
            selectedCells={selectedCells}
            onCellClick={onCellClick}
            enabled={!freeformEnabled && !cropEnabled}
          />
        )}
      </div>

      {/* Hint */}
      <div className="text-[10px] text-muted-foreground text-center py-1 border-t border-border bg-card/50">
        {cropEnabled
          ? 'Click and drag to select • S to snap • Alt+drag to pan • Scroll to zoom'
          : freeformEnabled 
          ? 'Click to draw • Alt+drag to pan • Scroll to zoom • Delete to remove lines'
          : elasticGridEnabled
          ? 'Drag guides to adjust • Click cells to select • Scroll to zoom'
          : 'Drag to pan • Scroll to zoom • Click cells to select • Ctrl+A select all'
        }
      </div>
    </div>
  );
}
