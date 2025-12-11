import { useState, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { EditorToolbar, EditorCanvas, EditorControlPanel, useEditorState, EditorPanelProps } from './editor';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { QuickTagPanel } from './QuickTagPanel';
import { SaveToLibraryDialog } from './SaveToLibraryDialog';
import { SpriteAsset, UploadedImage } from '@/types/sprite';
import { toast } from 'sonner';

export function EditorPanel({ onSliceComplete, sliceBackground = 'transparent', activeWorkspace, onWorkspaceChange, tags = [], onQuickTagSelect }: EditorPanelProps) {
  const [showQuickTag, setShowQuickTag] = useState(false);
  const [quickTagSelection, setQuickTagSelection] = useState<string[]>([]);
  const [controlPanelOpen, setControlPanelOpen] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [croppedImageData, setCroppedImageData] = useState<{ dataUrl: string; width: number; height: number } | null>(null);
  const originalImageRef = useRef<UploadedImage | null>(null);
  const {
    uploadedImage,
    setUploadedImage,
    gridSettings,
    isAnalyzing,
    elasticGridEnabled,
    setElasticGridEnabled,
    guidePositions,
    freeform,
    cropTool,
    selectedCells,
    canUndo,
    canRedo,
    undo,
    redo,
    handleGuidesChange,
    handleImageUpdate,
    handleNavigate,
    handleGridChange,
    handlePresetSelect,
    handleAIDetect,
    handleCellClick,
    handleSelectAll,
    handleDeselectAll,
    handleClearImage,
    handleSlice,
  } = useEditorState({ onSliceComplete, sliceBackground });

  useKeyboardShortcuts({
    onUndo: canUndo ? undo : undefined,
    onRedo: canRedo ? redo : undefined,
    onSelectAll: uploadedImage ? handleSelectAll : undefined,
    onDeselectAll: selectedCells.size > 0 ? handleDeselectAll : undefined,
    onNavigateUp: uploadedImage ? () => handleNavigate('up') : undefined,
    onNavigateDown: uploadedImage ? () => handleNavigate('down') : undefined,
    onNavigateLeft: uploadedImage ? () => handleNavigate('left') : undefined,
    onNavigateRight: uploadedImage ? () => handleNavigate('right') : undefined,
    onConfirm: uploadedImage && selectedCells.size > 0 ? handleSlice : undefined,
    enabled: true,
  });

  // Handle crop and save to library
  const handleCropAndSave = useCallback(() => {
    if (!uploadedImage || !cropTool.selection) return;
    
    // Apply the crop first, then show dialog
    cropTool.applyCrop(uploadedImage.dataUrl, (newDataUrl) => {
      // Get dimensions from the cropped result
      const img = new Image();
      img.onload = () => {
        setCroppedImageData({
          dataUrl: newDataUrl,
          width: img.width,
          height: img.height,
        });
        setSaveDialogOpen(true);
      };
      img.src = newDataUrl;
      
      // Also update the main image
      handleImageUpdate(newDataUrl);
    });
  }, [uploadedImage, cropTool, handleImageUpdate]);

  const handleSaveToLibrary = useCallback((name: string, tagIds: string[]) => {
    if (!croppedImageData) return;
    
    const asset: Omit<SpriteAsset, 'id' | 'createdAt'> = {
      name,
      imageData: croppedImageData.dataUrl,
      coordinates: {
        x: 0,
        y: 0,
        width: croppedImageData.width,
        height: croppedImageData.height,
      },
      sourceSheet: {
        filename: uploadedImage?.file.name || 'cropped-sprite',
        originalWidth: uploadedImage?.width || croppedImageData.width,
        originalHeight: uploadedImage?.height || croppedImageData.height,
      },
      tags: tagIds,
    };
    
    onSliceComplete([asset]);
    setCroppedImageData(null);
  }, [croppedImageData, uploadedImage, onSliceComplete]);

  // Track the original image when it changes
  const handleSetUploadedImage = useCallback((newImage: UploadedImage | null) => {
    if (newImage && (!uploadedImage || uploadedImage.file !== newImage.file)) {
      // New file uploaded, store as original
      originalImageRef.current = newImage;
    }
    setUploadedImage(newImage);
  }, [uploadedImage, setUploadedImage]);

  // Reload original image (before any transforms)
  const handleReloadImage = useCallback(() => {
    if (originalImageRef.current) {
      setUploadedImage(originalImageRef.current);
      toast.success('Original image restored');
    } else {
      toast.info('No original image to reload');
    }
  }, [setUploadedImage]);

  return (
    <div className="h-full flex flex-col pt-14">
      {/* Image Upload Area - Above the mat */}
      {!uploadedImage && !showQuickTag && (
        <div className="p-4 border-b border-border bg-card/30">
          <div className="max-w-md mx-auto">
            <div
              className={`upload-zone p-6 text-center`}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target?.result as string;
                    const img = new Image();
                    img.onload = () => {
                      handleSetUploadedImage({
                        file,
                        dataUrl,
                        width: img.width,
                        height: img.height,
                      });
                      if (tags.length > 0) {
                        setShowQuickTag(true);
                      }
                    };
                    img.src = dataUrl;
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.svg,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      const img = new Image();
                      img.onload = () => {
                        handleSetUploadedImage({
                          file,
                          dataUrl,
                          width: img.width,
                          height: img.height,
                        });
                        if (tags.length > 0) {
                          setShowQuickTag(true);
                        }
                      };
                      img.src = dataUrl;
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
                className="hidden"
                id="main-image-upload"
              />
              <label htmlFor="main-image-upload" className="cursor-pointer block">
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-muted-foreground/30 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground">📋</span>
                </div>
                <p className="text-sm text-foreground mb-1">
                  Drop a sprite sheet here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse • PNG, JPG, GIF, SVG, WebP
                </p>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tag Panel after import */}
      {showQuickTag && uploadedImage && (
        <div className="p-4 border-b border-border bg-card/30">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted/50">
                <img src={uploadedImage.dataUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground truncate">{uploadedImage.file.name}</p>
                <p className="text-xs text-muted-foreground">{uploadedImage.width} × {uploadedImage.height}px</p>
              </div>
            </div>
            <QuickTagPanel
              tags={tags}
              selectedTags={quickTagSelection}
              onTagToggle={(tagId) => {
                setQuickTagSelection(prev =>
                  prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
                );
              }}
              onConfirm={() => {
                onQuickTagSelect?.(quickTagSelection);
                setShowQuickTag(false);
                setQuickTagSelection([]);
              }}
              onSkip={() => {
                setShowQuickTag(false);
                setQuickTagSelection([]);
              }}
            />
          </div>
        </div>
      )}

      {/* Collapsible Control Panel with clickable divider */}
      {uploadedImage && !showQuickTag && (
        <Collapsible open={controlPanelOpen} onOpenChange={setControlPanelOpen}>
          <CollapsibleContent>
            <EditorControlPanel
              uploadedImage={uploadedImage}
              gridSettings={gridSettings}
              isAnalyzing={isAnalyzing}
              elasticGridEnabled={elasticGridEnabled}
              freeform={freeform}
              onImageUpload={setUploadedImage}
              onClearImage={handleClearImage}
              onGridChange={handleGridChange}
              onPresetSelect={handlePresetSelect}
              onAIDetect={handleAIDetect}
            />
          </CollapsibleContent>
          
          {/* Clickable divider to toggle */}
          <button 
            onClick={() => setControlPanelOpen(!controlPanelOpen)}
            className="w-full h-6 flex items-center justify-center bg-muted/50 border-b border-border flex-shrink-0 hover:bg-muted/80 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors" />
              {controlPanelOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              )}
            </div>
          </button>
        </Collapsible>
      )}

      {/* Drag handle when no image */}
      {!uploadedImage && !showQuickTag && (
        <div className="h-2 flex items-center justify-center bg-muted/50 border-b border-border flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>
      )}

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <EditorToolbar
          uploadedImage={uploadedImage}
          selectedCells={selectedCells}
          canUndo={canUndo}
          canRedo={canRedo}
          elasticGridEnabled={elasticGridEnabled}
          gridSettings={gridSettings}
          isAnalyzing={isAnalyzing}
          freeformEnabled={freeform.freeformEnabled}
          activeWorkspace={activeWorkspace}
          cropTool={cropTool}
          freeform={freeform}
          onWorkspaceChange={onWorkspaceChange}
          onUndo={undo}
          onRedo={redo}
          onElasticToggle={() => setElasticGridEnabled(!elasticGridEnabled)}
          onGridChange={handleGridChange}
          onImageUpdate={handleImageUpdate}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onSlice={handleSlice}
          onPresetSelect={handlePresetSelect}
          onAIDetect={handleAIDetect}
          onFreeformToggle={freeform.toggleFreeform}
          onCropAndSave={handleCropAndSave}
          onReloadImage={handleReloadImage}
        />
        
        <EditorCanvas
          uploadedImage={uploadedImage}
          gridSettings={gridSettings}
          selectedCells={selectedCells}
          isAnalyzing={isAnalyzing}
          freeform={freeform}
          cropTool={cropTool}
          elasticGridEnabled={elasticGridEnabled}
          guidePositions={guidePositions}
          onCellClick={handleCellClick}
          onGuidesChange={handleGuidesChange}
        />
      </div>

      {/* Save to Library Dialog */}
      {croppedImageData && (
        <SaveToLibraryDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          imageDataUrl={croppedImageData.dataUrl}
          imageWidth={croppedImageData.width}
          imageHeight={croppedImageData.height}
          defaultName={`Cropped_${uploadedImage?.file.name?.replace(/\.[^/.]+$/, '') || 'sprite'}`}
          availableTags={tags}
          onSave={handleSaveToLibrary}
        />
      )}
    </div>
  );
}
