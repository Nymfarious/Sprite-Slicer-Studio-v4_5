import { useState } from 'react';
import { ChevronDown, Plus, Folder, MoreVertical, Trash2, Edit2 } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Project, SpriteAsset } from '@/types/sprite';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { toast } from 'sonner';

interface ProjectsBarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  assets: SpriteAsset[];
  onAddImageToProject?: (projectId: string, imageId: string) => void;
}

function DroppableProjectCard({ 
  project, 
  isSelected, 
  onSelect, 
  onDelete, 
  onRename,
  thumbnailData,
  onAddImage,
}: { 
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  thumbnailData?: string;
  onAddImage?: (imageId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isNativeDragOver, setIsNativeDragOver] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `project-${project.id}`,
    data: { type: 'project', projectId: project.id },
  });

  const handleRename = () => {
    if (editName.trim() && editName !== project.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const imageCount = project.rootImageIds.length + 
    project.folders.reduce((acc, f) => acc + f.imageIds.length, 0);

  // Native HTML5 drag handlers for library items
  const handleNativeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsNativeDragOver(true);
  };

  const handleNativeDragLeave = () => {
    setIsNativeDragOver(false);
  };

  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsNativeDragOver(false);
    const imageId = e.dataTransfer.getData('imageId');
    const dragType = e.dataTransfer.getData('type');
    
    if (imageId && dragType === 'library-image' && onAddImage) {
      onAddImage(imageId);
      toast.success(`Added to ${project.name}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex-shrink-0 w-24 rounded-lg border-2 transition-all cursor-pointer group",
        isSelected 
          ? "border-primary bg-primary/10" 
          : "border-border hover:border-primary/50 bg-secondary/30",
        (isOver || isNativeDragOver) && "border-primary bg-primary/20 scale-105"
      )}
      onClick={onSelect}
      onDragOver={handleNativeDragOver}
      onDragLeave={handleNativeDragLeave}
      onDrop={handleNativeDrop}
    >
      {/* Thumbnail */}
      <div className="aspect-square rounded-t-md overflow-hidden bg-secondary/50 flex items-center justify-center">
        {thumbnailData ? (
          <img 
            src={thumbnailData} 
            alt={project.name}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <Folder className="w-8 h-8 text-muted-foreground/50" />
        )}
      </div>

      {/* Name & Count */}
      <div className="p-1.5">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setIsEditing(false); setEditName(project.name); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-5 text-[10px] px-1"
            autoFocus
          />
        ) : (
          <p className="text-[10px] font-medium truncate">{project.name}</p>
        )}
        <p className="text-[9px] text-muted-foreground">{imageCount} images</p>
      </div>

      {/* Context Menu */}
      <div 
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 bg-background/80">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border z-50">
            <DropdownMenuItem onClick={() => { setIsEditing(true); setEditName(project.name); }}>
              <Edit2 className="w-3 h-3 mr-2" />
              Rename
            </DropdownMenuItem>
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
  );
}

export function ProjectsBar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  assets,
  onAddImageToProject,
}: ProjectsBarProps) {
  const [expanded, setExpanded] = useState(true);
  const [showCreatePopover, setShowCreatePopover] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreatePopover(false);
    }
  };

  const getAssetThumbnail = (project: Project): string | undefined => {
    const thumbnailId = project.thumbnailId || project.rootImageIds[0] || 
      project.folders.find(f => f.imageIds.length > 0)?.imageIds[0];
    if (!thumbnailId) return undefined;
    return assets.find(a => a.id === thumbnailId)?.imageData;
  };

  return (
    <div className="border-t border-border">
      {/* Collapse Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full p-2 hover:bg-accent/50 transition-colors"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", !expanded && "-rotate-90")} />
        <span className="text-sm font-medium">Projects</span>
        <span className="text-xs text-muted-foreground">({projects.length})</span>
      </button>

      {/* Projects Row */}
      {expanded && (
        <div className="flex gap-3 p-3 overflow-x-auto scrollbar-thin">
          {/* Create New Project Button */}
          <Popover open={showCreatePopover} onOpenChange={setShowCreatePopover}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button 
                    className="flex-shrink-0 w-12 h-12 border border-dashed border-muted-foreground/40 rounded-md flex items-center justify-center hover:border-primary/50 hover:bg-accent/30 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                New Project
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 bg-popover border-border" align="start">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">New Project</h4>
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                  className="h-8 text-sm bg-input"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreatePopover(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleCreate}
                    disabled={!newProjectName.trim()}
                    className="h-7 text-xs"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Project Cards */}
          {projects.map(project => (
            <DroppableProjectCard
              key={project.id}
              project={project}
              isSelected={selectedProjectId === project.id}
              onSelect={() => onSelectProject(
                selectedProjectId === project.id ? null : project.id
              )}
              onDelete={() => onDeleteProject(project.id)}
              onRename={(newName) => onRenameProject(project.id, newName)}
              thumbnailData={getAssetThumbnail(project)}
              onAddImage={onAddImageToProject ? (imageId) => onAddImageToProject(project.id, imageId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
