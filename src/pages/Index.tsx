import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { EditorPanel } from '@/components/EditorPanel';
import { LibraryWithProjects } from '@/components/LibraryWithProjects';
import { PreferencesPanel } from '@/components/PreferencesPanel';
import { FlowchartPanel } from '@/components/FlowchartPanel';
import { AuthModal } from '@/components/AuthModal';
import { ResizableDrawer } from '@/components/ResizableDrawer';
import { SpriteHelper } from '@/components/SpriteHelper';
import { AnimationLoom } from '@/components/AnimationLoom';
import { MendingLoomView } from '@/components/MendingLoomView';
import { WorkspaceToggle } from '@/components/WorkspaceToggle';
import { ResizableBottomPanel } from '@/components/ResizableBottomPanel';
import { TagManagerDialog } from '@/components/TagManagerDialog';

import { ErrorLogProvider, useErrorLogContext } from '@/contexts/ErrorLogContext';
import { useSpriteLibrary } from '@/hooks/useSpriteLibrary';
import { useTags } from '@/hooks/useTags';
import { useTheme } from '@/hooks/useTheme';
import { useLocalStorage, useSessionRecovery } from '@/hooks/useLocalStorage';
import { useAnimationWorkspace } from '@/hooks/useAnimationWorkspace';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AppPreferences, SpriteAsset } from '@/types/sprite';

const defaultPreferences: AppPreferences = {
  autoSave: true,
  gridColor: '#2dd4bf',
  exportFormat: 'png',
  exportQuality: 90,
  sliceBackground: 'transparent',
  tags: [],
  theme: 'cyber',
};

const handleFlowchartNavigate = (target: string, openPreferences: () => void) => {
  switch (target) {
    case 'upload': case 'preview': case 'slice': case 'grid': case 'freeform':
      toast.info('Navigate to Splicing Mat to access this feature'); break;
    case 'library': case 'tags': case 'projects': case 'export': case 'enhance':
      toast.info('Check the Library panel on the right'); break;
    case 'preferences': openPreferences(); break;
  }
};

const Index = () => {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [preferences, setPreferences] = useLocalStorage<AppPreferences>('sprite-slicer-preferences', defaultPreferences);
  const [activeWorkspace, setActiveWorkspace] = useLocalStorage<string>('workspace-tab', 'splicing');

  const { assets, addAsset, addMultipleAssets, removeAsset, updateAsset, exportAsset, exportAllAssets, clearLibrary, rotateAsset, mirrorAsset, flipAsset, duplicateMirrored } = useSpriteLibrary();
  const { tags, createTag, updateTag, deleteTag, getTagsByIds } = useTags();
  const { animationLoomProps, handlePlayPause, handleJumpStart, handleJumpEnd, handleSaveVideoProject, handleLoadVideoProject, skipBack, skipForward } = useAnimationWorkspace();

  useTheme(preferences.theme || 'cyber');
  const isRecovered = useSessionRecovery();

  // Calculate tag usage stats
  const tagUsageStats = useMemo(() => {
    const stats: Record<string, number> = {};
    tags.forEach(tag => { stats[tag.id] = 0; });
    assets.forEach(asset => {
      (asset.tags || []).forEach(tagId => {
        if (stats[tagId] !== undefined) stats[tagId]++;
      });
    });
    return stats;
  }, [assets, tags]);

  useEffect(() => {
    if (isRecovered && assets.length > 0) {
      toast.success('Session restored', { description: `${assets.length} asset${assets.length > 1 ? 's' : ''} loaded from library` });
    }
  }, [isRecovered]);

  const handleSliceComplete = (newAssets: Omit<SpriteAsset, 'id' | 'createdAt'>[]) => addMultipleAssets(newAssets);

  const handleAddGeneratedAsset = (imageUrl: string, name: string) => {
    addAsset({
      name,
      imageData: imageUrl,
      coordinates: { x: 0, y: 0, width: 256, height: 256 },
      sourceSheet: { filename: 'AI Generated', originalWidth: 256, originalHeight: 256 },
      tags: ['ai-generated'],
      enhanced: true,
      enhancementPrompt: 'AI generated sprite',
    });
    toast.success('AI-generated pose added to library');
  };

  const handleUploadGeneratedSheet = (imageUrl: string) => {
    toast.info('Sprite sheet generated! Right-click to save and then upload to the editor for slicing.', { duration: 5000 });
    window.open(imageUrl, '_blank');
  };

  const handlePreferencesChange = (updates: Partial<AppPreferences>) => setPreferences(prev => ({ ...prev, ...updates }));

  useKeyboardShortcuts({ onPlayPause: handlePlayPause, onPrevFrame: skipBack, onNextFrame: skipForward, onJumpStart: handleJumpStart, onJumpEnd: handleJumpEnd });

  const handleHomeClick = () => {
    setActiveWorkspace('splicing');
    // Trigger scroll to import area or show import UI
    document.getElementById('main-image-upload')?.click();
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header onOpenPreferences={() => setIsPreferencesOpen(true)} onOpenFlowchart={() => setIsFlowchartOpen(true)} onHomeClick={handleHomeClick} />
      <main className="flex-1 overflow-hidden flex min-h-0">
        <div className="flex-1 overflow-hidden flex flex-col p-2">
          <WorkspaceToggle
            splicingMatContent={<EditorPanel onSliceComplete={handleSliceComplete} sliceBackground={preferences.sliceBackground || 'transparent'} activeWorkspace={activeWorkspace} onWorkspaceChange={setActiveWorkspace} tags={tags} />}
            mendingLoomContent={<MendingLoomView {...animationLoomProps} onSaveProject={handleSaveVideoProject} />}
            activeTab={activeWorkspace}
            onTabChange={setActiveWorkspace}
          />
        </div>
        <ResizableDrawer defaultWidth={25} minWidth={20} maxWidth={75} side="right">
          <LibraryWithProjects assets={assets} onExportAsset={exportAsset} onExportAll={exportAllAssets} onRemoveAsset={removeAsset} onClearLibrary={clearLibrary} onUpdateAsset={updateAsset} tags={tags} getTagsByIds={getTagsByIds} onRotateAsset={rotateAsset} onMirrorAsset={mirrorAsset} onFlipAsset={flipAsset} onDuplicateMirrored={duplicateMirrored} onAddGeneratedAsset={handleAddGeneratedAsset} onUploadGeneratedSheet={handleUploadGeneratedSheet} onLoadVideoProject={handleLoadVideoProject} onCreateTag={createTag} onUpdateTag={updateTag} onDeleteTag={deleteTag} />
        </ResizableDrawer>
      </main>
      {activeWorkspace === 'splicing' && (
        <ResizableBottomPanel defaultHeight={220} minHeight={100} maxHeight={500} storageKey="animation-loom-height">
          <AnimationLoom {...animationLoomProps} />
        </ResizableBottomPanel>
      )}
      <PreferencesPanel isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} preferences={preferences} onPreferencesChange={handlePreferencesChange} onOpenAuth={() => { setIsPreferencesOpen(false); setIsAuthOpen(true); }} tags={tags} onCreateTag={createTag} onUpdateTag={updateTag} onDeleteTag={deleteTag} onOpenTagManager={() => setIsTagManagerOpen(true)} tagUsageStats={tagUsageStats} />
      <TagManagerDialog isOpen={isTagManagerOpen} onClose={() => setIsTagManagerOpen(false)} tags={tags} onCreateTag={createTag} onUpdateTag={updateTag} onDeleteTag={deleteTag} />
      <FlowchartPanel isOpen={isFlowchartOpen} onClose={() => setIsFlowchartOpen(false)} onNavigate={(target) => { setIsFlowchartOpen(false); handleFlowchartNavigate(target, () => setIsPreferencesOpen(true)); }} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

function IndexWithSpriteHelper() {
  const { spriteMessage, spriteVisible, dismissSprite } = useErrorLogContext();
  return (
    <>
      <Index />
      <SpriteHelper message={spriteMessage} isVisible={spriteVisible} onDismiss={dismissSprite} />
    </>
  );
}

export default function IndexPage() {
  return (
    <ErrorLogProvider>
      <IndexWithSpriteHelper />
    </ErrorLogProvider>
  );
}