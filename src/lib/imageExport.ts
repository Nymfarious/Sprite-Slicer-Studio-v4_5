/**
 * Export utilities for different image formats
 */

export type ExportFormat = 'png' | 'webp' | 'jpeg' | 'svg';

interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0-100
  filename: string;
}

/**
 * Flatten transparency to white for JPEG export
 */
function flattenToWhite(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Fill with white first
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image on top
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * Wrap raster image in SVG element
 */
function wrapInSvg(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${img.width}" 
     height="${img.height}" 
     viewBox="0 0 ${img.width} ${img.height}">
  <image width="${img.width}" height="${img.height}" xlink:href="${imageData}"/>
</svg>`;
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to create SVG'));
      reader.readAsDataURL(blob);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * Convert image to specified format
 */
async function convertToFormat(
  imageData: string, 
  format: ExportFormat, 
  quality: number
): Promise<string> {
  if (format === 'png') {
    return imageData; // Already PNG
  }
  
  if (format === 'jpeg') {
    return flattenToWhite(imageData);
  }
  
  if (format === 'svg') {
    return wrapInSvg(imageData);
  }
  
  if (format === 'webp') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/webp', quality / 100));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData;
    });
  }
  
  return imageData;
}

/**
 * Get file extension for format
 */
function getExtension(format: ExportFormat): string {
  switch (format) {
    case 'jpeg': return 'jpg';
    case 'svg': return 'svg';
    case 'webp': return 'webp';
    default: return 'png';
  }
}

/**
 * Export image with specified format
 */
export async function exportImage(
  imageData: string,
  options: ExportOptions
): Promise<void> {
  const { format, quality, filename } = options;
  
  const convertedData = await convertToFormat(imageData, format, quality);
  const extension = getExtension(format);
  
  const link = document.createElement('a');
  link.href = convertedData;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export image to a specific directory using File System Access API
 */
export async function exportImageToDirectory(
  imageData: string,
  options: ExportOptions,
  directoryHandle: FileSystemDirectoryHandle
): Promise<void> {
  const { format, quality, filename } = options;
  
  const convertedData = await convertToFormat(imageData, format, quality);
  const extension = getExtension(format);
  
  // Convert data URL to blob
  const response = await fetch(convertedData);
  const blob = await response.blob();
  
  // Create file in directory
  const fileHandle = await directoryHandle.getFileHandle(
    `${filename}.${extension}`,
    { create: true }
  );
  
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}
