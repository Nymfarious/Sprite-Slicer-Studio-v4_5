import { useState, useRef, useEffect } from 'react';
import { Undo2, Redo2, Send, RotateCw, FlipHorizontal, FlipVertical, Move, Eraser, Scan, Maximize, CheckSquare, SquareSlash, Grid3X3, Film, Menu, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CropToolPopover } from '../CropToolPopover';
import { CookieCutterPopover } from '../CookieCutterPopover';
import { AdvancedSettingsPopover } from '../AdvancedSettingsPopover';
import { ExportPopover } from '../ExportPopover';
import { KeyboardShortcutsPopover } from '../KeyboardShortcutsPopover';
import { FreeformPopover } from '../FreeformPopover';
import { rotateImage90CW, mirrorImageHorizontal, flipImageVertical } from '@/lib/imageTransforms';
import { toast } from 'sonner';
import { EditorToolbarProps } from './types';
import { FreeformTool, SliceLine, SliceRegion, AISuggestion } from '../freeform/types';

export function EditorToolbar({
  uploadedImage,
  selectedCells,
  canUndo,
  canRedo,
  elasticGridEnabled,
  gridSettings,
  isAnalyzing,
  cropTool,
  freeformEnabled,
  activeWorkspace,
  onWorkspaceChange,
  onUndo,
  onRedo,
  onElasticToggle,
  onGridChange,
  onImageUpdate,
  onSelectAll,
  onDeselectAll,
  onSlice,
  onPresetSelect,
  onAIDetect,
  onFreeformToggle,
  onCropAndSave,
  onReloadImage,
  freeform,
}: EditorToolbarProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && toolbarRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const toolbarWidth = toolbarRef.current.scrollWidth;
        setShowOverflow(toolbarWidth > containerWidth - 50);
      }
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [uploadedImage]);

  const handleRotate = async () => {
    if (!uploadedImage) return;
    const newDataUrl = await rotateImage90CW(uploadedImage.dataUrl);
    onImageUpdate(newDataUrl);
    toast.success('Rotated 90° clockwise');
  };

  const handleMirror = async () => {
    if (!uploadedImage) return;
    const newDataUrl = await mirrorImageHorizontal(uploadedImage.dataUrl);
    onImageUpdate(newDataUrl);
    toast.success('Mirrored horizontally');
  };

  const handleFlip = async () => {
    if (!uploadedImage) return;
    const newDataUrl = await flipImageVertical(uploadedImage.dataUrl);
    onImageUpdate(newDataUrl);
    toast.success('Flipped vertically');
  };

  return (
    <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2 flex-shrink-0 sticky top-0 z-10">
      {/* Workspace Tabs */}
      <div className="flex items-center gap-1 flex-shrink-0 mr-2">
        <Button
          variant={activeWorkspace === 'splicing' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5"
          onClick={() => onWorkspaceChange?.('splicing')}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
          Splicing Mat
        </Button>
        <Button
          variant={activeWorkspace === 'mending' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5"
          onClick={() => onWorkspaceChange?.('mending')}
        >
          <Film className="h-3.5 w-3.5" />
          Mending Loom
        </Button>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Shortcuts and Reload */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <KeyboardShortcutsPopover variant="splicing" />
        {onReloadImage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onReloadImage}
                disabled={!uploadedImage}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Reload Previous Image</TooltipContent>
          </Tooltip>
        )}
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <div ref={toolbarRef} className="flex items-center gap-1 justify-end">
          {uploadedImage && !showOverflow && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Recenter View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo} disabled={!canUndo}>
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo} disabled={!canRedo}>
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={elasticGridEnabled ? "default" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onElasticToggle}
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {elasticGridEnabled ? 'Disable' : 'Enable'} Elastic Grid
                </TooltipContent>
              </Tooltip>

              <CookieCutterPopover
                disabled={!uploadedImage}
                onPresetSelect={onPresetSelect}
                onAIDetect={onAIDetect}
                isAnalyzing={isAnalyzing}
              />

              <CropToolPopover
                isActive={cropTool.isActive}
                onToggle={cropTool.toggle}
                shape={cropTool.shape}
                onShapeChange={cropTool.setShape}
                mode={cropTool.mode}
                onModeChange={cropTool.setMode}
                isLocked={cropTool.isLocked}
                onLockToggle={cropTool.toggleLock}
                selection={cropTool.selection}
                onApply={() => cropTool.applyCrop(uploadedImage.dataUrl, onImageUpdate)}
                onApplyAndSave={onCropAndSave}
                onCancel={cropTool.cancel}
                onClearSelection={() => cropTool.setSelection(null)}
                disabled={!uploadedImage}
                hasGridSelection={selectedCells.size > 0}
                useGridSelection={cropTool.useGridSelection}
                onUseGridSelectionChange={cropTool.setUseGridSelection}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eraser className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Remove Solid Background</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Scan className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                  AI Artifact Detector: Scans selected cells for strange artifacts and offers to remove them (coming soon)
                </TooltipContent>
              </Tooltip>

              <AdvancedSettingsPopover
                gridSettings={gridSettings}
                onGridChange={onGridChange}
                disabled={!uploadedImage}
              />

              {/* Freeform Mode Popover */}
              {freeform && onFreeformToggle && (
                <FreeformPopover
                  disabled={!uploadedImage}
                  freeformEnabled={freeform.freeformEnabled}
                  selectedTool={freeform.selectedTool}
                  expectedSpriteCount={freeform.expectedSpriteCount}
                  lines={freeform.lines}
                  regions={freeform.regions}
                  suggestions={freeform.suggestions}
                  isDetecting={freeform.isDetecting}
                  onToggle={freeform.toggleFreeform}
                  onToolChange={freeform.setSelectedTool}
                  onSpriteCountChange={freeform.setExpectedSpriteCount}
                  onSmartDetect={freeform.smartDetect}
                  onAcceptSuggestion={freeform.acceptSuggestion}
                  onRejectSuggestion={freeform.rejectSuggestion}
                  onClearAll={freeform.clearAll}
                />
              )}

              <div className="w-px h-5 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Rotate 90° CW</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMirror}>
                    <FlipHorizontal className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Mirror Horizontal</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFlip}>
                    <FlipVertical className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Flip Vertical</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSelectAll}>
                    <CheckSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Select All (Ctrl+A)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDeselectAll} disabled={selectedCells.size === 0}>
                    <SquareSlash className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Select None (Esc)</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-border mx-1" />

              <ExportPopover disabled={!uploadedImage} />
            </>
          )}

          {/* Overflow Menu */}
          {uploadedImage && showOverflow && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                  <DropdownMenuItem onClick={() => {}} className="gap-2">
                    <Maximize className="w-4 h-4" /> Recenter View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onUndo} disabled={!canUndo} className="gap-2">
                    <Undo2 className="w-4 h-4" /> Undo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRedo} disabled={!canRedo} className="gap-2">
                    <Redo2 className="w-4 h-4" /> Redo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onElasticToggle} className="gap-2">
                    <Move className="w-4 h-4" /> {elasticGridEnabled ? 'Disable' : 'Enable'} Elastic Grid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}} className="gap-2">
                    <Eraser className="w-4 h-4" /> Remove Background
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}} className="gap-2">
                    <Scan className="w-4 h-4" /> AI Artifact Detector
                  </DropdownMenuItem>
                  {freeform && onFreeformToggle && (
                    <DropdownMenuItem onClick={freeform.toggleFreeform} className="gap-2">
                      <Move className="w-4 h-4" /> {freeform.freeformEnabled ? 'Disable' : 'Enable'} Freeform Mode
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRotate} className="gap-2">
                    <RotateCw className="w-4 h-4" /> Rotate 90° CW
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMirror} className="gap-2">
                    <FlipHorizontal className="w-4 h-4" /> Mirror Horizontal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFlip} className="gap-2">
                    <FlipVertical className="w-4 h-4" /> Flip Vertical
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSelectAll} className="gap-2">
                    <CheckSquare className="w-4 h-4" /> Select All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDeselectAll} disabled={selectedCells.size === 0} className="gap-2">
                    <SquareSlash className="w-4 h-4" /> Clear Selections
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CookieCutterPopover
                disabled={!uploadedImage}
                onPresetSelect={onPresetSelect}
                onAIDetect={onAIDetect}
                isAnalyzing={isAnalyzing}
              />

              <CropToolPopover
                isActive={cropTool.isActive}
                onToggle={cropTool.toggle}
                shape={cropTool.shape}
                onShapeChange={cropTool.setShape}
                mode={cropTool.mode}
                onModeChange={cropTool.setMode}
                isLocked={cropTool.isLocked}
                onLockToggle={cropTool.toggleLock}
                selection={cropTool.selection}
                onApply={() => cropTool.applyCrop(uploadedImage.dataUrl, onImageUpdate)}
                onApplyAndSave={onCropAndSave}
                onCancel={cropTool.cancel}
                onClearSelection={() => cropTool.setSelection(null)}
                disabled={!uploadedImage}
                hasGridSelection={selectedCells.size > 0}
                useGridSelection={cropTool.useGridSelection}
                onUseGridSelectionChange={cropTool.setUseGridSelection}
              />

              <AdvancedSettingsPopover
                gridSettings={gridSettings}
                onGridChange={onGridChange}
                disabled={!uploadedImage}
              />

              <ExportPopover disabled={!uploadedImage} />
            </>
          )}
          
          <Button
            onClick={onSlice}
            size="sm"
            disabled={!uploadedImage || selectedCells.size === 0}
            className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 mr-2" />
            Send to Library {selectedCells.size > 0 ? `(${selectedCells.size})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
