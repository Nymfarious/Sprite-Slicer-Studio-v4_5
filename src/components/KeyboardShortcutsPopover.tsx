import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";
import { formatShortcut } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsPopoverProps {
  variant?: 'splicing' | 'animation' | 'all';
}

export function KeyboardShortcutsPopover({ variant = 'all' }: KeyboardShortcutsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" title="Keyboard Shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </h4>
          
          <div className="space-y-2 text-sm">
            {(variant === 'animation' || variant === 'all') && (
              <>
                <div className="font-medium text-muted-foreground">Playback</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Space</span><span>Play/Pause</span>
                  <span className="text-muted-foreground">← / →</span><span>Frame step</span>
                  <span className="text-muted-foreground">{formatShortcut('Shift')}+← / →</span><span>Jump 10 frames</span>
                  <span className="text-muted-foreground">Home / End</span><span>First/Last frame</span>
                  <span className="text-muted-foreground">[ / ]</span><span>Set loop points</span>
                </div>
              </>
            )}
            
            {(variant === 'splicing' || variant === 'all') && (
              <>
                <div className="font-medium text-muted-foreground pt-2">Splicing</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">{formatShortcut('Ctrl')}+A</span><span>Select all</span>
                  <span className="text-muted-foreground">Esc</span><span>Deselect</span>
                  <span className="text-muted-foreground">↑ / ↓</span><span>Grid size</span>
                  <span className="text-muted-foreground">S</span><span>Toggle snap</span>
                  <span className="text-muted-foreground">Enter</span><span>Send to library</span>
                </div>
              </>
            )}
            
            <div className="font-medium text-muted-foreground pt-2">General</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">{formatShortcut('Ctrl')}+Z</span><span>Undo</span>
              <span className="text-muted-foreground">{formatShortcut('Ctrl')}+Y</span><span>Redo</span>
              <span className="text-muted-foreground">{formatShortcut('Ctrl')}+S</span><span>Save project</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
