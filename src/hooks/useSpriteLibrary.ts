import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { SpriteAsset } from '@/types/sprite';
import { exportImage, ExportFormat } from '@/lib/imageExport';
import { rotateImage90CW, mirrorImageHorizontal, flipImageVertical } from '@/lib/imageTransforms';

const LIBRARY_KEY = 'sprite-slicer-library';

interface ExportPreferences {
  exportFormat: ExportFormat;
  exportQuality: number;
}

export function useSpriteLibrary() {
  const [assets, setAssets] = useLocalStorage<SpriteAsset[]>(LIBRARY_KEY, []);

  const addAsset = useCallback((asset: Omit<SpriteAsset, 'id' | 'createdAt'>) => {
    const newAsset: SpriteAsset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setAssets(prev => [newAsset, ...prev]);
    return newAsset;
  }, [setAssets]);

  const addMultipleAssets = useCallback((newAssets: Omit<SpriteAsset, 'id' | 'createdAt'>[]) => {
    const assetsWithIds: SpriteAsset[] = newAssets.map((asset, index) => ({
      ...asset,
      id: `asset-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    }));
    setAssets(prev => [...assetsWithIds, ...prev]);
    return assetsWithIds;
  }, [setAssets]);

  const removeAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  }, [setAssets]);

  const updateAsset = useCallback((id: string, updates: Partial<SpriteAsset>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  }, [setAssets]);

  const clearLibrary = useCallback(() => {
    setAssets([]);
  }, [setAssets]);

  const exportAsset = useCallback(async (
    asset: SpriteAsset, 
    preferences?: ExportPreferences
  ) => {
    const format = preferences?.exportFormat || 'png';
    const quality = preferences?.exportQuality || 92;
    
    await exportImage(asset.imageData, {
      format,
      quality,
      filename: asset.name,
    });
  }, []);

  const exportAllAssets = useCallback(async (preferences?: ExportPreferences) => {
    for (let i = 0; i < assets.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      await exportAsset(assets[i], preferences);
    }
  }, [assets, exportAsset]);

  // Transform functions for library assets
  const rotateAsset = useCallback(async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    const newImageData = await rotateImage90CW(asset.imageData);
    // Swap width/height after 90° rotation
    const newWidth = asset.coordinates.height;
    const newHeight = asset.coordinates.width;
    
    setAssets(prev => prev.map(a => 
      a.id === id 
        ? { 
            ...a, 
            imageData: newImageData,
            coordinates: { ...a.coordinates, width: newWidth, height: newHeight }
          } 
        : a
    ));
  }, [assets, setAssets]);

  const mirrorAsset = useCallback(async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    const newImageData = await mirrorImageHorizontal(asset.imageData);
    setAssets(prev => prev.map(a => 
      a.id === id ? { ...a, imageData: newImageData } : a
    ));
  }, [assets, setAssets]);

  const flipAsset = useCallback(async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    const newImageData = await flipImageVertical(asset.imageData);
    setAssets(prev => prev.map(a => 
      a.id === id ? { ...a, imageData: newImageData } : a
    ));
  }, [assets, setAssets]);

  const duplicateMirrored = useCallback(async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    const mirroredImageData = await mirrorImageHorizontal(asset.imageData);
    const newAsset: SpriteAsset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${asset.name}_mirrored`,
      imageData: mirroredImageData,
      createdAt: Date.now(),
    };
    setAssets(prev => [newAsset, ...prev]);
  }, [assets, setAssets]);

  return {
    assets,
    addAsset,
    addMultipleAssets,
    removeAsset,
    updateAsset,
    clearLibrary,
    exportAsset,
    exportAllAssets,
    rotateAsset,
    mirrorAsset,
    flipAsset,
    duplicateMirrored,
  };
}
