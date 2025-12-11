import { Separator } from '@/components/ui/separator';
import { GridControls } from '../GridControls';
import { SlicingToolbar } from '../SlicingToolbar';
import { FreeformSlicingToolbar } from '../FreeformSlicing';
import { EditorControlPanelProps } from './types';

export function EditorControlPanel({
  uploadedImage,
  gridSettings,
  isAnalyzing,
  elasticGridEnabled,
  freeform,
  onImageUpload,
  onClearImage,
  onGridChange,
  onPresetSelect,
  onAIDetect,
}: EditorControlPanelProps) {
  return (
    <div className="p-4 space-y-4 border-b border-border bg-card/30 overflow-y-auto scrollbar-thin max-h-[45vh]">
      {/* File info when image is loaded */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-muted-foreground truncate max-w-[200px]">
            {uploadedImage?.file.name}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {uploadedImage?.width} × {uploadedImage?.height}px
          </span>
        </div>
        <button
          onClick={onClearImage}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Clear
        </button>
      </div>

      {uploadedImage && (
        <>
          <Separator className="bg-border" />
          
          <SlicingToolbar
            onPresetSelect={onPresetSelect}
            onAIDetect={onAIDetect}
            isAnalyzing={isAnalyzing}
            disabled={!uploadedImage}
          />

          <Separator className="bg-border" />

          {freeform.freeformEnabled ? (
            <FreeformSlicingToolbar
              selectedTool={freeform.selectedTool}
              expectedSpriteCount={freeform.expectedSpriteCount}
              lines={freeform.lines}
              regions={freeform.regions}
              suggestions={freeform.suggestions}
              onToolChange={freeform.setSelectedTool}
              onSpriteCountChange={freeform.setExpectedSpriteCount}
              onSmartDetect={freeform.smartDetect}
              onAcceptSuggestion={freeform.acceptSuggestion}
              onRejectSuggestion={freeform.rejectSuggestion}
              onClearAll={freeform.clearAll}
              isDetecting={freeform.isDetecting}
            />
          ) : (
            <>
              {elasticGridEnabled && (
                <div className="text-sm text-foreground/80 bg-primary/10 border border-primary/20 rounded px-3 py-2">
                  <strong className="text-primary">Elastic Grid Active:</strong> Drag the guide handles to adjust cell boundaries. Lines cannot cross each other.
                </div>
              )}
              
              <GridControls
                gridSettings={gridSettings}
                uploadedImage={uploadedImage}
                onGridChange={onGridChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
