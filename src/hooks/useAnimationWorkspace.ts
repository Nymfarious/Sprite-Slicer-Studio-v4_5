import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAnimationLoom } from './useAnimationLoom';
import { useVideoProjects, VideoProject } from './useVideoProjects';

export function useAnimationWorkspace() {
  const {
    threads, activeThreadId, currentFrame, isPlaying, fps, loop, frameCount,
    setCurrentFrame, setFps, setLoop, setActiveThreadId,
    addThread, removeThread, renameThread, toggleThreadVisibility, toggleThreadLock,
    addKeyframe, removeKeyframe, moveKeyframe, updateKeyframeTransform, updateKeyframeTween,
    clearAll, play, pause, stop, skipBack, skipForward, getCompositeFrame, loadThreads
  } = useAnimationLoom();
  
  const { saveProject: saveVideoProject } = useVideoProjects();

  const handlePlayPause = useCallback(() => { isPlaying ? pause() : play(); }, [isPlaying, play, pause]);
  const handleJumpStart = useCallback(() => setCurrentFrame(0), [setCurrentFrame]);
  const handleJumpEnd = useCallback(() => setCurrentFrame(Math.max(0, frameCount - 1)), [setCurrentFrame, frameCount]);

  const handleSaveVideoProject = useCallback(() => {
    const name = prompt('Enter project name:', `Animation ${new Date().toLocaleDateString()}`);
    if (name) {
      saveVideoProject(name, threads, fps, frameCount);
      toast.success('Project saved to Videos library');
    }
  }, [threads, fps, frameCount, saveVideoProject]);

  const handleLoadVideoProject = useCallback((project: VideoProject) => {
    loadThreads(project.threads);
    setFps(project.fps);
    toast.success(`Loaded project: ${project.name}`);
  }, [loadThreads, setFps]);

  const animationLoomProps = {
    threads, activeThreadId, currentFrame, isPlaying, fps, loop, frameCount,
    onFrameChange: setCurrentFrame, onFpsChange: setFps, onLoopChange: setLoop,
    onActiveThreadChange: setActiveThreadId, onAddThread: addThread, onRemoveThread: removeThread,
    onRenameThread: renameThread, onToggleVisibility: toggleThreadVisibility, onToggleLock: toggleThreadLock,
    onAddKeyframe: addKeyframe, onRemoveKeyframe: removeKeyframe, onMoveKeyframe: moveKeyframe,
    onUpdateKeyframeTransform: updateKeyframeTransform, onUpdateKeyframeTween: updateKeyframeTween,
    onPlay: play, onPause: pause, onStop: stop, onSkipBack: skipBack, onSkipForward: skipForward,
    onClearAll: clearAll, getCompositeFrame,
  };

  return {
    animationLoomProps,
    handlePlayPause,
    handleJumpStart,
    handleJumpEnd,
    handleSaveVideoProject,
    handleLoadVideoProject,
    skipBack,
    skipForward,
  };
}
