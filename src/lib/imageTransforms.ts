// Image transform utilities for rotate, mirror, and flip operations

export interface ImageTransform {
  rotation: number;    // 0, 90, 180, 270
  mirrorH: boolean;    // Horizontal mirror
  flipV: boolean;      // Vertical flip
}

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  rotation: 0,
  mirrorH: false,
  flipV: false,
};

/**
 * Apply transforms to an image and return the new data URL
 */
export async function applyImageTransforms(
  dataUrl: string,
  transform: ImageTransform
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Handle rotation - swap dimensions for 90/270 degrees
      const isRotated90or270 = transform.rotation === 90 || transform.rotation === 270;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      // Move to center for transforms
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      if (transform.rotation !== 0) {
        ctx.rotate((transform.rotation * Math.PI) / 180);
      }

      // Apply mirror/flip
      const scaleX = transform.mirrorH ? -1 : 1;
      const scaleY = transform.flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Rotate image 90 degrees clockwise
 */
export async function rotateImage90CW(dataUrl: string): Promise<string> {
  return applyImageTransforms(dataUrl, {
    rotation: 90,
    mirrorH: false,
    flipV: false,
  });
}

/**
 * Mirror image horizontally
 */
export async function mirrorImageHorizontal(dataUrl: string): Promise<string> {
  return applyImageTransforms(dataUrl, {
    rotation: 0,
    mirrorH: true,
    flipV: false,
  });
}

/**
 * Flip image vertically
 */
export async function flipImageVertical(dataUrl: string): Promise<string> {
  return applyImageTransforms(dataUrl, {
    rotation: 0,
    mirrorH: false,
    flipV: true,
  });
}

/**
 * Get dimensions after transform
 */
export function getTransformedDimensions(
  width: number,
  height: number,
  transform: ImageTransform
): { width: number; height: number } {
  const isRotated90or270 = transform.rotation === 90 || transform.rotation === 270;
  return {
    width: isRotated90or270 ? height : width,
    height: isRotated90or270 ? width : height,
  };
}
