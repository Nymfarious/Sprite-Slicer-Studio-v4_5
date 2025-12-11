export interface SliceCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAsset {
  id: string;
  name: string;
  imageData: string; // Base64 encoded
  coordinates: SliceCoordinates;
  sourceSheet: {
    filename: string;
    originalWidth: number;
    originalHeight: number;
  };
  createdAt: number;
  tags?: string[];
  enhanced?: boolean; // Flag for AI-enhanced sprites
  enhancementPrompt?: string; // The prompt used for enhancement
}

export interface GridSettings {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  spacingX: number;
  spacingY: number;
}

export interface UploadedImage {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}

export interface EditorState {
  uploadedImage: UploadedImage | null;
  gridSettings: GridSettings;
  selectedCells: Set<string>;
}

export type TagIcon = 'star' | 'heart' | 'bookmark' | 'zap' | 'palette' | 'user' | 'box';

export interface Tag {
  id: string;
  name: string;
  color: string; // hex color
  icon: TagIcon;
  createdAt: number;
}

export type AvatarShape = 'circle' | 'square' | 'octagon';

export interface AppPreferences {
  autoSave: boolean;
  autoSavePath?: string; // Directory handle name for File System Access API
  gridColor: string;
  exportFormat: 'png' | 'webp' | 'jpeg' | 'svg';
  exportQuality: number;
  sliceBackground: 'transparent' | 'black' | 'white';
  tags: Tag[];
  theme: string; // Theme preset name
  userName?: string;
  userAvatar?: string; // Base64 or local path
  avatarShape?: AvatarShape;
  avatarPosition?: { x: number; y: number };
}

export interface ExportPackFrames {
  [filename: string]: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ExportPackMeta {
  source: string;
  size: {
    w: number;
    h: number;
  };
  generated: string;
  app: string;
}

export interface ExportPackJSON {
  frames: ExportPackFrames;
  meta: ExportPackMeta;
}

// Section 8: Projects & Folder System
export interface Folder {
  id: string;
  name: string;
  parentId?: string; // for nesting (max 2 levels)
  imageIds: string[];
  thumbnailId?: string;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  thumbnailId?: string; // keyframe image
  folders: Folder[];
  rootImageIds: string[]; // images not in any folder
  createdAt: number;
  updatedAt: number;
}
