/**
 * AI-powered sprite boundary detection using edge detection algorithms
 * Analyzes sprite sheets to automatically detect grid patterns and individual sprites
 */

export interface DetectedSprite {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  sprites: DetectedSprite[];
  suggestedGrid: {
    columns: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    offsetX: number;
    offsetY: number;
  } | null;
}

/**
 * Analyzes an image to detect sprite boundaries using edge detection
 */
export async function detectSpriteBoundaries(
  imageData: string,
  onProgress?: (progress: number, message: string) => void
): Promise<DetectionResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      onProgress?.(10, 'Loading image...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ sprites: [], suggestedGrid: null });
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      onProgress?.(20, 'Analyzing pixel data...');
      
      const imageDataObj = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageDataObj.data;

      // Find non-transparent bounding boxes
      onProgress?.(40, 'Detecting sprite boundaries...');
      
      const sprites = findConnectedComponents(data, img.width, img.height);
      
      onProgress?.(70, 'Calculating optimal grid...');
      
      // Calculate suggested grid based on detected sprites
      const suggestedGrid = calculateOptimalGrid(sprites, img.width, img.height);
      
      onProgress?.(100, 'Detection complete!');
      
      resolve({ sprites, suggestedGrid });
    };
    img.src = imageData;
  });
}

/**
 * Find connected components (individual sprites) in the image
 * Uses simple row/column analysis for performance
 */
function findConnectedComponents(
  data: Uint8ClampedArray,
  width: number,
  height: number
): DetectedSprite[] {
  const ALPHA_THRESHOLD = 10; // Pixels with alpha below this are considered transparent
  
  // Find horizontal gaps (empty columns)
  const columnHasContent: boolean[] = new Array(width).fill(false);
  const rowHasContent: boolean[] = new Array(height).fill(false);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      
      if (alpha > ALPHA_THRESHOLD) {
        columnHasContent[x] = true;
        rowHasContent[y] = true;
      }
    }
  }
  
  // Find sprite column boundaries
  const columnBoundaries: { start: number; end: number }[] = [];
  let inSprite = false;
  let start = 0;
  
  for (let x = 0; x < width; x++) {
    if (columnHasContent[x] && !inSprite) {
      inSprite = true;
      start = x;
    } else if (!columnHasContent[x] && inSprite) {
      inSprite = false;
      columnBoundaries.push({ start, end: x - 1 });
    }
  }
  if (inSprite) {
    columnBoundaries.push({ start, end: width - 1 });
  }
  
  // Find sprite row boundaries
  const rowBoundaries: { start: number; end: number }[] = [];
  inSprite = false;
  
  for (let y = 0; y < height; y++) {
    if (rowHasContent[y] && !inSprite) {
      inSprite = true;
      start = y;
    } else if (!rowHasContent[y] && inSprite) {
      inSprite = false;
      rowBoundaries.push({ start, end: y - 1 });
    }
  }
  if (inSprite) {
    rowBoundaries.push({ start, end: height - 1 });
  }
  
  // Create sprites from the grid of boundaries
  const sprites: DetectedSprite[] = [];
  
  for (const rowBound of rowBoundaries) {
    for (const colBound of columnBoundaries) {
      // Verify there's actually content in this cell
      let hasContent = false;
      outer: for (let y = rowBound.start; y <= rowBound.end; y++) {
        for (let x = colBound.start; x <= colBound.end; x++) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] > ALPHA_THRESHOLD) {
            hasContent = true;
            break outer;
          }
        }
      }
      
      if (hasContent) {
        sprites.push({
          x: colBound.start,
          y: rowBound.start,
          width: colBound.end - colBound.start + 1,
          height: rowBound.end - rowBound.start + 1,
        });
      }
    }
  }
  
  return sprites;
}

/**
 * Calculate optimal grid settings based on detected sprites
 */
function calculateOptimalGrid(
  sprites: DetectedSprite[],
  imageWidth: number,
  imageHeight: number
): DetectionResult['suggestedGrid'] {
  if (sprites.length === 0) {
    return null;
  }
  
  // Group sprites by their approximate row and column positions
  const rowPositions = [...new Set(sprites.map(s => s.y))].sort((a, b) => a - b);
  const colPositions = [...new Set(sprites.map(s => s.x))].sort((a, b) => a - b);
  
  // Merge nearby positions (within 5px tolerance)
  const mergedRows = mergeNearbyPositions(rowPositions, 5);
  const mergedCols = mergeNearbyPositions(colPositions, 5);
  
  const rows = mergedRows.length;
  const columns = mergedCols.length;
  
  // Calculate average cell dimensions
  const avgWidth = Math.round(sprites.reduce((sum, s) => sum + s.width, 0) / sprites.length);
  const avgHeight = Math.round(sprites.reduce((sum, s) => sum + s.height, 0) / sprites.length);
  
  // Calculate offset (position of first sprite)
  const offsetX = sprites.reduce((min, s) => Math.min(min, s.x), imageWidth);
  const offsetY = sprites.reduce((min, s) => Math.min(min, s.y), imageHeight);
  
  return {
    columns: Math.max(1, columns),
    rows: Math.max(1, rows),
    cellWidth: avgWidth,
    cellHeight: avgHeight,
    offsetX,
    offsetY,
  };
}

/**
 * Merge positions that are within tolerance of each other
 */
function mergeNearbyPositions(positions: number[], tolerance: number): number[] {
  if (positions.length === 0) return [];
  
  const merged: number[] = [positions[0]];
  
  for (let i = 1; i < positions.length; i++) {
    const lastMerged = merged[merged.length - 1];
    if (positions[i] - lastMerged > tolerance) {
      merged.push(positions[i]);
    }
  }
  
  return merged;
}

/**
 * Analyze image colors to determine if it has transparency
 */
export function hasTransparency(imageData: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          resolve(true);
          return;
        }
      }
      
      resolve(false);
    };
    img.src = imageData;
  });
}
