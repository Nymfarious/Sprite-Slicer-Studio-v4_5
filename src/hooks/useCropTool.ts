import { useState, useCallback, useEffect } from 'react';
import { CropShape, CropMode, CropSelection } from '@/components/CropTool';
import { toast } from 'sonner';

export function useCropTool() {
  const [isActive, setIsActive] = useState(false);
  const [shape, setShape] = useState<CropShape>('rectangle');
  const [mode, setMode] = useState<CropMode>('keep');
  const [isLocked, setIsLocked] = useState(false);
  const [selection, setSelection] = useState<CropSelection | null>(null);
  const [useGridSelection, setUseGridSelection] = useState(false);

  // Keyboard shortcuts for shape selection
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'r') {
        setShape('rectangle');
        toast.info('Shape: Rectangle');
      } else if (key === 'e') {
        setShape('ellipse');
        toast.info('Shape: Ellipse');
      } else if (key === 'o') {
        setShape('octagon');
        toast.info('Shape: Octagon');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
    setSelection(null);
  }, []);

  const cancel = useCallback(() => {
    setSelection(null);
  }, []);

  // Helper to draw octagon path
  const drawOctagonPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const cut = Math.min(w, h) * 0.29;
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + w - cut, y);
    ctx.lineTo(x + w, y + cut);
    ctx.lineTo(x + w, y + h - cut);
    ctx.lineTo(x + w - cut, y + h);
    ctx.lineTo(x + cut, y + h);
    ctx.lineTo(x, y + h - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();
  };

  const applyCrop = useCallback((
    imageDataUrl: string,
    onComplete: (newDataUrl: string) => void
  ) => {
    if (!selection) {
      toast.error('No selection to crop');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (mode === 'keep') {
        // Standard crop - keep inside selection
        canvas.width = selection.width;
        canvas.height = selection.height;

        if (shape === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(
            selection.width / 2,
            selection.height / 2,
            selection.width / 2,
            selection.height / 2,
            0, 0, Math.PI * 2
          );
          ctx.clip();
        } else if (shape === 'octagon') {
          drawOctagonPath(ctx, 0, 0, selection.width, selection.height);
          ctx.clip();
        }

        ctx.drawImage(
          img,
          selection.x, selection.y, selection.width, selection.height,
          0, 0, selection.width, selection.height
        );

        const newDataUrl = canvas.toDataURL('image/png');
        onComplete(newDataUrl);
        toast.success('Crop applied!');
      } else {
        // Remove inside - punch out selection
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Clear the selection area
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';

        if (shape === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(
            selection.x + selection.width / 2,
            selection.y + selection.height / 2,
            selection.width / 2,
            selection.height / 2,
            0, 0, Math.PI * 2
          );
          ctx.fill();
        } else if (shape === 'octagon') {
          drawOctagonPath(ctx, selection.x, selection.y, selection.width, selection.height);
          ctx.fill();
        } else {
          ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
        }

        const newDataUrl = canvas.toDataURL('image/png');
        onComplete(newDataUrl);
        toast.success('Selection removed!', {
          description: 'Unwanted area has been cleared',
        });
      }

      // Reset after applying
      setSelection(null);
    };
    img.src = imageDataUrl;
  }, [selection, mode, shape]);

  return {
    isActive,
    toggle,
    shape,
    setShape,
    mode,
    setMode,
    isLocked,
    toggleLock: () => setIsLocked(prev => !prev),
    selection,
    setSelection,
    cancel,
    applyCrop,
    useGridSelection,
    setUseGridSelection,
  };
}
