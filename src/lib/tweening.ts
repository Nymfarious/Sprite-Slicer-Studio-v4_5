// src/lib/tweening.ts

import { Transform, EasingType, Keyframe } from '@/types/animation';

// ============================================
// EASING FUNCTIONS
// ============================================

export const easings: Record<EasingType, (t: number) => number> = {
  'linear': (t) => t,
  
  'ease-in': (t) => t * t,
  
  'ease-out': (t) => 1 - Math.pow(1 - t, 2),
  
  'ease-in-out': (t) => 
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  'bounce': (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  
  'elastic': (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
};

// ============================================
// INTERPOLATION FUNCTIONS
// ============================================

/**
 * Interpolate a single value
 */
export function interpolate(
  start: number,
  end: number,
  progress: number,
  easing: EasingType = 'ease-in-out'
): number {
  const t = easings[easing](progress);
  return start + (end - start) * t;
}

/**
 * Interpolate a full transform object
 */
export function interpolateTransform(
  start: Transform,
  end: Transform,
  progress: number,
  easing: EasingType = 'ease-in-out'
): Transform {
  return {
    x: interpolate(start.x, end.x, progress, easing),
    y: interpolate(start.y, end.y, progress, easing),
    scale: interpolate(start.scale, end.scale, progress, easing),
    scaleX: interpolate(start.scaleX, end.scaleX, progress, easing),
    scaleY: interpolate(start.scaleY, end.scaleY, progress, easing),
    rotation: interpolate(start.rotation, end.rotation, progress, easing),
    opacity: interpolate(start.opacity, end.opacity, progress, easing),
  };
}

/**
 * Get the rendered state at any frame for a single thread
 * Returns which image to show and what transform to apply
 */
export function getFrameState(
  frameIndex: number,
  keyframes: Keyframe[]
): { imageId: string; imageUrl: string; transform: Transform } | null {
  if (keyframes.length === 0) return null;
  
  // Sort keyframes by frame index
  const sorted = [...keyframes].sort((a, b) => a.frameIndex - b.frameIndex);
  
  // Find the keyframe at or before this frame
  const prevKeyframe = sorted
    .filter(k => k.frameIndex <= frameIndex)
    .pop();
  
  // If no keyframe at or before, nothing to show
  if (!prevKeyframe) return null;
  
  // Find the next keyframe (if any)
  const nextKeyframe = sorted
    .find(k => k.frameIndex > frameIndex);
  
  // If no next keyframe, or tweening disabled, hold at previous
  if (!nextKeyframe || !prevKeyframe.tweenToNext) {
    return {
      imageId: prevKeyframe.imageId,
      imageUrl: prevKeyframe.imageUrl,
      transform: prevKeyframe.transform,
    };
  }
  
  // Calculate progress between keyframes
  const segmentLength = nextKeyframe.frameIndex - prevKeyframe.frameIndex;
  const progress = (frameIndex - prevKeyframe.frameIndex) / segmentLength;
  
  // Interpolate transform
  const transform = interpolateTransform(
    prevKeyframe.transform,
    nextKeyframe.transform,
    progress,
    prevKeyframe.easing
  );
  
  return {
    imageId: prevKeyframe.imageId,
    imageUrl: prevKeyframe.imageUrl,
    transform,
  };
}

/**
 * Get all frame states for a thread (for export)
 */
export function getAllFrameStates(
  keyframes: Keyframe[],
  totalFrames: number
): Array<{ imageId: string; imageUrl: string; transform: Transform } | null> {
  return Array.from({ length: totalFrames }, (_, i) => 
    getFrameState(i, keyframes)
  );
}

/**
 * Get composite frame states for all visible threads at a given frame
 */
export function getCompositeFrameStates(
  threads: Array<{ id: string; visible: boolean; keyframes: Keyframe[] }>,
  frameIndex: number
): Array<{ threadId: string; imageId: string; imageUrl: string; transform: Transform }> {
  return threads
    .filter(t => t.visible)
    .map(thread => {
      const state = getFrameState(frameIndex, thread.keyframes);
      if (!state) return null;
      return {
        threadId: thread.id,
        ...state,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
}
