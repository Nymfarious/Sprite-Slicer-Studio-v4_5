import { useState } from 'react';
import { Tag as TagIcon, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TagBadge } from '@/components/TagBadge';
import { Tag } from '@/types/sprite';
import { cn } from '@/lib/utils';

interface TagPickerPopoverProps {
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function TagPickerPopover({
  tags,
  selectedTagIds,
  onToggle,
  trigger,
  align = 'end',
}: TagPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  if (tags.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <TagIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align={align}>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-1 pb-1">
            Select tags
          </p>
          {tags.map(tag => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => onToggle(tag.id)}
                className={cn(
                  'flex items-center justify-between gap-2 w-full p-1.5 rounded-md',
                  'hover:bg-accent transition-colors text-left',
                  isSelected && 'bg-accent/50'
                )}
              >
                <TagBadge tag={tag} size="sm" />
                {isSelected && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
