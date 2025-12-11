import { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, FolderPlus, Folder, ChevronRight, ChevronDown, 
  MoreVertical, Trash2, Edit2, Image, X, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Project, Folder as FolderType, SpriteAsset } from '@/types/sprite';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { toast } from 'sonner';

interface ProjectViewProps {
  project: Project;
  assets: SpriteAsset[];
  selectedFolderId: string | null;
  onBack: () => void;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onRemoveImage: (imageId: string, folderId?: string) => void;
  onAddImageToFolder?: (imageId: string, folderId?: string) => void;
}

function DroppableFolderItem({
  folder,
  depth,
  maxDepth,
  isSelected,
  onSelect,
  onDelete,
  onRename,
  onCreateSubfolder,
  childFolders,
  imageCount,
  onAddImage,
}: {
  folder: FolderType;
  depth: number;
  maxDepth: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onCreateSubfolder: () => void;
  childFolders: FolderType[];
  imageCount: number;
  onAddImage?: (imageId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [isNativeDragOver, setIsNativeDragOver] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folderId: folder.id },
  });

  const handleRename = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  // Native HTML5 drag handlers
  const handleNativeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsNativeDragOver(true);
  };

  const handleNativeDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsNativeDragOver(false);
  };

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNativeDragOver(false);
    const imageId = e.dataTransfer.getData('imageId');
    const dragType = e.dataTransfer.getData('type');
    
    if (imageId && dragType === 'library-image' && onAddImage) {
      onAddImage(imageId);
      toast.success(`Added to ${folder.name}`);
    }
  };

  const hasChildren = childFolders.length > 0;
  const canCreateSubfolder = depth < maxDepth - 1;

  return (
    <div ref={setNodeRef}>
      <div
        className={cn(
          "flex items-center gap-1 p-1.5 rounded-md cursor-pointer group transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "hover:bg-accent",
          (isOver || isNativeDragOver) && "bg-primary/30 ring-2 ring-primary"
        )}
        style={{ paddingLeft: `${depth * 16 + 6}px` }}
        onClick={onSelect}
        onDragOver={handleNativeDragOver}
        onDragLeave={handleNativeDragLeave}
        onDrop={handleNativeDrop}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-0.5 hover:bg-accent rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <Folder className="w-4 h-4 text-muted-foreground" />

        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setIsEditing(false); setEditName(folder.name); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-5 text-xs px-1 flex-1"
            autoFocus
          />
        ) : (
          <span className="text-xs font-medium flex-1 truncate">{folder.name}</span>
        )}

        <span className="text-[10px] text-muted-foreground">{imageCount}</span>

        <div 
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border z-50">
              <DropdownMenuItem onClick={() => { setIsEditing(true); setEditName(folder.name); }}>
                <Edit2 className="w-3 h-3 mr-2" />
                Rename
              </DropdownMenuItem>
              {canCreateSubfolder && (
                <DropdownMenuItem onClick={onCreateSubfolder}>
                  <FolderPlus className="w-3 h-3 mr-2" />
                  New Subfolder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Child Folders */}
      {isExpanded && hasChildren && (
        <div>
          {childFolders.map(child => (
            <DroppableFolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              isSelected={false}
              onSelect={() => {}}
              onDelete={() => {}}
              onRename={() => {}}
              onCreateSubfolder={() => {}}
              childFolders={[]}
              imageCount={child.imageIds.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectView({
  project,
  assets,
  selectedFolderId,
  onBack,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onRemoveImage,
  onAddImageToFolder,
}: ProjectViewProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createFolderParentId, setCreateFolderParentId] = useState<string | undefined>();
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  // Get root-level folders
  const rootFolders = useMemo(() => 
    project.folders.filter(f => !f.parentId),
    [project.folders]
  );

  // Get child folders for a parent
  const getChildFolders = useCallback((parentId: string) =>
    project.folders.filter(f => f.parentId === parentId),
    [project.folders]
  );

  // Get current display images
  const currentImages = useMemo(() => {
    let imageIds: string[];
    if (selectedFolderId) {
      const folder = project.folders.find(f => f.id === selectedFolderId);
      imageIds = folder?.imageIds || [];
    } else {
      imageIds = project.rootImageIds;
    }
    return assets.filter(a => imageIds.includes(a.id));
  }, [selectedFolderId, project, assets]);

  const { setNodeRef: setRootDropRef, isOver: isRootOver } = useDroppable({
    id: `project-root-${project.id}`,
    data: { type: 'project-root', projectId: project.id },
  });

  // Handle native drag and drop from library
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData('imageId');
    const dragType = e.dataTransfer.getData('type');
    
    if (imageId && dragType === 'library-image') {
      if (folderId) {
        // Add to specific folder - handled by folder drop
      } else {
        // Add to project root - this is handled by the root drop zone
      }
      toast.success(`Added to ${folderId ? 'folder' : 'project'}`);
    }
  }, []);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), createFolderParentId);
      setNewFolderName('');
      setShowCreateFolder(false);
      setCreateFolderParentId(undefined);
      toast.success('Folder created');
    }
  };

  const openCreateSubfolder = (parentId: string) => {
    setCreateFolderParentId(parentId);
    setShowCreateFolder(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-sm flex-1 truncate">{project.name}</h3>
        
        <Popover open={showCreateFolder} onOpenChange={setShowCreateFolder}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <FolderPlus className="w-3 h-3 mr-1" />
              New Folder
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-popover border-border" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                {createFolderParentId ? 'New Subfolder' : 'New Folder'}
              </h4>
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
                className="h-8 text-sm bg-input"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowCreateFolder(false);
                    setCreateFolderParentId(undefined);
                  }}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="h-7 text-xs"
                >
                  Create
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Folder Tree & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Folder Tree */}
        <div className="w-48 border-r border-border p-2 overflow-y-auto">
          {/* Root (All Images) */}
          <div
            ref={setRootDropRef}
            className={cn(
              "flex items-center gap-2 p-1.5 rounded-md cursor-pointer mb-1",
              !selectedFolderId ? "bg-primary/20 text-primary" : "hover:bg-accent",
              isRootOver && "bg-primary/30"
            )}
            onClick={() => onSelectFolder(null)}
          >
            <Image className="w-4 h-4" />
            <span className="text-xs font-medium">All Images</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {project.rootImageIds.length}
            </span>
          </div>

          {/* Folders */}
          {rootFolders.map(folder => (
            <DroppableFolderItem
              key={folder.id}
              folder={folder}
              depth={0}
              maxDepth={2}
              isSelected={selectedFolderId === folder.id}
              onSelect={() => onSelectFolder(folder.id)}
              onDelete={() => onDeleteFolder(folder.id)}
              onRename={(newName) => onRenameFolder(folder.id, newName)}
              onCreateSubfolder={() => openCreateSubfolder(folder.id)}
              childFolders={getChildFolders(folder.id)}
              imageCount={folder.imageIds.length}
              onAddImage={onAddImageToFolder ? (imageId) => onAddImageToFolder(imageId, folder.id) : undefined}
            />
          ))}
        </div>

        {/* Main: Image Grid */}
        <div className="flex-1 p-3 overflow-y-auto">
          {currentImages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No images here</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Drag images from the library
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {currentImages.map(asset => (
                <div 
                  key={asset.id} 
                  className="relative aspect-square rounded-lg overflow-hidden bg-secondary/30 group"
                >
                  <img
                    src={asset.imageData}
                    alt={asset.name}
                    className="w-full h-full object-contain p-1"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <button
                    onClick={() => setDeleteImageId(asset.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                  <p className="absolute bottom-0 left-0 right-0 bg-background/80 text-[9px] px-1 py-0.5 truncate">
                    {asset.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remove Image Confirmation */}
      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Image</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this image from {selectedFolderId ? 'this folder' : 'the project'}? 
              The image will remain in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteImageId) {
                  onRemoveImage(deleteImageId, selectedFolderId || undefined);
                  setDeleteImageId(null);
                  toast.success('Image removed');
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
