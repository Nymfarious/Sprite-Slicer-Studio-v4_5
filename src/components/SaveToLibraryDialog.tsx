import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tag } from '@/types/sprite';
import { X, Plus, Save, Library } from 'lucide-react';

interface SaveToLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageDataUrl: string;
  imageWidth: number;
  imageHeight: number;
  defaultName?: string;
  availableTags: Tag[];
  onSave: (name: string, tagIds: string[]) => void;
}

export function SaveToLibraryDialog({
  open,
  onOpenChange,
  imageDataUrl,
  imageWidth,
  imageHeight,
  defaultName = 'Cropped Sprite',
  availableTags,
  onSave,
}: SaveToLibraryDialogProps) {
  const [name, setName] = useState(defaultName);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), selectedTagIds);
    // Reset state
    setName(defaultName);
    setSelectedTagIds([]);
    onOpenChange(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClose = () => {
    setName(defaultName);
    setSelectedTagIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="w-5 h-5" />
            Save to Library
          </DialogTitle>
          <DialogDescription>
            Name your cropped sprite and add tags for organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative border border-border rounded-lg overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZ3JpZCkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')]">
              <img
                src={imageDataUrl}
                alt="Cropped preview"
                className="max-w-[200px] max-h-[200px] object-contain"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="text-center text-xs text-muted-foreground">
            {imageWidth} × {imageHeight} pixels
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="sprite-name">Name</Label>
            <Input
              id="sprite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sprite name..."
              className="w-full"
              autoFocus
            />
          </div>

          {/* Tags Selection */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 p-2 border border-border rounded-md min-h-[60px] bg-muted/30">
                {availableTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    style={{
                      backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                      borderColor: tag.color,
                      color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {selectedTagIds.includes(tag.id) ? (
                      <X className="w-3 h-3 mr-1" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}
                    {tag.name}
                  </Badge>
                ))}
                {availableTags.length === 0 && (
                  <span className="text-xs text-muted-foreground">No tags available</span>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Save to Library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
