import { useState, useCallback } from 'react';
import { Eraser, Sparkles, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { 
  removeBackground, 
  loadImageFromDataUrl, 
  removeSolidBackground,
  BackgroundRemovalProgress 
} from '@/lib/backgroundRemoval';

export type BackgroundOption = 'transparent' | 'black' | 'white' | 'custom';

interface BackgroundRemovalToolProps {
  imageDataUrl: string | null;
  onImageUpdate: (newDataUrl: string) => void;
  disabled?: boolean;
}

export function BackgroundRemovalTool({
  imageDataUrl,
  onImageUpdate,
  disabled = false,
}: BackgroundRemovalToolProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [progress, setProgress] = useState<BackgroundRemovalProgress | null>(null);
  const [exportBg, setExportBg] = useState<BackgroundOption>('transparent');
  const [customColor, setCustomColor] = useState('#808080');

  const handleRemoveBackground = useCallback(async (useAI: boolean) => {
    if (!imageDataUrl) {
      toast.error('No image loaded');
      return;
    }

    setIsRemoving(true);
    setProgress({ stage: 'loading', progress: 0, message: 'Starting...' });

    try {
      if (useAI) {
        // AI-powered background removal
        const img = await loadImageFromDataUrl(imageDataUrl);
        
        const resultBlob = await removeBackground(img, (p) => {
          setProgress(p);
        });

        // Convert blob to data URL
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onImageUpdate(reader.result);
            toast.success('Background removed with AI!');
          }
        };
        reader.readAsDataURL(resultBlob);
      } else {
        // Fast solid color removal
        setProgress({ stage: 'processing', progress: 50, message: 'Detecting solid background...' });
        
        const img = await loadImageFromDataUrl(imageDataUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const newImageData = removeSolidBackground(imageData);
        ctx.putImageData(newImageData, 0, 0);
        
        const newDataUrl = canvas.toDataURL('image/png');
        onImageUpdate(newDataUrl);
        
        setProgress({ stage: 'complete', progress: 100, message: 'Done!' });
        toast.success('Solid background removed!');
      }
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error('Failed to remove background', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRemoving(false);
      setProgress(null);
    }
  }, [imageDataUrl, onImageUpdate]);

  const handleApplyBackground = useCallback(() => {
    if (!imageDataUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Fill with selected background
      if (exportBg !== 'transparent') {
        ctx.fillStyle = exportBg === 'custom' ? customColor : exportBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      
      const newDataUrl = canvas.toDataURL('image/png');
      onImageUpdate(newDataUrl);
      toast.success(`Applied ${exportBg} background`);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, exportBg, customColor, onImageUpdate]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Background
        </span>
      </div>

      {/* Background Removal Buttons */}
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveBackground(false)}
              disabled={disabled || isRemoving || !imageDataUrl}
              className="flex-1"
            >
              <Eraser className="w-3.5 h-3.5 mr-1.5" />
              Remove Solid
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-[200px]">
            <p className="font-medium">Fast Background Removal</p>
            <p className="text-muted-foreground">
              Detects and removes solid color backgrounds
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveBackground(true)}
              disabled={disabled || isRemoving || !imageDataUrl}
              className="flex-1 relative overflow-hidden"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI Remove
              {isRemoving && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-[200px]">
            <p className="font-medium">AI-Powered Removal</p>
            <p className="text-muted-foreground">
              Uses machine learning to detect and isolate subjects
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Progress Bar */}
      {isRemoving && progress && (
        <div className="space-y-1 animate-fade-in">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.message}</span>
            <span>{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="h-1.5" />
        </div>
      )}

      {/* Export Background Options */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Export as:</span>
        <Select value={exportBg} onValueChange={(v) => setExportBg(v as BackgroundOption)}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transparent">Transparent</SelectItem>
            <SelectItem value="black">Black</SelectItem>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="custom">Custom Color</SelectItem>
          </SelectContent>
        </Select>

        {exportBg === 'custom' && (
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-7 h-7 rounded border border-border cursor-pointer"
          />
        )}

        {exportBg !== 'transparent' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyBackground}
            disabled={disabled || !imageDataUrl}
            className="h-7"
          >
            <Palette className="w-3 h-3 mr-1" />
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}
