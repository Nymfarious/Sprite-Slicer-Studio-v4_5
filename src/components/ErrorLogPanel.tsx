import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Pin, Trash2, Download, AlertCircle, AlertTriangle, Info, Wifi, FileX, Cog, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorLogEntry, ErrorType } from '@/types/error';

interface ErrorLogPanelProps {
  errors: ErrorLogEntry[];
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
}

const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case 'import':
      return FileX;
    case 'export':
      return Download;
    case 'processing':
      return Cog;
    case 'network':
      return Wifi;
    case 'validation':
      return AlertTriangle;
    default:
      return AlertCircle;
  }
};

const getErrorColor = (type: ErrorType) => {
  switch (type) {
    case 'import':
      return 'text-orange-500';
    case 'export':
      return 'text-blue-500';
    case 'processing':
      return 'text-purple-500';
    case 'network':
      return 'text-red-500';
    case 'validation':
      return 'text-yellow-500';
    default:
      return 'text-muted-foreground';
  }
};

export function ErrorLogPanel({ errors, onTogglePin, onDelete, onClear, onExport }: ErrorLogPanelProps) {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No errors logged</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Errors will appear here when they occur</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">{errors.length} error{errors.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onExport} className="h-7 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Error List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {errors.map(error => {
            const Icon = getErrorIcon(error.type);
            const colorClass = getErrorColor(error.type);
            
            return (
              <div 
                key={error.id} 
                className={cn(
                  "p-3 rounded-lg bg-muted/50 border border-border text-sm",
                  error.pinned && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className={cn("h-4 w-4 flex-shrink-0", colorClass)} />
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                      {error.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onTogglePin(error.id)}
                    >
                      <Pin className={cn("h-3 w-3", error.pinned && "fill-current text-primary")} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-destructive/70 hover:text-destructive"
                      onClick={() => onDelete(error.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="mt-2 text-foreground">{error.message}</p>
                
                {error.fileName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    File: <span className="font-mono">{error.fileName}</span>
                  </p>
                )}
                
                {error.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Show details
                    </summary>
                    <pre className="mt-1 p-2 bg-background rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {error.details}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
