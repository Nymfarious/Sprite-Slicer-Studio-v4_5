import { useState } from 'react';
import { Tag } from '@/types/sprite';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface QuickTagPanelProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

export function QuickTagPanel({
  tags,
  selectedTags,
  onTagToggle,
  onConfirm,
  onSkip,
}: QuickTagPanelProps) {
  return (
    <div className="mt-3 p-3 bg-secondary/30 border border-border rounded-lg space-y-3">
      <p className="text-xs font-medium text-foreground">Quick Tag (optional)</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs transition-all flex items-center gap-1.5",
              selectedTags.includes(tag.id)
                ? "text-white ring-2 ring-offset-1 ring-offset-background ring-primary/50"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : undefined}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
            {selectedTags.includes(tag.id) && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={onSkip}>
          <X className="w-3 h-3 mr-1" />
          Skip
        </Button>
        <Button size="sm" className="h-7 text-xs flex-1" onClick={onConfirm}>
          <Check className="w-3 h-3 mr-1" />
          Confirm
        </Button>
      </div>
    </div>
  );
}
