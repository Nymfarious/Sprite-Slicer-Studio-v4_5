import { Settings, GitBranch, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  onOpenPreferences: () => void;
  onOpenFlowchart: () => void;
  onHomeClick?: () => void;
}

export function Header({ onOpenPreferences, onOpenFlowchart, onHomeClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onHomeClick}
              className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Scissors className="w-5 h-5 text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Home - Import a sprite sheet</TooltipContent>
        </Tooltip>
        <div>
          <h1 className="font-semibold text-foreground tracking-tight">Sprite Slicer Studio</h1>
          <p className="text-xs text-muted-foreground font-mono">v4</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenFlowchart}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="View App Flowchart"
        >
          <GitBranch className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenPreferences}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="Preferences"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
