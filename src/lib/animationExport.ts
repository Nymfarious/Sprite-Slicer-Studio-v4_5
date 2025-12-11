import { Thread, Transform } from '@/types/animation';
import { getFrameState } from './tweening';
import GIF from 'gif.js';
import JSZip from 'jszip';

// ============================================
// ANIMATED GIF EXPORT
// ============================================

export async function exportToGif(
  threads: Thread[],
  totalFrames: number,
  fps: number,
  canvasWidth: number,
  canvasHeight: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvasWidth,
        height: canvasHeight,
        workerScript: '/gif.worker.js',
        transparent: 0x00000000,
      });

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      const frameDelay = Math.round(1000 / fps);
      const visibleThreads = threads.filter(t => t.visible);

      // Pre-load all images
      const imageCache = new Map<string, HTMLImageElement>();
      const allImageUrls = new Set<string>();

      visibleThreads.forEach(thread => {
        thread.keyframes.forEach(kf => allImageUrls.add(kf.imageUrl));
      });

      await Promise.all(
        Array.from(allImageUrls).map(url =>
          new Promise<void>((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              imageCache.set(url, img);
              res();
            };
            img.onerror = () => res();
            img.src = url;
          })
        )
      );

      // Find the actual frame range with content
      let firstFrame = totalFrames;
      let lastFrame = 0;

      for (let frame = 0; frame < totalFrames; frame++) {
        for (const thread of visibleThreads) {
          const state = getFrameState(frame, thread.keyframes);
          if (state) {
            firstFrame = Math.min(firstFrame, frame);
            lastFrame = Math.max(lastFrame, frame);
          }
        }
      }

      if (firstFrame > lastFrame) {
        throw new Error('No frames to export');
      }

      // Render each frame
      for (let frame = firstFrame; frame <= lastFrame; frame++) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        visibleThreads.forEach(thread => {
          const state = getFrameState(frame, thread.keyframes);
          if (!state) return;

          const img = imageCache.get(state.imageUrl);
          if (!img) return;

          ctx.save();
          ctx.globalAlpha = state.transform.opacity;
          ctx.translate(
            canvasWidth / 2 + state.transform.x,
            canvasHeight / 2 + state.transform.y
          );
          ctx.scale(
            state.transform.scale * state.transform.scaleX,
            state.transform.scale * state.transform.scaleY
          );
          ctx.rotate((state.transform.rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
        });

        gif.addFrame(ctx, { copy: true, delay: frameDelay });
        onProgress?.((frame - firstFrame) / (lastFrame - firstFrame + 1));
      }

      gif.on('finished', (blob: Blob) => resolve(blob));
      gif.on('error', (err: Error) => reject(err));
      gif.render();
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================
// JSON MANIFEST EXPORT
// ============================================

interface ExportManifest {
  name: string;
  fps: number;
  totalFrames: number;
  loop: boolean;
  threads: {
    name: string;
    visible: boolean;
    keyframes: {
      frame: number;
      image: string;
      transform: Transform;
      tweenToNext: boolean;
      easing: string;
    }[];
  }[];
}

export function exportToJsonManifest(
  threads: Thread[],
  totalFrames: number,
  fps: number,
  name: string = 'animation',
  loop: boolean = true
): string {
  const manifest: ExportManifest = {
    name,
    fps,
    totalFrames,
    loop,
    threads: threads.map(thread => ({
      name: thread.name,
      visible: thread.visible,
      keyframes: thread.keyframes.map(kf => ({
        frame: kf.frameIndex,
        image: kf.imageUrl,
        transform: kf.transform,
        tweenToNext: kf.tweenToNext,
        easing: kf.easing,
      })),
    })),
  };

  return JSON.stringify(manifest, null, 2);
}

// ============================================
// ZIP FOLDER EXPORT
// ============================================

export async function exportToZip(
  threads: Thread[],
  totalFrames: number,
  fps: number,
  canvasWidth: number,
  canvasHeight: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const visibleThreads = threads.filter(t => t.visible);

  // Pre-load images
  const imageCache = new Map<string, HTMLImageElement>();
  const allImageUrls = new Set<string>();
  visibleThreads.forEach(thread => {
    thread.keyframes.forEach(kf => allImageUrls.add(kf.imageUrl));
  });

  await Promise.all(
    Array.from(allImageUrls).map(url =>
      new Promise<void>((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCache.set(url, img);
          res();
        };
        img.onerror = () => res();
        img.src = url;
      })
    )
  );

  // Find frame range with content
  let firstFrame = totalFrames;
  let lastFrame = 0;

  for (let frame = 0; frame < totalFrames; frame++) {
    for (const thread of visibleThreads) {
      const state = getFrameState(frame, thread.keyframes);
      if (state) {
        firstFrame = Math.min(firstFrame, frame);
        lastFrame = Math.max(lastFrame, frame);
      }
    }
  }

  if (firstFrame > lastFrame) {
    throw new Error('No frames to export');
  }

  // Create frames folder
  const framesFolder = zip.folder('frames');

  // Render and add each frame
  let exportedFrameIndex = 0;
  for (let frame = firstFrame; frame <= lastFrame; frame++) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let hasContent = false;
    visibleThreads.forEach(thread => {
      const state = getFrameState(frame, thread.keyframes);
      if (!state) return;

      hasContent = true;
      const img = imageCache.get(state.imageUrl);
      if (!img) return;

      ctx.save();
      ctx.globalAlpha = state.transform.opacity;
      ctx.translate(
        canvasWidth / 2 + state.transform.x,
        canvasHeight / 2 + state.transform.y
      );
      ctx.scale(
        state.transform.scale * state.transform.scaleX,
        state.transform.scale * state.transform.scaleY
      );
      ctx.rotate((state.transform.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    });

    if (hasContent) {
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/png')
      );

      const frameNum = String(exportedFrameIndex).padStart(4, '0');
      framesFolder?.file(`frame_${frameNum}.png`, blob);
      exportedFrameIndex++;
    }

    onProgress?.((frame - firstFrame) / (lastFrame - firstFrame + 1));
  }

  // Add manifest
  const manifest = exportToJsonManifest(threads, lastFrame - firstFrame + 1, fps);
  zip.file('manifest.json', manifest);

  return zip.generateAsync({ type: 'blob' });
}

// ============================================
// SPRITE SHEET EXPORT (with tweening)
// ============================================

export async function exportToSpriteSheet(
  threads: Thread[],
  totalFrames: number,
  canvasWidth: number,
  canvasHeight: number,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; frameCount: number }> {
  const visibleThreads = threads.filter(t => t.visible);

  // Pre-load images
  const imageCache = new Map<string, HTMLImageElement>();
  const allImageUrls = new Set<string>();
  visibleThreads.forEach(thread => {
    thread.keyframes.forEach(kf => allImageUrls.add(kf.imageUrl));
  });

  await Promise.all(
    Array.from(allImageUrls).map(url =>
      new Promise<void>((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCache.set(url, img);
          res();
        };
        img.onerror = () => res();
        img.src = url;
      })
    )
  );

  // Find frame range
  let firstFrame = totalFrames;
  let lastFrame = 0;

  for (let frame = 0; frame < totalFrames; frame++) {
    for (const thread of visibleThreads) {
      const state = getFrameState(frame, thread.keyframes);
      if (state) {
        firstFrame = Math.min(firstFrame, frame);
        lastFrame = Math.max(lastFrame, frame);
      }
    }
  }

  if (firstFrame > lastFrame) {
    throw new Error('No frames to export');
  }

  const actualFrameCount = lastFrame - firstFrame + 1;

  // Create sprite sheet canvas (horizontal strip)
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = canvasWidth * actualFrameCount;
  sheetCanvas.height = canvasHeight;
  const sheetCtx = sheetCanvas.getContext('2d')!;
  sheetCtx.imageSmoothingEnabled = false;

  // Render each frame
  let frameIndex = 0;
  for (let frame = firstFrame; frame <= lastFrame; frame++) {
    visibleThreads.forEach(thread => {
      const state = getFrameState(frame, thread.keyframes);
      if (!state) return;

      const img = imageCache.get(state.imageUrl);
      if (!img) return;

      const offsetX = frameIndex * canvasWidth;

      sheetCtx.save();
      sheetCtx.globalAlpha = state.transform.opacity;
      sheetCtx.translate(
        offsetX + canvasWidth / 2 + state.transform.x,
        canvasHeight / 2 + state.transform.y
      );
      sheetCtx.scale(
        state.transform.scale * state.transform.scaleX,
        state.transform.scale * state.transform.scaleY
      );
      sheetCtx.rotate((state.transform.rotation * Math.PI) / 180);
      sheetCtx.drawImage(img, -img.width / 2, -img.height / 2);
      sheetCtx.restore();
    });

    frameIndex++;
    onProgress?.(frameIndex / actualFrameCount);
  }

  const blob = await new Promise<Blob>((res) =>
    sheetCanvas.toBlob((b) => res(b!), 'image/png')
  );

  return { blob, frameCount: actualFrameCount };
}

// ============================================
// DOWNLOAD HELPER
// ============================================

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
