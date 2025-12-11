import { useState, useCallback } from 'react';
import { Project, Folder } from '@/types/sprite';

const STORAGE_KEY = 'sprite-slicer-projects';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const loadProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const updateProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
    saveProjects(newProjects);
  }, []);

  // Create a new project
  const createProject = useCallback((name: string): Project => {
    const now = Date.now();
    const newProject: Project = {
      id: generateId(),
      name: name.trim() || 'Untitled Project',
      folders: [],
      rootImageIds: [],
      createdAt: now,
      updatedAt: now,
    };
    updateProjects([...projects, newProject]);
    return newProject;
  }, [projects, updateProjects]);

  // Delete a project
  const deleteProject = useCallback((projectId: string) => {
    updateProjects(projects.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setSelectedFolderId(null);
    }
  }, [projects, selectedProjectId, updateProjects]);

  // Rename a project
  const renameProject = useCallback((projectId: string, newName: string) => {
    updateProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, name: newName.trim() || p.name, updatedAt: Date.now() }
        : p
    ));
  }, [projects, updateProjects]);

  // Create a folder in a project
  const createFolder = useCallback((projectId: string, name: string, parentId?: string): Folder | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    // Check max depth (2 levels)
    if (parentId) {
      const parentFolder = project.folders.find(f => f.id === parentId);
      if (parentFolder?.parentId) {
        // Parent already has a parent, can't go deeper
        return null;
      }
    }

    const newFolder: Folder = {
      id: generateId(),
      name: name.trim() || 'New Folder',
      parentId,
      imageIds: [],
      createdAt: Date.now(),
    };

    updateProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, folders: [...p.folders, newFolder], updatedAt: Date.now() }
        : p
    ));

    return newFolder;
  }, [projects, updateProjects]);

  // Delete a folder
  const deleteFolder = useCallback((projectId: string, folderId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Get all child folder IDs
    const getChildFolderIds = (parentId: string): string[] => {
      const children = project.folders.filter(f => f.parentId === parentId);
      return children.flatMap(c => [c.id, ...getChildFolderIds(c.id)]);
    };

    const folderIdsToDelete = [folderId, ...getChildFolderIds(folderId)];

    updateProjects(projects.map(p =>
      p.id === projectId
        ? { 
            ...p, 
            folders: p.folders.filter(f => !folderIdsToDelete.includes(f.id)),
            updatedAt: Date.now()
          }
        : p
    ));

    if (selectedFolderId && folderIdsToDelete.includes(selectedFolderId)) {
      setSelectedFolderId(null);
    }
  }, [projects, selectedFolderId, updateProjects]);

  // Rename a folder
  const renameFolder = useCallback((projectId: string, folderId: string, newName: string) => {
    updateProjects(projects.map(p =>
      p.id === projectId
        ? {
            ...p,
            folders: p.folders.map(f =>
              f.id === folderId
                ? { ...f, name: newName.trim() || f.name }
                : f
            ),
            updatedAt: Date.now()
          }
        : p
    ));
  }, [projects, updateProjects]);

  // Add image to project (root or folder)
  const addImageToProject = useCallback((projectId: string, imageId: string, folderId?: string) => {
    updateProjects(projects.map(p => {
      if (p.id !== projectId) return p;

      if (folderId) {
        // Add to specific folder
        return {
          ...p,
          folders: p.folders.map(f =>
            f.id === folderId && !f.imageIds.includes(imageId)
              ? { ...f, imageIds: [...f.imageIds, imageId] }
              : f
          ),
          updatedAt: Date.now()
        };
      } else {
        // Add to project root
        if (p.rootImageIds.includes(imageId)) return p;
        return {
          ...p,
          rootImageIds: [...p.rootImageIds, imageId],
          updatedAt: Date.now()
        };
      }
    }));
  }, [projects, updateProjects]);

  // Remove image from project/folder
  const removeImageFromProject = useCallback((projectId: string, imageId: string, folderId?: string) => {
    updateProjects(projects.map(p => {
      if (p.id !== projectId) return p;

      if (folderId) {
        return {
          ...p,
          folders: p.folders.map(f =>
            f.id === folderId
              ? { ...f, imageIds: f.imageIds.filter(id => id !== imageId) }
              : f
          ),
          updatedAt: Date.now()
        };
      } else {
        return {
          ...p,
          rootImageIds: p.rootImageIds.filter(id => id !== imageId),
          updatedAt: Date.now()
        };
      }
    }));
  }, [projects, updateProjects]);

  // Move image between folders/projects
  const moveImage = useCallback((
    imageId: string,
    fromProjectId: string,
    toProjectId: string,
    fromFolderId?: string,
    toFolderId?: string
  ) => {
    // Remove from source
    removeImageFromProject(fromProjectId, imageId, fromFolderId);
    // Add to destination
    addImageToProject(toProjectId, imageId, toFolderId);
  }, [removeImageFromProject, addImageToProject]);

  // Get all image IDs that are in any project
  const getOrganizedImageIds = useCallback((): Set<string> => {
    const ids = new Set<string>();
    projects.forEach(p => {
      p.rootImageIds.forEach(id => ids.add(id));
      p.folders.forEach(f => f.imageIds.forEach(id => ids.add(id)));
    });
    return ids;
  }, [projects]);

  // Set project thumbnail
  const setProjectThumbnail = useCallback((projectId: string, imageId: string) => {
    updateProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, thumbnailId: imageId, updatedAt: Date.now() }
        : p
    ));
  }, [projects, updateProjects]);

  // Get selected project
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  return {
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
    moveImage,
    getOrganizedImageIds,
    setProjectThumbnail,
  };
}
