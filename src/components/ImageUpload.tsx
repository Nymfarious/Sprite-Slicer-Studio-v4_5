import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadedImage } from '@/types/sprite';

interface ImageUploadProps {
  uploadedImage: UploadedImage | null;
  onImageUpload: (image: UploadedImage) => void;
  onClearImage: () => void;
}

const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSIONS = 4096;

type UploadError = {
  type: 'network' | 'size' | 'format' | 'dimensions';
  message: string;
} | null;

export function ImageUpload({ uploadedImage, onImageUpload, onClearImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<UploadError>(null);

  const validateAndProcessFile = useCallback((file: File) => {
    setError(null);

    // Check format
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError({
        type: 'format',
        message: 'Unsupported file type. Use PNG, JPG, GIF, SVG, or WebP.'
      });
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError({
        type: 'size',
        message: 'File exceeds 10MB limit. Please use a smaller image.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setError({
        type: 'network',
        message: 'Upload failed. Check your connection and try again.'
      });
    };
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        setError({
          type: 'network',
          message: 'Upload failed. Check your connection and try again.'
        });
      };
      img.onload = () => {
        // Check dimensions
        if (img.width > MAX_DIMENSIONS || img.height > MAX_DIMENSIONS) {
          setError({
            type: 'dimensions',
            message: 'Image exceeds 4096×4096. Please resize and retry.'
          });
          return;
        }

        onImageUpload({
          file,
          dataUrl,
          width: img.width,
          height: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  }, [validateAndProcessFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  }, [validateAndProcessFile]);

  if (uploadedImage) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="font-mono text-muted-foreground truncate max-w-[150px]">
              {uploadedImage.file.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearImage}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {uploadedImage.width} × {uploadedImage.height}px
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`upload-zone p-6 text-center ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.svg,.webp"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer block">
          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-muted-foreground/30 mx-auto mb-3 flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-foreground mb-1">
            Drop a sprite sheet here
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {['PNG', 'JPG', 'GIF', 'SVG', 'WebP'].map(format => (
              <span 
                key={format}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-secondary/50 rounded text-muted-foreground"
              >
                {format}
              </span>
            ))}
          </div>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-destructive">{error.message}</p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Max 10MB • Max 4096×4096px
      </p>
    </div>
  );
}
