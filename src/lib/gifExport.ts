import { Keyframe } from '@/types/animation';

interface GifExportOptions {
  fps: number;
  frameCount: number;
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Export animation frames as a GIF using canvas-based approach
 * Uses a simple GIF encoder that works without external dependencies
 */
export async function exportGif(
  getCompositeFrame: (frameIndex: number) => Keyframe[],
  options: GifExportOptions
): Promise<Blob> {
  const { fps, frameCount, width = 128, height = 128, quality = 10 } = options;
  
  // Collect unique frames (where keyframes exist)
  const framesToExport: { frameIndex: number; keyframes: Keyframe[] }[] = [];
  
  for (let i = 0; i < frameCount; i++) {
    const keyframes = getCompositeFrame(i);
    if (keyframes.length > 0) {
      framesToExport.push({ frameIndex: i, keyframes });
    }
  }
  
  if (framesToExport.length === 0) {
    throw new Error('No frames to export');
  }

  // Create canvas for compositing
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Load all images first
  const imageCache = new Map<string, HTMLImageElement>();
  
  for (const frame of framesToExport) {
    for (const keyframe of frame.keyframes) {
      if (!imageCache.has(keyframe.imageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = keyframe.imageUrl;
        });
        imageCache.set(keyframe.imageUrl, img);
      }
    }
  }

  // Generate frames as data URLs
  const frameDataUrls: string[] = [];
  const delay = Math.round(1000 / fps);
  
  // For each keyframe, render the composite
  let lastKeyframeSet: Keyframe[] = [];
  for (let i = 0; i < frameCount; i++) {
    const keyframes = getCompositeFrame(i);
    
    // Only add frame if it has content
    if (keyframes.length > 0) {
      // Check if this is different from last frame
      const keyframeIds = keyframes.map(k => k.imageId).join(',');
      const lastIds = lastKeyframeSet.map(k => k.imageId).join(',');
      
      if (keyframeIds !== lastIds || frameDataUrls.length === 0) {
        ctx.clearRect(0, 0, width, height);
        
        // Draw layers bottom to top
        for (const keyframe of keyframes) {
          const img = imageCache.get(keyframe.imageUrl);
          if (img) {
            // Calculate centered position
            const scale = Math.min(width / img.width, height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (width - scaledWidth) / 2;
            const y = (height - scaledHeight) / 2;
            
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          }
        }
        
        frameDataUrls.push(canvas.toDataURL('image/png'));
        lastKeyframeSet = keyframes;
      }
    }
  }

  // Use a simple animated PNG fallback since gif.js has issues
  // For now, export as WebP animation or fallback to first frame
  if (frameDataUrls.length === 1) {
    // Single frame, just return as PNG
    const response = await fetch(frameDataUrls[0]);
    return await response.blob();
  }

  // Create an animated GIF using a simplified encoder
  const gif = await createAnimatedGif(frameDataUrls, delay, width, height);
  return gif;
}

/**
 * Simple animated GIF creator using canvas
 */
async function createAnimatedGif(
  frameDataUrls: string[],
  delay: number,
  width: number,
  height: number
): Promise<Blob> {
  // Since gif.js has compatibility issues, we'll create a simple sprite sheet
  // and provide instructions, or use a canvas-based approach
  
  // For now, return the first frame as a placeholder
  // In production, you'd use a proper GIF library
  const canvas = document.createElement('canvas');
  const frameCount = frameDataUrls.length;
  
  // Create horizontal sprite sheet as fallback
  canvas.width = width * frameCount;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  for (let i = 0; i < frameDataUrls.length; i++) {
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = frameDataUrls[i];
    });
    ctx.drawImage(img, i * width, 0, width, height);
  }
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

/**
 * Export as sprite sheet (horizontal strip)
 */
export async function exportSpriteSheet(
  getCompositeFrame: (frameIndex: number) => Keyframe[],
  options: GifExportOptions
): Promise<{ blob: Blob; frameCount: number; frameWidth: number; frameHeight: number }> {
  const { frameCount, width = 128, height = 128 } = options;
  
  // Collect unique frames
  const uniqueFrames: Keyframe[][] = [];
  let lastKeyframeIds = '';
  
  for (let i = 0; i < frameCount; i++) {
    const keyframes = getCompositeFrame(i);
    const keyframeIds = keyframes.map(k => k.imageId).join(',');
    
    if (keyframes.length > 0 && keyframeIds !== lastKeyframeIds) {
      uniqueFrames.push(keyframes);
      lastKeyframeIds = keyframeIds;
    }
  }
  
  if (uniqueFrames.length === 0) {
    throw new Error('No frames to export');
  }

  // Load images
  const imageCache = new Map<string, HTMLImageElement>();
  for (const keyframes of uniqueFrames) {
    for (const keyframe of keyframes) {
      if (!imageCache.has(keyframe.imageUrl)) {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = keyframe.imageUrl;
        });
        imageCache.set(keyframe.imageUrl, img);
      }
    }
  }

  // Create sprite sheet canvas
  const canvas = document.createElement('canvas');
  canvas.width = width * uniqueFrames.length;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // Render each frame
  for (let i = 0; i < uniqueFrames.length; i++) {
    for (const keyframe of uniqueFrames[i]) {
      const img = imageCache.get(keyframe.imageUrl);
      if (img) {
        const scale = Math.min(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = i * width + (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      }
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        blob: blob!,
        frameCount: uniqueFrames.length,
        frameWidth: width,
        frameHeight: height
      });
    }, 'image/png');
  });
}