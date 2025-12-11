import { cn } from '@/lib/utils';
import { Image, Film } from 'lucide-react';

export type LibraryView = 'images' | 'videos';

interface LibraryToggleProps {
  value: LibraryView;
  onChange: (view: LibraryView) => void;
}

export function LibraryToggle({ value, onChange }: LibraryToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">Library</span>
      <div className="flex rounded-md border border-border overflow-hidden">
        <button
          onClick={() => onChange('images')}
          className={cn(
            "px-2 py-1 text-xs flex items-center gap-1 transition-colors",
            value === 'images' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-accent'
          )}
        >
          <Image className="h-3 w-3" />
          Images
        </button>
        <button
          onClick={() => onChange('videos')}
          className={cn(
            "px-2 py-1 text-xs flex items-center gap-1 transition-colors",
            value === 'videos' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-accent'
          )}
        >
          <Film className="h-3 w-3" />
          Animations
        </button>
      </div>
    </div>
  );
}
