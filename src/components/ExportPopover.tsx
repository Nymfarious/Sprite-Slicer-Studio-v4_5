import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ExportPopoverProps {
  disabled?: boolean;
  onExportPNG?: () => void;
  onExportGIF?: () => void;
  onExportZIP?: () => void;
}

export function ExportPopover({ disabled, onExportPNG, onExportGIF, onExportZIP }: ExportPopoverProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={disabled}
            >
              <Download className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Export Options</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
            Export As
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-8 text-xs"
            onClick={onExportPNG}
          >
            PNG Image
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-8 text-xs"
            onClick={onExportGIF}
          >
            GIF Animation
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-8 text-xs"
            onClick={onExportZIP}
          >
            ZIP Archive
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
