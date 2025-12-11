import { useState, useCallback } from 'react';
import { 
  Keyframe, 
  Thread, 
  EasingType,
  createKeyframe, 
  migrateThread,
  DEFAULT_TRANSFORM 
} from '@/types/animation';

export type { Keyframe, Thread, EasingType };
export { DEFAULT_TRANSFORM };

export interface UseAnimationLoomReturn {
  threads: Thread[];
  activeThreadId: string;
  currentFrame: number;
  isPlaying: boolean;
  fps: number;
  loop: boolean;
  frameCount: number;
  setCurrentFrame: (frame: number) => void;
  setFps: (fps: number) => void;
  setLoop: (loop: boolean) => void;
  setActiveThreadId: (id: string) => void;
  addThread: () => void;
  removeThread: (id: string) => void;
  renameThread: (id: string, name: string) => void;
  toggleThreadVisibility: (id: string) => void;
  toggleThreadLock: (id: string) => void;
  addKeyframe: (frameIndex: number, imageId: string, imageUrl: string, threadId?: string) => void;
  removeKeyframe: (frameIndex: number, threadId?: string) => void;
  moveKeyframe: (fromIndex: number, toIndex: number, threadId?: string) => void;
  updateKeyframeTransform: (frameIndex: number, transform: Partial<Keyframe['transform']>, threadId?: string) => void;
  updateKeyframeTween: (frameIndex: number, tweenToNext: boolean, easing?: EasingType, threadId?: string) => void;
  clearThread: (threadId?: string) => void;
  clearAll: () => void;
  loadThreads: (newThreads: Thread[]) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipBack: () => void;
  skipForward: () => void;
  getCurrentKeyframe: (threadId?: string) => Keyframe | undefined;
  getCompositeFrame: (frameIndex: number) => Keyframe[];
  getActiveThread: () => Thread | undefined;
}

const DEFAULT_FRAME_COUNT = 60;

const createThread = (id: string, name: string): Thread => ({
  id,
  name,
  visible: true,
  locked: false,
  keyframes: [],
});

export function useAnimationLoom(): UseAnimationLoomReturn {
  const [threads, setThreads] = useState<Thread[]>([
    createThread('thread-1', 'Thread 1')
  ]);
  const [activeThreadId, setActiveThreadId] = useState('thread-1');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [loop, setLoop] = useState(true);
  const frameCount = DEFAULT_FRAME_COUNT;

  // Get active thread
  const getActiveThread = useCallback(() => {
    return threads.find(t => t.id === activeThreadId);
  }, [threads, activeThreadId]);

  const addThread = useCallback(() => {
    const newId = `thread-${Date.now()}`;
    const newName = `Thread ${threads.length + 1}`;
    setThreads(prev => [...prev, createThread(newId, newName)]);
    setActiveThreadId(newId);
  }, [threads.length]);

  const removeThread = useCallback((id: string) => {
    setThreads(prev => {
      if (prev.length <= 1) return prev; // Keep at least one thread
      const newThreads = prev.filter(t => t.id !== id);
      if (activeThreadId === id) {
        setActiveThreadId(newThreads[0].id);
      }
      return newThreads;
    });
  }, [activeThreadId]);

  const renameThread = useCallback((id: string, name: string) => {
    setThreads(prev => prev.map(t => 
      t.id === id ? { ...t, name } : t
    ));
  }, []);

  const toggleThreadVisibility = useCallback((id: string) => {
    setThreads(prev => prev.map(t => 
      t.id === id ? { ...t, visible: !t.visible } : t
    ));
  }, []);

  const toggleThreadLock = useCallback((id: string) => {
    setThreads(prev => prev.map(t => 
      t.id === id ? { ...t, locked: !t.locked } : t
    ));
  }, []);

  const addKeyframe = useCallback((frameIndex: number, imageId: string, imageUrl: string, threadId?: string) => {
    const targetId = threadId || activeThreadId;
    setThreads(prev => prev.map(t => {
      if (t.id !== targetId) return t;
      if (t.locked) return t; // Don't modify locked threads
      const filtered = t.keyframes.filter(k => k.frameIndex !== frameIndex);
      const newKeyframe = createKeyframe(frameIndex, imageId, imageUrl);
      return {
        ...t,
        keyframes: [...filtered, newKeyframe].sort((a, b) => a.frameIndex - b.frameIndex)
      };
    }));
  }, [activeThreadId]);

  const removeKeyframe = useCallback((frameIndex: number, threadId?: string) => {
    const targetId = threadId || activeThreadId;
    setThreads(prev => prev.map(t => {
      if (t.id !== targetId) return t;
      if (t.locked) return t;
      return {
        ...t,
        keyframes: t.keyframes.filter(k => k.frameIndex !== frameIndex)
      };
    }));
  }, [activeThreadId]);

  const moveKeyframe = useCallback((fromIndex: number, toIndex: number, threadId?: string) => {
    const targetId = threadId || activeThreadId;
    setThreads(prev => prev.map(t => {
      if (t.id !== targetId) return t;
      if (t.locked) return t;
      const keyframe = t.keyframes.find(k => k.frameIndex === fromIndex);
      if (!keyframe) return t;
      const filtered = t.keyframes.filter(k => k.frameIndex !== fromIndex);
      return {
        ...t,
        keyframes: [...filtered, { ...keyframe, frameIndex: toIndex }].sort((a, b) => a.frameIndex - b.frameIndex)
      };
    }));
  }, [activeThreadId]);

  const updateKeyframeTransform = useCallback((
    frameIndex: number, 
    transform: Partial<Keyframe['transform']>, 
    threadId?: string
  ) => {
    const targetId = threadId || activeThreadId;
    setThreads(prev => prev.map(t => {
      if (t.id !== targetId) return t;
      if (t.locked) return t;
      return {
        ...t,
        keyframes: t.keyframes.map(k => 
          k.frameIndex === frameIndex 
            ? { ...k, transform: { ...k.transform, ...transform } }
            : k
        )
      };
    }));
  }, [activeThreadId]);

  const updateKeyframeTween = useCallback((
    frameIndex: number, 
    tweenToNext: boolean, 
    easing?: EasingType,
    threadId?: string
  ) => {
    const targetId = threadId || activeThreadId;
    setThreads(prev => prev.map(t => {
      if (t.id !== targetId) return t;
      if (t.locked) return t;
      return {
        ...t,
        keyframes: t.keyframes.map(k => 
          k.frameIndex === frameIndex 
            ? { ...k, tweenToNext, easing: easing || k.easing }
            : k
        )
      };
    }));
  }, [activeThreadId]);

  const clearThread = useCallback((threadId?: string) => {
    const targetId = threadId || activeThreadId;
    setThreads(prev => prev.map(t => 
      t.id === targetId ? { ...t, keyframes: [] } : t
    ));
  }, [activeThreadId]);

  const clearAll = useCallback(() => {
    setThreads([createThread('thread-1', 'Thread 1')]);
    setActiveThreadId('thread-1');
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  const loadThreads = useCallback((newThreads: Thread[]) => {
    if (newThreads.length === 0) return;
    setThreads(newThreads.map(migrateThread));
    setActiveThreadId(newThreads[0].id);
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
  }, []);

  const skipBack = useCallback(() => {
    setCurrentFrame(prev => Math.max(0, prev - 1));
  }, []);

  const skipForward = useCallback(() => {
    setCurrentFrame(prev => Math.min(frameCount - 1, prev + 1));
  }, [frameCount]);

  const getCurrentKeyframe = useCallback((threadId?: string) => {
    const targetId = threadId || activeThreadId;
    const targetThread = threads.find(t => t.id === targetId);
    if (!targetThread) return undefined;
    return [...targetThread.keyframes].reverse().find(k => k.frameIndex <= currentFrame);
  }, [threads, activeThreadId, currentFrame]);

  // Get composite frame from all visible threads (bottom-to-top layering)
  const getCompositeFrame = useCallback((frameIndex: number) => {
    return threads
      .filter(t => t.visible)
      .map(thread => {
        const keyframe = [...thread.keyframes].reverse().find(k => k.frameIndex <= frameIndex);
        return keyframe;
      })
      .filter((k): k is Keyframe => k !== undefined);
  }, [threads]);

  return {
    threads,
    activeThreadId,
    currentFrame,
    isPlaying,
    fps,
    loop,
    frameCount,
    setCurrentFrame,
    setFps,
    setLoop,
    setActiveThreadId,
    addThread,
    removeThread,
    renameThread,
    toggleThreadVisibility,
    toggleThreadLock,
    addKeyframe,
    removeKeyframe,
    moveKeyframe,
    updateKeyframeTransform,
    updateKeyframeTween,
    clearThread,
    clearAll,
    loadThreads,
    play,
    pause,
    stop,
    skipBack,
    skipForward,
    getCurrentKeyframe,
    getCompositeFrame,
    getActiveThread,
  };
}