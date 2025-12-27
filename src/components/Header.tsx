import { useNavigate } from 'react-router-dom';
import { Settings, GitBranch, Scissors, LogOut, Bug, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onOpenPreferences: () => void;
  onOpenFlowchart: () => void;
  onHomeClick?: () => void;
}

export function Header({ onOpenPreferences, onOpenFlowchart, onHomeClick }: HeaderProps) {
  const { user, isDevMode, signOut } = useAuth();
  const navigate = useNavigate();

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
          <p className="text-xs text-muted-foreground font-mono">4.5 Pre-Alpha</p>
        </div>
        {isDevMode && (
          <Badge variant="outline" className="ml-2 border-yellow-600 text-yellow-500 bg-yellow-900/20">
            <Bug className="w-3 h-3 mr-1" />
            DEV MODE
          </Badge>
        )}
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

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && (
              <>
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user.user_metadata?.user_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-400 focus:text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
