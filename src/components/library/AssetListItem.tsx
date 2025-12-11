import { useState, useCallback, useMemo } from 'react';
import { Download, Trash2, Tag as TagIcon, Sparkles, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagPickerPopover } from '@/components/TagPickerPopover';
import { SpriteAsset, Tag } from '@/types/sprite';

export interface AssetListItemProps {
  asset: SpriteAsset;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onExport: () => void;
  onDelete: () => void;
  onEnhance: () => void;
  onRename: (newName: string) => void;
  tags: Tag[];
  getTagsByIds: (ids: string[]) => Tag[];
  onToggleTag: (tagId: string) => void;
}

export function AssetListItem({ asset, isSelected, onSelect, onExport, onDelete, onEnhance, onRename, tags, getTagsByIds, onToggleTag }: AssetListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(asset.name);
  
  const fileSize = useMemo(() => {
    const base64Length = asset.imageData.length - 'data:image/png;base64,'.length;
    const bytes = (base64Length * 3) / 4;
    return bytes < 1024 ? `${Math.round(bytes)} B` : `${(bytes / 1024).toFixed(1)} KB`;
  }, [asset.imageData]);

  const assetTagObjects = useMemo(() => 
    getTagsByIds(asset.tags || []), 
    [asset.tags, getTagsByIds]
  );

  const handleRenameSubmit = useCallback(() => {
    if (editName.trim() && editName !== asset.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }, [editName, asset.name, onRename]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('imageId', asset.id);
    e.dataTransfer.setData('imageUrl', asset.imageData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
        isSelected 
          ? 'bg-primary/10 border border-primary/30' 
          : 'bg-secondary/30 border border-transparent hover:bg-secondary/50 hover:border-border'
      }`}
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
        isSelected 
          ? 'bg-primary border-primary' 
          : 'bg-background border-muted-foreground/50'
      }`}>
        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      <div className="relative w-10 h-10 bg-secondary/50 rounded grid-pattern flex items-center justify-center shrink-0">
        <img
          src={asset.imageData}
          alt={asset.name}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        {asset.enhanced && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-warning-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setIsEditing(false); setEditName(asset.name); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-6 text-xs font-mono bg-input"
            autoFocus
          />
        ) : (
          <p 
            className="text-sm font-mono text-foreground truncate cursor-text hover:underline"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditName(asset.name); }}
          >
            {asset.name}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{asset.coordinates.width}×{asset.coordinates.height}</span>
          <span>•</span>
          <span>{fileSize}</span>
          {assetTagObjects.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                {assetTagObjects.slice(0, 3).map(tag => (
                  <div 
                    key={tag.id} 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                    title={tag.name}
                  />
                ))}
                {assetTagObjects.length > 3 && (
                  <span className="text-[10px]">+{assetTagObjects.length - 3}</span>
                )}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditName(asset.name); }}
          className="h-7 w-7"
          title="Rename"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <div onClick={(e) => e.stopPropagation()}>
          <TagPickerPopover
            tags={tags}
            selectedTagIds={asset.tags || []}
            onToggle={onToggleTag}
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Tags">
                <TagIcon className="w-3.5 h-3.5" />
              </Button>
            }
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onEnhance(); }}
          className="h-7 w-7 text-warning hover:text-warning hover:bg-warning/20"
          title="AI Enhance"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onExport(); }}
          className="h-7 w-7"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="h-7 w-7 hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
