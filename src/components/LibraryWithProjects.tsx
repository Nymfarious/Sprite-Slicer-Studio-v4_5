import { useState, useMemo, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { LibraryPanel } from './LibraryPanel';
import { ProjectsBar } from './ProjectsBar';
import { ProjectView } from './ProjectView';
import { GeneratePoseDialog } from './GeneratePoseDialog';
import { GenerateSheetDialog } from './GenerateSheetDialog';
import { LibraryToggle, LibraryView } from './LibraryToggle';
import { VideoProjectsPanel } from './VideoProjectsPanel';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useProjects } from '@/hooks/useProjects';
import { useVideoProjects, VideoProject } from '@/hooks/useVideoProjects';
import { SpriteAsset, Tag, TagIcon } from '@/types/sprite';
import { toast } from 'sonner';

interface LibraryWithProjectsProps {
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
  onAddGeneratedAsset?: (imageUrl: string, name: string) => void;
  onUploadGeneratedSheet?: (imageUrl: string) => void;
  onLoadVideoProject?: (project: VideoProject) => void;
  onCreateTag?: (name: string, color: string, icon: TagIcon) => void;
  onUpdateTag?: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => void;
  onDeleteTag?: (id: string) => void;
}

export function LibraryWithProjects({
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
  onAddGeneratedAsset,
  onUploadGeneratedSheet,
  onLoadVideoProject,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: LibraryWithProjectsProps) {
  const [hideOrganized, setHideOrganized] = useState(false);
  const [libraryView, setLibraryView] = useState<LibraryView>('images');
  const { projects: videoProjects, deleteProject: deleteVideoProject } = useVideoProjects();

  const {
    projects,
    selectedProject,
    selectedProjectId,
    selectedFolderId,
    setSelectedProjectId,
    setSelectedFolderId,
    createProject,
    deleteProject,
    renameProject,
    createFolder,
    deleteFolder,
    renameFolder,
    addImageToProject,
    removeImageFromProject,
    getOrganizedImageIds,
  } = useProjects();

  // Filter out organized images if toggle is on
  const filteredAssets = useMemo(() => {
    if (!hideOrganized) return assets;
    const organizedIds = getOrganizedImageIds();
    return assets.filter(a => !organizedIds.has(a.id));
  }, [assets, hideOrganized, getOrganizedImageIds]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== 'asset') return;
    
    const assetId = activeData.assetId as string;

    if (overData?.type === 'project') {
      const projectId = overData.projectId as string;
      addImageToProject(projectId, assetId);
      toast.success('Added to project');
    } else if (overData?.type === 'folder') {
      const folderId = overData.folderId as string;
      // Find which project this folder belongs to
      const project = projects.find(p => p.folders.some(f => f.id === folderId));
      if (project) {
        addImageToProject(project.id, assetId, folderId);
        toast.success('Added to folder');
      }
    } else if (overData?.type === 'project-root') {
      const projectId = overData.projectId as string;
      addImageToProject(projectId, assetId);
      toast.success('Added to project');
    }
  }, [addImageToProject, projects]);

  // Handlers for project operations
  const handleCreateFolder = useCallback((name: string, parentId?: string) => {
    if (selectedProjectId) {
      createFolder(selectedProjectId, name, parentId);
    }
  }, [selectedProjectId, createFolder]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    if (selectedProjectId) {
      deleteFolder(selectedProjectId, folderId);
    }
  }, [selectedProjectId, deleteFolder]);

  const handleRenameFolder = useCallback((folderId: string, newName: string) => {
    if (selectedProjectId) {
      renameFolder(selectedProjectId, folderId, newName);
    }
  }, [selectedProjectId, renameFolder]);

  const handleRemoveImage = useCallback((imageId: string, folderId?: string) => {
    if (selectedProjectId) {
      removeImageFromProject(selectedProjectId, imageId, folderId);
    }
  }, [selectedProjectId, removeImageFromProject]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedProject ? (
            <ProjectView
              project={selectedProject}
              assets={assets}
              selectedFolderId={selectedFolderId}
              onBack={() => setSelectedProjectId(null)}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onRenameFolder={handleRenameFolder}
              onRemoveImage={handleRemoveImage}
              onAddImageToFolder={(imageId, folderId) => addImageToProject(selectedProjectId!, imageId, folderId)}
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Library Toggle + Controls */}
              <div className="px-4 py-2 border-b border-border space-y-2">
                <div className="flex items-center justify-between">
                  <LibraryToggle value={libraryView} onChange={setLibraryView} />
                </div>
                
                {libraryView === 'images' && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GeneratePoseDialog
                        onGenerate={(imageUrl) => {
                          onAddGeneratedAsset?.(imageUrl, 'AI Generated Pose');
                        }}
                        styleReferences={assets.slice(0, 6).map(asset => ({
                          id: asset.id,
                          url: asset.imageData,
                          name: asset.name,
                        }))}
                      />
                      <GenerateSheetDialog
                        onGenerate={(imageUrl) => {
                          onUploadGeneratedSheet?.(imageUrl);
                        }}
                      />
                    </div>
                    
                    <Label htmlFor="hide-organized" className="text-xs text-muted-foreground flex items-center gap-2">
                      <Switch
                        id="hide-organized"
                        checked={hideOrganized}
                        onCheckedChange={setHideOrganized}
                        className="scale-75"
                      />
                      Hide organized
                    </Label>
                  </div>
                )}
              </div>

              {/* Content Panel */}
              <div className="flex-1 overflow-hidden">
                {libraryView === 'images' ? (
                  <LibraryPanel
                    assets={filteredAssets}
                    onExportAsset={onExportAsset}
                    onExportAll={onExportAll}
                    onRemoveAsset={onRemoveAsset}
                    onClearLibrary={onClearLibrary}
                    onUpdateAsset={onUpdateAsset}
                    tags={tags}
                    getTagsByIds={getTagsByIds}
                    onRotateAsset={onRotateAsset}
                    onMirrorAsset={onMirrorAsset}
                    onFlipAsset={onFlipAsset}
                    onDuplicateMirrored={onDuplicateMirrored}
                    onCreateTag={onCreateTag}
                    onUpdateTag={onUpdateTag}
                    onDeleteTag={onDeleteTag}
                  />
                ) : (
                  <VideoProjectsPanel 
                    projects={videoProjects} 
                    onLoadProject={onLoadVideoProject}
                    onDeleteProject={deleteVideoProject}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Projects Bar at Bottom */}
        <ProjectsBar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onRenameProject={renameProject}
          assets={assets}
          onAddImageToProject={addImageToProject}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {/* Could add a drag preview here */}
      </DragOverlay>
    </DndContext>
  );
}
