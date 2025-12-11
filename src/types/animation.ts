// Animation types for the Animation Loom

export interface Transform {
  x: number;      // X position in pixels
  y: number;      // Y position in pixels
  scale: number;  // Scale factor (1 = 100%)
  scaleX: number; // Horizontal scale (-1 for mirror)
  scaleY: number; // Vertical scale (-1 for flip)
  rotation: number; // Rotation in degrees
  opacity: number;  // 0 to 1
}

export type EasingType = 
  | 'linear' 
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'bounce' 
  | 'elastic';

export interface Keyframe {
  id: string;
  frameIndex: number;
  imageId: string;
  imageUrl: string;
  
  // Transform properties for tweening
  transform: Transform;
  
  // Tween settings
  tweenToNext: boolean;
  easing: EasingType;
}

export interface Thread {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  keyframes: Keyframe[];
}

// Default transform for new keyframes
export const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
};

// Default keyframe factory
export const createKeyframe = (
  frameIndex: number, 
  imageId: string, 
  imageUrl: string
): Keyframe => ({
  id: crypto.randomUUID(),
  frameIndex,
  imageId,
  imageUrl,
  transform: { ...DEFAULT_TRANSFORM },
  tweenToNext: true,  // Enable tweening by default
  easing: 'ease-in-out',
});

// Migration helper for old keyframes without transform data
export const migrateKeyframe = (kf: any): Keyframe => ({
  id: kf.id || crypto.randomUUID(),
  frameIndex: kf.frameIndex,
  imageId: kf.imageId,
  imageUrl: kf.imageUrl,
  transform: {
    ...DEFAULT_TRANSFORM,
    ...kf.transform,
    scaleX: kf.transform?.scaleX ?? 1,
    scaleY: kf.transform?.scaleY ?? 1,
  },
  tweenToNext: kf.tweenToNext ?? true,
  easing: kf.easing || 'ease-in-out',
});

// Migration helper for threads
export const migrateThread = (thread: any): Thread => ({
  id: thread.id,
  name: thread.name,
  visible: thread.visible ?? true,
  locked: thread.locked ?? false,
  keyframes: (thread.keyframes || []).map(migrateKeyframe),
});