import { GridSettings, UploadedImage, SpriteAsset, Tag } from '@/types/sprite';
import { GuidePositions } from '../ElasticGridOverlay';
import { SliceLine, SliceRegion, AISuggestion, FreeformTool } from '../freeform/types';
import { CropShape, CropMode, CropSelection } from '@/components/CropTool';

export interface EditorPanelProps {
  onSliceComplete: (assets: Omit<SpriteAsset, 'id' | 'createdAt'>[]) => void;
  sliceBackground?: 'transparent' | 'black' | 'white';
  activeWorkspace?: string;
  onWorkspaceChange?: (workspace: string) => void;
  tags?: Tag[];
  onQuickTagSelect?: (tagIds: string[]) => void;
}

export interface SelectionState {
  cells: string[];
}

export interface EditorToolbarProps {
  uploadedImage: UploadedImage | null;
  selectedCells: Set<string>;
  canUndo: boolean;
  canRedo: boolean;
  elasticGridEnabled: boolean;
  gridSettings: GridSettings;
  isAnalyzing?: boolean;
  freeformEnabled?: boolean;
  activeWorkspace?: string;
  cropTool: {
    isActive: boolean;
    toggle: () => void;
    shape: CropShape;
    setShape: (shape: CropShape) => void;
    mode: CropMode;
    setMode: (mode: CropMode) => void;
    isLocked: boolean;
    toggleLock: () => void;
    selection: CropSelection | null;
    applyCrop: (dataUrl: string, onUpdate: (newDataUrl: string) => void) => void;
    cancel: () => void;
    useGridSelection: boolean;
    setUseGridSelection: (use: boolean) => void;
    setSelection: (selection: CropSelection | null) => void;
  };
  freeform?: {
    freeformEnabled: boolean;
    selectedTool: FreeformTool;
    expectedSpriteCount: number;
    lines: SliceLine[];
    regions: SliceRegion[];
    suggestions: AISuggestion[];
    isDetecting: boolean;
    toggleFreeform: () => void;
    setSelectedTool: (tool: FreeformTool) => void;
    setExpectedSpriteCount: (count: number) => void;
    smartDetect: () => void;
    acceptSuggestion: (id: string) => void;
    rejectSuggestion: (id: string) => void;
    clearAll: () => void;
  };
  onWorkspaceChange?: (workspace: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onElasticToggle: () => void;
  onGridChange: (updates: Partial<GridSettings>) => void;
  onImageUpdate: (newDataUrl: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSlice: () => void;
  onPresetSelect: (columns: number, rows: number) => void;
  onAIDetect: () => void;
  onFreeformToggle?: () => void;
  onCropAndSave?: () => void;
  onReloadImage?: () => void;
}

export interface EditorCanvasProps {
  uploadedImage: UploadedImage | null;
  gridSettings: GridSettings;
  selectedCells: Set<string>;
  isAnalyzing: boolean;
  freeform: {
    freeformEnabled: boolean;
    selectedTool: FreeformTool;
    lines: SliceLine[];
    regions: SliceRegion[];
    suggestions: AISuggestion[];
    selectedLineId: string | null;
    addLine: (line: Omit<SliceLine, 'id'>) => void;
    updateLine: (id: string, updates: Partial<SliceLine>) => void;
    deleteLine: (id: string) => void;
    addRegion: (region: Omit<SliceRegion, 'id'>) => void;
    setSelectedLineId: (id: string | null) => void;
  };
  cropTool: {
    isActive: boolean;
    shape: CropShape;
    mode: CropMode;
    isLocked: boolean;
    selection: CropSelection | null;
    setSelection: (selection: CropSelection | null) => void;
  };
  elasticGridEnabled: boolean;
  guidePositions: GuidePositions;
  onCellClick: (cellKey: string) => void;
  onGuidesChange: (guides: GuidePositions) => void;
}

export interface EditorControlPanelProps {
  uploadedImage: UploadedImage | null;
  gridSettings: GridSettings;
  isAnalyzing: boolean;
  elasticGridEnabled: boolean;
  freeform: {
    freeformEnabled: boolean;
    selectedTool: FreeformTool;
    expectedSpriteCount: number;
    lines: SliceLine[];
    regions: SliceRegion[];
    suggestions: AISuggestion[];
    isDetecting: boolean;
    toggleFreeform: () => void;
    setSelectedTool: (tool: FreeformTool) => void;
    setExpectedSpriteCount: (count: number) => void;
    smartDetect: () => void;
    acceptSuggestion: (id: string) => void;
    rejectSuggestion: (id: string) => void;
    clearAll: () => void;
  };
  onImageUpload: (image: UploadedImage | null) => void;
  onClearImage: () => void;
  onGridChange: (updates: Partial<GridSettings>) => void;
  onPresetSelect: (columns: number, rows: number) => void;
  onAIDetect: () => void;
}

export const defaultGridSettings: GridSettings = {
  columns: 4,
  rows: 4,
  cellWidth: 32,
  cellHeight: 32,
  offsetX: 0,
  offsetY: 0,
  spacingX: 0,
  spacingY: 0,
};
