import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D, 
  image: HTMLImageElement
): boolean {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export interface BackgroundRemovalProgress {
  stage: 'loading' | 'processing' | 'applying' | 'complete';
  progress: number;
  message: string;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: BackgroundRemovalProgress) => void
): Promise<Blob> => {
  try {
    onProgress?.({ stage: 'loading', progress: 10, message: 'Loading AI model...' });
    
    const segmenter = await pipeline(
      'image-segmentation', 
      'Xenova/segformer-b0-finetuned-ade-512-512',
      { device: 'webgpu' }
    );
    
    onProgress?.({ stage: 'processing', progress: 30, message: 'Preparing image...' });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    resizeImageIfNeeded(canvas, ctx, imageElement);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    onProgress?.({ stage: 'processing', progress: 50, message: 'Detecting background...' });
    
    // Process the image with the segmentation model
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    onProgress?.({ stage: 'applying', progress: 70, message: 'Removing background...' });
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    onProgress?.({ stage: 'complete', progress: 100, message: 'Background removed!' });
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImageFromBlob = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

/**
 * Remove solid color background (fast, non-AI method)
 * Detects the most common edge color and removes it
 */
export const removeSolidBackground = (
  imageData: ImageData,
  tolerance: number = 30
): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Sample edge pixels to detect background color
  const edgePixels: { r: number; g: number; b: number }[] = [];
  
  // Top and bottom edges
  for (let x = 0; x < width; x++) {
    const topIdx = x * 4;
    const bottomIdx = ((height - 1) * width + x) * 4;
    edgePixels.push({ r: data[topIdx], g: data[topIdx + 1], b: data[topIdx + 2] });
    edgePixels.push({ r: data[bottomIdx], g: data[bottomIdx + 1], b: data[bottomIdx + 2] });
  }
  
  // Left and right edges
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width * 4;
    const rightIdx = (y * width + width - 1) * 4;
    edgePixels.push({ r: data[leftIdx], g: data[leftIdx + 1], b: data[leftIdx + 2] });
    edgePixels.push({ r: data[rightIdx], g: data[rightIdx + 1], b: data[rightIdx + 2] });
  }
  
  // Find most common color (simple approach)
  const colorCounts = new Map<string, { count: number; r: number; g: number; b: number }>();
  
  for (const pixel of edgePixels) {
    // Quantize to reduce unique colors
    const qr = Math.round(pixel.r / 10) * 10;
    const qg = Math.round(pixel.g / 10) * 10;
    const qb = Math.round(pixel.b / 10) * 10;
    const key = `${qr},${qg},${qb}`;
    
    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { count: 1, r: qr, g: qg, b: qb });
    }
  }
  
  // Find the most common edge color
  let maxCount = 0;
  let bgColor = { r: 255, g: 255, b: 255 };
  
  for (const [, value] of colorCounts) {
    if (value.count > maxCount) {
      maxCount = value.count;
      bgColor = { r: value.r, g: value.g, b: value.b };
    }
  }
  
  // Create new image data with transparent background
  const newData = new Uint8ClampedArray(data);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if pixel is close to background color
    const diff = Math.abs(r - bgColor.r) + Math.abs(g - bgColor.g) + Math.abs(b - bgColor.b);
    
    if (diff < tolerance * 3) {
      // Make transparent
      newData[i + 3] = 0;
    }
  }
  
  return new ImageData(newData, width, height);
};
