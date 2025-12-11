import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SpriteHelperProps {
  message: string | null;
  isVisible: boolean;
  onDismiss: () => void;
}

export function SpriteHelper({ message, isVisible, onDismiss }: SpriteHelperProps) {
  if (!isVisible || !message) return null;
  
  return (
    <div className="fixed bottom-4 right-4 flex items-end gap-3 animate-in slide-in-from-bottom-4 z-50">
      {/* Mascot */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-primary/50 shadow-lg flex items-center justify-center animate-bounce">
        <span className="text-2xl">✨</span>
      </div>
      
      {/* Speech bubble */}
      <div className="bg-card rounded-lg shadow-lg border border-border p-3 max-w-xs relative">
        {/* Triangle pointer */}
        <div className="absolute -left-2 bottom-4 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-8 border-r-card" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/20"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
        
        <p className="text-sm text-foreground pr-4">{message}</p>
        
        <div className="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onDismiss} className="text-xs">
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
