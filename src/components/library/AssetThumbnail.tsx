import { useState, useCallback, useMemo } from 'react';
import { Download, Trash2, Tag as TagIcon, Sparkles, Edit2, RotateCw, FlipHorizontal, FlipVertical, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu';
import { TagPickerPopover } from '@/components/TagPickerPopover';
import { SpriteAsset, Tag } from '@/types/sprite';

export interface AssetItemProps {
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
  onRotate?: () => void;
  onMirror?: () => void;
  onFlip?: () => void;
  onDuplicateMirrored?: () => void;
}

export function AssetThumbnail({ asset, isSelected, onSelect, onExport, onDelete, onEnhance, onRename, tags, getTagsByIds, onToggleTag, onRotate, onMirror, onFlip, onDuplicateMirrored }: AssetItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(asset.name);
  
  const fileSize = useMemo(() => {
    const base64Length = asset.imageData.length - 'data:image/png;base64,'.length;
    const bytes = (base64Length * 3) / 4;
    return bytes < 1024 ? `${Math.round(bytes)} B` : `${(bytes / 1024).toFixed(1)} KB`;
  }, [asset.imageData]);

  const handleRenameSubmit = useCallback(() => {
    if (editName.trim() && editName !== asset.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }, [editName, asset.name, onRename]);

  const assetTagObjects = useMemo(() => 
    getTagsByIds(asset.tags || []), 
    [asset.tags, getTagsByIds]
  );

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('imageId', asset.id);
    e.dataTransfer.setData('imageUrl', asset.imageData);
    e.dataTransfer.setData('type', 'library-image');
    e.dataTransfer.effectAllowed = 'copy';
  };

  const hasTransformHandlers = onRotate || onMirror || onFlip || onDuplicateMirrored;

  const thumbnailContent = (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all duration-200 ${
            isSelected 
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
              : 'hover:ring-1 hover:ring-primary/50'
          }`}
          onClick={onSelect}
          draggable
          onDragStart={handleDragStart}
        >
          <div className="absolute inset-0 bg-secondary/30 grid-pattern flex items-center justify-center p-1">
            <img
              src={asset.imageData}
              alt={asset.name}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          </div>

          {asset.enhanced && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-warning/90 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-warning-foreground" />
            </div>
          )}

          <div className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected 
              ? 'bg-primary border-primary' 
              : 'bg-background/80 border-muted-foreground/50 opacity-0 group-hover:opacity-100'
          }`}>
            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>

          {assetTagObjects.length > 0 && (
            <div className="absolute bottom-1 left-1 flex gap-0.5">
              {assetTagObjects.slice(0, 3).map(tag => (
                <div 
                  key={tag.id} 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: tag.color }}
                  title={tag.name}
                />
              ))}
              {assetTagObjects.length > 3 && (
                <span className="text-[8px] text-white bg-black/50 rounded px-0.5 ml-0.5">
                  +{assetTagObjects.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditName(asset.name); }}
              className="w-6 h-6 rounded bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <TagPickerPopover
                tags={tags}
                selectedTagIds={asset.tags || []}
                onToggle={onToggleTag}
                trigger={
                  <button
                    className="w-6 h-6 rounded bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    title="Tags"
                  >
                    <TagIcon className="w-3 h-3" />
                  </button>
                }
              />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onEnhance(); }}
              className="w-6 h-6 rounded bg-warning/90 flex items-center justify-center hover:bg-warning text-warning-foreground transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onExport(); }}
              className="w-6 h-6 rounded bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Download"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-6 h-6 rounded bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {isEditing && (
            <div 
              className="absolute inset-0 bg-background/95 flex items-center justify-center p-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') { setIsEditing(false); setEditName(asset.name); }
                }}
                className="h-7 text-xs font-mono"
                autoFocus
              />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-popover border-border p-3 max-w-[200px] z-50">
        <div className="space-y-1.5 text-xs">
          <p className="font-medium text-foreground truncate">{asset.name}</p>
          <p className="text-muted-foreground font-mono">
            {asset.coordinates.width} × {asset.coordinates.height} px
          </p>
          <p className="text-muted-foreground">{fileSize}</p>
          {asset.enhanced && (
            <p className="text-warning flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Enhanced
            </p>
          )}
          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {asset.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-muted-foreground/70 text-[10px] pt-1 border-t border-border">
            From: {asset.sourceSheet.filename}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );

  if (!hasTransformHandlers) {
    return thumbnailContent;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {thumbnailContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onRotate && (
          <ContextMenuItem onClick={onRotate}>
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate 90° CW
          </ContextMenuItem>
        )}
        {onMirror && (
          <ContextMenuItem onClick={onMirror}>
            <FlipHorizontal className="w-4 h-4 mr-2" />
            Mirror Horizontal
          </ContextMenuItem>
        )}
        {onFlip && (
          <ContextMenuItem onClick={onFlip}>
            <FlipVertical className="w-4 h-4 mr-2" />
            Flip Vertical
          </ContextMenuItem>
        )}
        {onDuplicateMirrored && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDuplicateMirrored}>
              <Copy className="w-4 h-4 mr-2" />
              Create Mirrored Copy
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
