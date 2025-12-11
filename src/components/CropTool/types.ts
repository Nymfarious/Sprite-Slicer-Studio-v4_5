export type CropShape = 'rectangle' | 'ellipse' | 'octagon';
export type CropMode = 'keep' | 'remove';

export interface CropSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: CropShape;
}

export interface CropToolbarProps {
  isActive: boolean;
  onToggle: () => void;
  shape: CropShape;
  onShapeChange: (shape: CropShape) => void;
  mode: CropMode;
  onModeChange: (mode: CropMode) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  selection: CropSelection | null;
  onApply: () => void;
  onCancel: () => void;
  useGridSelection?: boolean;
  onUseGridSelectionChange?: (use: boolean) => void;
  hasGridSelection?: boolean;
}

export interface CropCanvasOverlayProps {
  imageWidth: number;
  imageHeight: number;
  scale: number;
  panOffset: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  shape: CropShape;
  mode: CropMode;
  isLocked: boolean;
  selection: CropSelection | null;
  onSelectionChange: (selection: CropSelection | null) => void;
}
