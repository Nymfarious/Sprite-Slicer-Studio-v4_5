import { X, Star, Heart, Bookmark, Zap, Palette, User, Box } from 'lucide-react';
import { Tag, TagIcon } from '@/types/sprite';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

const iconMap: Record<TagIcon, React.ComponentType<{ className?: string }>> = {
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  zap: Zap,
  palette: Palette,
  user: User,
  box: Box,
};

export function TagBadge({ tag, size = 'md', onRemove, className }: TagBadgeProps) {
  const IconComponent = iconMap[tag.icon] || Star;
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
  };
  
  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
      }}
    >
      <span
        className={cn('rounded-full', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}
        style={{ backgroundColor: tag.color }}
      />
      <IconComponent className={iconSizes[size]} />
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${tag.name} tag`}
        >
          <X className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        </button>
      )}
    </span>
  );
}

// Simple dot indicator for thumbnails
export function TagDot({ tag, className }: { tag: Tag; className?: string }) {
  return (
    <div
      className={cn('w-2 h-2 rounded-full', className)}
      style={{ backgroundColor: tag.color }}
      title={tag.name}
    />
  );
}
