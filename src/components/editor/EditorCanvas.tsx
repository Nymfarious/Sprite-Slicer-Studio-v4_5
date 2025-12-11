import { Scissors } from 'lucide-react';
import { SpritePreview } from '../SpritePreview';
import { EditorCanvasProps } from './types';

export function EditorCanvas({
  uploadedImage,
  gridSettings,
  selectedCells,
  isAnalyzing,
  freeform,
  cropTool,
  elasticGridEnabled,
  guidePositions,
  onCellClick,
  onGuidesChange,
}: EditorCanvasProps) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden relative bg-background">
      {uploadedImage ? (
        <div className="absolute inset-0">
          <SpritePreview
            uploadedImage={uploadedImage}
            gridSettings={gridSettings}
            selectedCells={selectedCells}
            onCellClick={onCellClick}
            isAnalyzing={isAnalyzing}
            freeformEnabled={freeform.freeformEnabled}
            freeformTool={freeform.selectedTool}
            freeformLines={freeform.lines}
            freeformRegions={freeform.regions}
            freeformSuggestions={freeform.suggestions}
            selectedLineId={freeform.selectedLineId}
            onAddLine={freeform.addLine}
            onUpdateLine={freeform.updateLine}
            onDeleteLine={freeform.deleteLine}
            onAddRegion={freeform.addRegion}
            onSelectLine={freeform.setSelectedLineId}
            cropEnabled={cropTool.isActive}
            cropShape={cropTool.shape}
            cropMode={cropTool.mode}
            cropIsLocked={cropTool.isLocked}
            cropSelection={cropTool.selection}
            onCropSelectionChange={cropTool.setSelection}
            elasticGridEnabled={elasticGridEnabled}
            guidePositions={guidePositions}
            onGuidesChange={onGuidesChange}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground grid-pattern">
          <div className="text-center">
            <Scissors className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Upload a sprite sheet to begin</p>
          </div>
        </div>
      )}
    </div>
  );
}
