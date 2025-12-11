import { Minus, Square, Lasso, Hexagon, MousePointer, GripVertical } from 'lucide-react';

export type FreeformTool = 
  | 'select' 
  | 'h-line' 
  | 'v-line' 
  | 'rectangle' 
  | 'lasso' 
  | 'polygon';

export interface SliceLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export interface SliceRegion {
  id: string;
  type: 'rectangle' | 'lasso' | 'polygon';
  points: { x: number; y: number }[];
  bounds: { x: number; y: number; width: number; height: number };
}

export interface AISuggestion {
  id: string;
  type: 'line' | 'region';
  data: SliceLine | SliceRegion;
  confidence: number;
  accepted: boolean | null;
}

export interface FreeformSlicingProps {
  imageWidth: number;
  imageHeight: number;
  lines: SliceLine[];
  regions: SliceRegion[];
  suggestions: AISuggestion[];
  selectedTool: FreeformTool;
  selectedLineId: string | null;
  expectedSpriteCount: number;
  onToolChange: (tool: FreeformTool) => void;
  onAddLine: (line: Omit<SliceLine, 'id'>) => void;
  onUpdateLine: (id: string, updates: Partial<SliceLine>) => void;
  onDeleteLine: (id: string) => void;
  onAddRegion: (region: Omit<SliceRegion, 'id'>) => void;
  onDeleteRegion: (id: string) => void;
  onSelectLine: (id: string | null) => void;
  onSpriteCountChange: (count: number) => void;
  onSmartDetect: () => void;
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onClearAll: () => void;
  isDetecting: boolean;
}

export const tools: { id: FreeformTool; icon: typeof Minus; label: string; shortcut?: string }[] = [
  { id: 'select', icon: MousePointer, label: 'Select & Move', shortcut: 'V' },
  { id: 'h-line', icon: Minus, label: 'Horizontal Line', shortcut: 'H' },
  { id: 'v-line', icon: GripVertical, label: 'Vertical Line', shortcut: 'L' },
  { id: 'rectangle', icon: Square, label: 'Rectangle Select', shortcut: 'R' },
  { id: 'lasso', icon: Lasso, label: 'Lasso Select', shortcut: 'F' },
  { id: 'polygon', icon: Hexagon, label: 'Polygon Select', shortcut: 'P' },
];
