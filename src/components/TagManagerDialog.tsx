import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TagManager } from '@/components/TagManager';
import { Tag, TagIcon } from '@/types/sprite';

interface TagManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (name: string, color: string, icon: TagIcon) => void;
  onUpdateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => void;
  onDeleteTag: (id: string) => void;
}

export function TagManagerDialog({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: TagManagerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Tag Manager</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto">
          <TagManager
            tags={tags}
            onCreateTag={onCreateTag}
            onUpdateTag={onUpdateTag}
            onDeleteTag={onDeleteTag}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
