import { useState } from 'react';
import { ChevronRight, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tag } from '@/types/sprite';
import { cn } from '@/lib/utils';

interface FilterPresetsPopoverProps {
  tags: Tag[];
  activeTagFilters: string[];
  onToggleTagFilter: (tagId: string) => void;
  onClearTagFilters: () => void;
  onOpenTagManager?: () => void;
}

export function FilterPresetsPopover({
  tags,
  activeTagFilters,
  onToggleTagFilter,
  onClearTagFilters,
  onOpenTagManager,
}: FilterPresetsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      
      {/* Active filter badges */}
      {activeTagFilters.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {tags.filter(t => activeTagFilters.includes(t.id)).map(tag => (
            <button
              key={tag.id}
              onClick={() => onToggleTagFilter(tag.id)}
              className="px-2 py-0.5 rounded-full text-xs text-white flex items-center gap-1"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <span className="opacity-70">×</span>
            </button>
          ))}
          <button 
            onClick={onClearTagFilters} 
            className="text-xs text-muted-foreground hover:text-foreground ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Expand button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-[11px] font-normal gap-1",
              activeTagFilters.length > 0 && "text-primary"
            )}
          >
            <Filter className="w-3 h-3" />
            {activeTagFilters.length === 0 && <span className="text-muted-foreground">Tags</span>}
            <ChevronRight className={cn("w-3 h-3 transition-transform", isOpen && "rotate-90")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="right" 
          align="start"
          className="w-48 p-2 bg-popover border-border z-50"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">
              Filter by Tag
            </p>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => onToggleTagFilter(tag.id)}
                className={cn(
                  "w-full px-2 py-1.5 rounded text-xs text-left transition-colors flex items-center gap-2",
                  activeTagFilters.includes(tag.id) 
                    ? "bg-primary/20 text-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: tag.color }}
                />
                <span className="truncate">{tag.name}</span>
                {activeTagFilters.includes(tag.id) && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
            
            {activeTagFilters.length > 0 && (
              <>
                <div className="border-t border-border my-1" />
                <button
                  onClick={onClearTagFilters}
                  className="w-full px-2 py-1.5 rounded text-xs text-left text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Clear all filters
                </button>
              </>
            )}
            
            {/* Link to Tag Manager */}
            <div className="border-t border-border/50 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenTagManager?.();
                }}
                className="w-full px-2 py-1 rounded text-[10px] text-left text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5"
              >
                <Settings className="w-3 h-3" />
                Manage Tags...
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
