import { useState, useCallback } from 'react';
import { Tag, TagIcon } from '@/types/sprite';

const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Character', color: '#3b82f6', icon: 'user', createdAt: Date.now() },
  { id: 'tag-2', name: 'Environment', color: '#22c55e', icon: 'box', createdAt: Date.now() },
  { id: 'tag-3', name: 'UI Element', color: '#f59e0b', icon: 'star', createdAt: Date.now() },
];

const STORAGE_KEY = 'sprite-slicer-tags';

function generateId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load tags from storage:', e);
    }
    return DEFAULT_TAGS;
  });

  const saveTags = useCallback((newTags: Tag[]) => {
    setTags(newTags);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTags));
    } catch (e) {
      console.error('Failed to save tags to storage:', e);
    }
  }, []);

  const createTag = useCallback((name: string, color: string, icon: TagIcon): Tag => {
    const newTag: Tag = {
      id: generateId(),
      name: name.trim(),
      color,
      icon,
      createdAt: Date.now(),
    };
    saveTags([...tags, newTag]);
    return newTag;
  }, [tags, saveTags]);

  const updateTag = useCallback((id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => {
    saveTags(tags.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  }, [tags, saveTags]);

  const deleteTag = useCallback((id: string) => {
    saveTags(tags.filter(tag => tag.id !== id));
  }, [tags, saveTags]);

  const getTagById = useCallback((id: string): Tag | undefined => {
    return tags.find(tag => tag.id === id);
  }, [tags]);

  const getTagsByIds = useCallback((ids: string[]): Tag[] => {
    return tags.filter(tag => ids.includes(tag.id));
  }, [tags]);

  return {
    tags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagsByIds,
  };
}
