import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { RotateCw, FlipHorizontal, FlipVertical, Copy } from 'lucide-react';
import { SpriteAsset } from '@/types/sprite';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

interface DraggableAssetProps {
  asset: SpriteAsset;
  children: React.ReactNode;
  onRotate?: (id: string) => void;
  onMirror?: (id: string) => void;
  onFlip?: (id: string) => void;
  onDuplicateMirrored?: (id: string) => void;
}

export function DraggableAsset({ 
  asset, 
  children, 
  onRotate,
  onMirror,
  onFlip,
  onDuplicateMirrored,
}: DraggableAssetProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `asset-${asset.id}`,
    data: { type: 'asset', assetId: asset.id, asset },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const hasTransformHandlers = onRotate || onMirror || onFlip || onDuplicateMirrored;

  const content = (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none",
        isDragging && "opacity-50 z-50"
      )}
    >
      {children}
    </div>
  );

  if (!hasTransformHandlers) {
    return content;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {content}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onRotate && (
          <ContextMenuItem onClick={() => onRotate(asset.id)}>
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate 90° CW
          </ContextMenuItem>
        )}
        {onMirror && (
          <ContextMenuItem onClick={() => onMirror(asset.id)}>
            <FlipHorizontal className="w-4 h-4 mr-2" />
            Mirror Horizontal
          </ContextMenuItem>
        )}
        {onFlip && (
          <ContextMenuItem onClick={() => onFlip(asset.id)}>
            <FlipVertical className="w-4 h-4 mr-2" />
            Flip Vertical
          </ContextMenuItem>
        )}
        {onDuplicateMirrored && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onDuplicateMirrored(asset.id)}>
              <Copy className="w-4 h-4 mr-2" />
              Create Mirrored Copy
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
