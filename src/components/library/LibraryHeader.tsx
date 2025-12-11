import { Search, Grid, List, Package, MoreVertical, ArrowUpDown, Check, Trash2, Download, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FilterPresetsPopover } from './FilterPresetsPopover';
import { Tag } from '@/types/sprite';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';

interface LibraryHeaderProps {
  assetCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeToggle: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  tags: Tag[];
  activeTagFilters: string[];
  onToggleTagFilter: (tagId: string) => void;
  onClearTagFilters: () => void;
  selectedCount: number;
  filteredCount: number;
  onSelectAll: () => void;
  onBatchSave: () => void;
  onExportAll: () => void;
  onOpenTagManager: () => void;
  onClearAll: () => void;
  allTagsCount: number;
}

const getSortLabel = (sort: SortOption) => {
  const labels: Record<SortOption, string> = {
    'date-desc': 'Newest First',
    'date-asc': 'Oldest First',
    'name-asc': 'Name A-Z',
    'name-desc': 'Name Z-A',
    'size-desc': 'Largest First',
    'size-asc': 'Smallest First',
  };
  return labels[sort];
};

export function LibraryHeader({
  assetCount,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeToggle,
  sortBy,
  onSortChange,
  tags,
  activeTagFilters,
  onToggleTagFilter,
  onClearTagFilters,
  selectedCount,
  filteredCount,
  onSelectAll,
  onBatchSave,
  onExportAll,
  onOpenTagManager,
  onClearAll,
  allTagsCount,
}: LibraryHeaderProps) {
  return (
    <div className="p-4 border-b border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Library</h2>
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {assetCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Sort">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border z-50">
              {(['date-desc', 'date-asc', 'name-asc', 'name-desc', 'size-desc', 'size-asc'] as SortOption[]).map(option => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => onSortChange(option)}
                  className="flex items-center justify-between"
                >
                  {getSortLabel(option)}
                  {sortBy === option && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={onViewModeToggle}
            className="h-8 w-8"
            title={viewMode === 'grid' ? 'List View' : 'Grid View'}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border z-50">
              <DropdownMenuItem onClick={onSelectAll}>
                <Check className="w-4 h-4 mr-2" />
                {selectedCount === filteredCount ? 'Deselect All' : 'Select All'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onBatchSave} 
                disabled={selectedCount === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportAll} disabled={assetCount === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenTagManager} disabled={allTagsCount === 0}>
                <Settings2 className="w-4 h-4 mr-2" />
                Tag Manager
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={onClearAll} 
                disabled={assetCount === 0}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or tag..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-input border-border"
        />
      </div>

      {/* Filter presets with expandable popover */}
      <FilterPresetsPopover
        tags={tags}
        activeTagFilters={activeTagFilters}
        onToggleTagFilter={onToggleTagFilter}
        onClearTagFilters={onClearTagFilters}
        onOpenTagManager={onOpenTagManager}
      />
    </div>
  );
}
