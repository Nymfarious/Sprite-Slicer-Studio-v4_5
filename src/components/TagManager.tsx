import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X, Star, Heart, Bookmark, Zap, Palette, User, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagBadge } from '@/components/TagBadge';
import { Tag, TagIcon } from '@/types/sprite';
import { toast } from 'sonner';

interface TagManagerProps {
  tags: Tag[];
  onCreateTag: (name: string, color: string, icon: TagIcon) => void;
  onUpdateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => void;
  onDeleteTag: (id: string) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const ICON_OPTIONS: { value: TagIcon; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'star', label: 'Star', icon: Star },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'bookmark', label: 'Bookmark', icon: Bookmark },
  { value: 'zap', label: 'Lightning', icon: Zap },
  { value: 'palette', label: 'Palette', icon: Palette },
  { value: 'user', label: 'Person', icon: User },
  { value: 'box', label: 'Box', icon: Box },
];

export function TagManager({ tags, onCreateTag, onUpdateTag, onDeleteTag }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [newTagIcon, setNewTagIcon] = useState<TagIcon>('star');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState<TagIcon>('star');

  const handleCreate = () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    if (newTagName.trim().length > 20) {
      toast.error('Tag name must be 20 characters or less');
      return;
    }
    onCreateTag(newTagName.trim(), newTagColor, newTagIcon);
    setNewTagName('');
    toast.success('Tag created');
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setEditIcon(tag.icon);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editingId) return;
    onUpdateTag(editingId, { name: editName.trim(), color: editColor, icon: editIcon });
    setEditingId(null);
    toast.success('Tag updated');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    onDeleteTag(id);
    toast.success(`Deleted "${name}"`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Tags</Label>
        <span className="text-xs text-muted-foreground">{tags.length} tags</span>
      </div>

      {/* Existing tags list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No tags created yet
          </p>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
              {editingId === tag.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-xs flex-1"
                    maxLength={20}
                    autoFocus
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer"
                  />
                  <Select value={editIcon} onValueChange={(v) => setEditIcon(v as TagIcon)}>
                    <SelectTrigger className="w-20 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3" />
                            <span className="text-xs">{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={saveEdit}>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={cancelEdit}>
                    <X className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ) : (
                <>
                  <TagBadge tag={tag} size="sm" />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => startEdit(tag)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tag.id, tag.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add new tag - inline form */}
      <div className="pt-2 border-t border-border">
        <Label className="text-xs text-muted-foreground mb-2 block">Add new tag</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="h-8 text-xs flex-1"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <Select value={newTagIcon} onValueChange={(v) => setNewTagIcon(v as TagIcon)}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    <span className="text-xs">{label}</span>
                  </div>
                </SelectItem>
              ))}</SelectContent>
          </Select>
          <Button size="sm" className="h-8" onClick={handleCreate}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
