import { useState, useCallback, useEffect } from 'react';
import { Thread } from '@/types/animation';

export interface VideoProject {
  id: string;
  name: string;
  thumbnail: string;
  threads: Thread[];
  fps: number;
  frameCount: number;
  createdAt: string;
  lastModified: string;
}

const STORAGE_KEY = 'sprite-video-projects';

export function useVideoProjects() {
  const [projects, setProjects] = useState<VideoProject[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProjects(JSON.parse(stored));
    } catch (e) { console.error('Failed to load video projects:', e); }
  }, []);

  const saveToStorage = useCallback((updated: VideoProject[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProjects(updated);
    } catch (e) { console.error('Failed to save video projects:', e); }
  }, []);

  const saveProject = useCallback((name: string, threads: Thread[], fps: number, frameCount: number): VideoProject => {
    const thumbnail = threads[0]?.keyframes[0]?.imageUrl || '';
    const now = new Date().toISOString();
    const project: VideoProject = {
      id: `vp-${Date.now()}`,
      name,
      thumbnail,
      threads,
      fps,
      frameCount,
      createdAt: now,
      lastModified: now,
    };
    saveToStorage([project, ...projects]);
    return project;
  }, [projects, saveToStorage]);

  const updateProject = useCallback((id: string, threads: Thread[], fps: number) => {
    const updated = projects.map(p => p.id === id ? {
      ...p,
      threads,
      fps,
      thumbnail: threads[0]?.keyframes[0]?.imageUrl || p.thumbnail,
      lastModified: new Date().toISOString(),
    } : p);
    saveToStorage(updated);
  }, [projects, saveToStorage]);

  const deleteProject = useCallback((id: string) => {
    saveToStorage(projects.filter(p => p.id !== id));
  }, [projects, saveToStorage]);

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  return { projects, saveProject, updateProject, deleteProject, getProject };
}
