import { useState, useCallback, useMemo } from 'react';
import { FolderOpen } from 'lucide-react';
import { AssetThumbnail, AssetListItem, LibraryHeader, BulkActionBar, LibraryDialogs } from './library';
import { EnhanceModal } from './EnhanceModal';
import { ExportPackModal } from './ExportPackModal';
import { TagManagerDialog } from './TagManagerDialog';
import { SpriteAsset, Tag, TagIcon } from '@/types/sprite';
import { toast } from 'sonner';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';

interface LibraryPanelProps {
  assets: SpriteAsset[];
  onExportAsset: (asset: SpriteAsset) => void;
  onExportAll: () => void;
  onRemoveAsset: (id: string) => void;
  onClearLibrary: () => void;
  onUpdateAsset?: (id: string, updates: Partial<SpriteAsset>) => void;
  tags: Tag[];
  getTagsByIds: (ids: string[]) => Tag[];
  onRotateAsset?: (id: string) => void;
  onMirrorAsset?: (id: string) => void;
  onFlipAsset?: (id: string) => void;
  onDuplicateMirrored?: (id: string) => void;
  onCreateTag?: (name: string, color: string, icon: TagIcon) => void;
  onUpdateTag?: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => void;
  onDeleteTag?: (id: string) => void;
}

export function LibraryPanel({ 
  assets, 
  onExportAsset, 
  onExportAll, 
  onRemoveAsset, 
  onClearLibrary,
  onUpdateAsset,
  tags,
  getTagsByIds,
  onRotateAsset,
  onMirrorAsset,
  onFlipAsset,
  onDuplicateMirrored,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: LibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  
  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [exportPackOpen, setExportPackOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  
  // Enhance Modal
  const [enhanceModalOpen, setEnhanceModalOpen] = useState(false);
  const [assetToEnhance, setAssetToEnhance] = useState<SpriteAsset | null>(null);
  
  // Batch naming state
  const [batchPrefix, setBatchPrefix] = useState('');
  const [batchSuffix, setBatchSuffix] = useState('');
  const [batchNumbering, setBatchNumbering] = useState<'sequential' | 'row-col'>('sequential');
  
  // Export format
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Filter and sort assets - using OR logic for tags
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.sourceSheet.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // OR logic: asset matches if it has ANY of the selected tags
      const matchesTags = activeTagFilters.length === 0 || 
        activeTagFilters.some(tagId => asset.tags?.includes(tagId));
      
      return matchesSearch && matchesTags;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return b.createdAt - a.createdAt;
        case 'date-asc': return a.createdAt - b.createdAt;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'size-desc': return (b.coordinates.width * b.coordinates.height) - (a.coordinates.width * a.coordinates.height);
        case 'size-asc': return (a.coordinates.width * a.coordinates.height) - (b.coordinates.width * b.coordinates.height);
        default: return 0;
      }
    });

    return filtered;
  }, [assets, searchQuery, sortBy, activeTagFilters]);

  const toggleTagFilter = useCallback((tagId: string) => {
    setActiveTagFilters(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const clearTagFilters = useCallback(() => setActiveTagFilters([]), []);

  const toggleAssetTag = useCallback((assetId: string, tagId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || !onUpdateAsset) return;
    
    const currentTags = asset.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    onUpdateAsset(assetId, { tags: newTags });
  }, [assets, onUpdateAsset]);

  const selectedAssets = useMemo(() => assets.filter(a => selectedIds.has(a.id)), [assets, selectedIds]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach(asset => asset.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [assets]);

  const handleSelectItem = useCallback((id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const startIndex = filteredAndSortedAssets.findIndex(a => a.id === lastSelectedId);
      const endIndex = filteredAndSortedAssets.findIndex(a => a.id === id);
      const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
      const rangeIds = filteredAndSortedAssets.slice(from, to + 1).map(a => a.id);
      setSelectedIds(prev => {
        const next = new Set(prev);
        rangeIds.forEach(rid => next.add(rid));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
    setLastSelectedId(id);
  }, [lastSelectedId, filteredAndSortedAssets]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredAndSortedAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedAssets.map(a => a.id)));
    }
  }, [filteredAndSortedAssets, selectedIds.size]);

  const handleDeleteSelected = useCallback(() => {
    selectedIds.forEach(id => onRemoveAsset(id));
    toast.success(`Deleted ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}`);
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  }, [selectedIds, onRemoveAsset]);

  const handleDeleteSingle = useCallback((id: string) => {
    onRemoveAsset(id);
    toast.success('Asset deleted');
    setPendingDeleteId(null);
  }, [onRemoveAsset]);

  const handleTagSelected = useCallback(() => {
    if (!tagInput.trim()) return;
    
    const newTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    selectedIds.forEach(id => {
      const asset = assets.find(a => a.id === id);
      if (asset && onUpdateAsset) {
        const existingTags = asset.tags || [];
        const uniqueTags = [...new Set([...existingTags, ...newTags])];
        onUpdateAsset(id, { tags: uniqueTags });
      }
    });
    
    toast.success(`Tagged ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}`);
    setTagDialogOpen(false);
    setTagInput('');
  }, [tagInput, selectedIds, assets, onUpdateAsset]);

  const handleRemoveTagGlobally = useCallback((tagToRemove: string) => {
    assets.forEach(asset => {
      if (asset.tags?.includes(tagToRemove) && onUpdateAsset) {
        const updatedTags = asset.tags.filter(t => t !== tagToRemove);
        onUpdateAsset(asset.id, { tags: updatedTags });
      }
    });
    toast.success(`Removed tag "${tagToRemove}" from all assets`);
  }, [assets, onUpdateAsset]);

  const handleEnhance = useCallback((assetId: string, prompt: string) => {
    if (onUpdateAsset) {
      onUpdateAsset(assetId, { enhanced: true, enhancementPrompt: prompt });
    }
  }, [onUpdateAsset]);

  const openEnhanceModal = useCallback((asset: SpriteAsset) => {
    setAssetToEnhance(asset);
    setEnhanceModalOpen(true);
  }, []);

  const handleRename = useCallback((assetId: string, newName: string) => {
    if (onUpdateAsset && newName.trim()) {
      onUpdateAsset(assetId, { name: newName.trim() });
      toast.success('Renamed successfully');
    }
  }, [onUpdateAsset]);

  const handleBatchRename = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    const sortedSelected = filteredAndSortedAssets.filter(a => selectedIds.has(a.id));
    
    sortedSelected.forEach((asset, index) => {
      const baseName = batchPrefix || asset.name.split('_slice_')[0] || 'sprite';
      let newName = '';
      
      if (batchNumbering === 'sequential') {
        newName = `${baseName}${batchSuffix}_${String(index + 1).padStart(3, '0')}`;
      } else {
        const match = asset.name.match(/_(\d+)-(\d+)$/);
        const rowCol = match ? `${match[1]}-${match[2]}` : `${Math.floor(index / 4) + 1}-${(index % 4) + 1}`;
        newName = `${baseName}${batchSuffix}_${rowCol}`;
      }
      
      if (onUpdateAsset) onUpdateAsset(asset.id, { name: newName });
    });
    
    toast.success(`Renamed ${selectedIds.size} file${selectedIds.size > 1 ? 's' : ''}`);
  }, [selectedIds, filteredAndSortedAssets, batchPrefix, batchSuffix, batchNumbering, onUpdateAsset]);

  const handleSaveAsset = useCallback((asset: SpriteAsset) => {
    const mimeType = exportFormat === 'png' ? 'image/png' : exportFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const extension = exportFormat;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      if (exportFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL(mimeType, 0.92);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${asset.name}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Saved', { description: `${asset.name}.${extension} downloaded` });
    };
    img.src = asset.imageData;
  }, [exportFormat]);

  const handleBatchSave = useCallback(async () => {
    if (selectedIds.size === 0) return;
    
    const selectedAssetsList = filteredAndSortedAssets.filter(a => selectedIds.has(a.id));
    toast.info('Saving...', { description: `Downloading ${selectedAssetsList.length} files...` });
    
    for (let i = 0; i < selectedAssetsList.length; i++) {
      const asset = selectedAssetsList[i];
      const mimeType = exportFormat === 'png' ? 'image/png' : exportFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const extension = exportFormat;
      
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(); return; }
          
          if (exportFormat === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(mimeType, 0.92);
          
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${asset.name}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(resolve, 100);
        };
        img.onerror = () => resolve();
        img.src = asset.imageData;
      });
    }
    
    toast.success('Complete', { description: `${selectedAssetsList.length} files saved to Downloads` });
  }, [selectedIds, filteredAndSortedAssets, exportFormat]);

  const handleClearAll = useCallback(() => {
    onClearLibrary();
    setClearDialogOpen(false);
    setSelectedIds(new Set());
    toast.success('Library cleared');
  }, [onClearLibrary]);

  return (
    <div className="h-full flex flex-col bg-background/[0.88] backdrop-blur-md">
      <LibraryHeader
        assetCount={assets.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        sortBy={sortBy}
        onSortChange={setSortBy}
        tags={tags}
        activeTagFilters={activeTagFilters}
        onToggleTagFilter={toggleTagFilter}
        onClearTagFilters={clearTagFilters}
        selectedCount={selectedIds.size}
        filteredCount={filteredAndSortedAssets.length}
        onSelectAll={handleSelectAll}
        onBatchSave={handleBatchSave}
        onExportAll={onExportAll}
        onOpenTagManager={() => setTagManagerOpen(true)}
        onClearAll={() => setClearDialogOpen(true)}
        allTagsCount={allTags.length}
      />

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          batchPrefix={batchPrefix}
          setBatchPrefix={setBatchPrefix}
          batchSuffix={batchSuffix}
          setBatchSuffix={setBatchSuffix}
          batchNumbering={batchNumbering}
          setBatchNumbering={setBatchNumbering}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          onBatchRename={handleBatchRename}
          onBatchSave={handleBatchSave}
          onOpenTagDialog={() => setTagDialogOpen(true)}
          onOpenExportPack={() => setExportPackOpen(true)}
          onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      {/* Assets Grid/List */}
      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        {filteredAndSortedAssets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">
                {assets.length === 0 ? 'No assets yet' : 'No matching assets'}
              </p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                {assets.length === 0 && 'Slice a sheet to get started!'}
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredAndSortedAssets.map(asset => (
              <AssetThumbnail
                key={asset.id}
                asset={asset}
                isSelected={selectedIds.has(asset.id)}
                onSelect={(e) => handleSelectItem(asset.id, e)}
                onExport={() => handleSaveAsset(asset)}
                onDelete={() => setPendingDeleteId(asset.id)}
                onEnhance={() => openEnhanceModal(asset)}
                onRename={(newName) => handleRename(asset.id, newName)}
                tags={tags}
                getTagsByIds={getTagsByIds}
                onToggleTag={(tagId) => toggleAssetTag(asset.id, tagId)}
                onRotate={onRotateAsset ? () => onRotateAsset(asset.id) : undefined}
                onMirror={onMirrorAsset ? () => onMirrorAsset(asset.id) : undefined}
                onFlip={onFlipAsset ? () => onFlipAsset(asset.id) : undefined}
                onDuplicateMirrored={onDuplicateMirrored ? () => onDuplicateMirrored(asset.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAndSortedAssets.map(asset => (
              <AssetListItem
                key={asset.id}
                asset={asset}
                isSelected={selectedIds.has(asset.id)}
                onSelect={(e) => handleSelectItem(asset.id, e)}
                onExport={() => handleSaveAsset(asset)}
                onDelete={() => setPendingDeleteId(asset.id)}
                onEnhance={() => openEnhanceModal(asset)}
                onRename={(newName) => handleRename(asset.id, newName)}
                tags={tags}
                getTagsByIds={getTagsByIds}
                onToggleTag={(tagId) => toggleAssetTag(asset.id, tagId)}
              />
            ))}
          </div>
        )}
      </div>

      <LibraryDialogs
        pendingDeleteId={pendingDeleteId}
        setPendingDeleteId={setPendingDeleteId}
        assetToDelete={assets.find(a => a.id === pendingDeleteId)}
        onDeleteSingle={handleDeleteSingle}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        selectedCount={selectedIds.size}
        onDeleteSelected={handleDeleteSelected}
        clearDialogOpen={clearDialogOpen}
        setClearDialogOpen={setClearDialogOpen}
        totalAssetCount={assets.length}
        onClearLibrary={handleClearAll}
        tagDialogOpen={tagDialogOpen}
        setTagDialogOpen={setTagDialogOpen}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onTagSelected={handleTagSelected}
      />

      {onCreateTag && onUpdateTag && onDeleteTag && (
        <TagManagerDialog
          isOpen={tagManagerOpen}
          onClose={() => setTagManagerOpen(false)}
          tags={tags}
          onCreateTag={onCreateTag}
          onUpdateTag={onUpdateTag}
          onDeleteTag={onDeleteTag}
        />
      )}

      <ExportPackModal
        isOpen={exportPackOpen}
        onClose={() => setExportPackOpen(false)}
        selectedAssets={selectedAssets}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      <EnhanceModal
        isOpen={enhanceModalOpen}
        onClose={() => {
          setEnhanceModalOpen(false);
          setAssetToEnhance(null);
        }}
        asset={assetToEnhance}
        onEnhance={handleEnhance}
      />
    </div>
  );
}
