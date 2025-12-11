import { useState, useCallback, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CollapsibleZoomPanelProps {
  scale: number;
  baseScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  thumbnailSrc?: string;
  viewportRect?: { x: number; y: number; width: number; height: number };
  onThumbnailClick?: (x: number, y: number) => void;
}

export function CollapsibleZoomPanel({
  scale,
  baseScale,
  onZoomIn,
  onZoomOut,
  onResetView,
  thumbnailSrc,
  viewportRect,
  onThumbnailClick,
}: CollapsibleZoomPanelProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage('zoom-panel-expanded', true);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = useCallback((e: React.MouseEvent) => {
    if (!thumbnailRef.current || !onThumbnailClick) return;
    
    const rect = thumbnailRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onThumbnailClick(x, y);
  }, [onThumbnailClick]);

  const zoomPercentage = Math.round((scale / baseScale) * 100);

  return (
    <div 
      className={`
        absolute bottom-4 left-4 z-20
        bg-card/90 backdrop-blur-md rounded-lg border border-border
        shadow-lg transition-all duration-300 ease-out
        ${isExpanded ? 'w-48' : 'w-auto'}
      `}
    >
      {/* Collapsed State */}
      {!isExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="gap-2 px-3"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-xs font-mono">{zoomPercentage}%</span>
          <ChevronUp className="w-3 h-3" />
        </Button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Header with collapse button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Navigator</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          {/* Thumbnail Navigator */}
          {thumbnailSrc && (
            <div 
              ref={thumbnailRef}
              className="relative aspect-video bg-secondary/50 rounded border border-border overflow-hidden cursor-crosshair"
              onClick={handleThumbnailClick}
            >
              <img 
                src={thumbnailSrc} 
                alt="Navigation thumbnail" 
                className="w-full h-full object-contain"
              />
              {viewportRect && (
                <div 
                  className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                  style={{
                    left: `${viewportRect.x * 100}%`,
                    top: `${viewportRect.y * 100}%`,
                    width: `${viewportRect.width * 100}%`,
                    height: `${viewportRect.height * 100}%`,
                  }}
                />
              )}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center justify-between gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onZoomOut}
                  className="h-7 w-7"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Zoom Out</TooltipContent>
            </Tooltip>

            <div className="flex-1 text-center">
              <span className="text-xs font-mono text-foreground">
                {zoomPercentage}%
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onZoomIn}
                  className="h-7 w-7"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Zoom In</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onResetView}
                  className="h-7 w-7"
                >
                  <Move className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reset View</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
