import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Play, Pause, Square, Trash2, SkipBack, SkipForward, Repeat,
  Eye, EyeOff, Lock, Unlock, Plus, Download, Film, FileJson, FolderArchive, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Keyframe, Thread, EasingType, Transform } from '@/types/animation';
import { toast } from 'sonner';
import { getCompositeFrameStates } from '@/lib/tweening';
import { KeyframePropertiesPopover, TweenMarker } from './KeyframePropertiesPopover';
import { KeyboardShortcutsPopover } from './KeyboardShortcutsPopover';
import { exportToGif, exportToJsonManifest, exportToZip, exportToSpriteSheet, downloadBlob } from '@/lib/animationExport';

const FRAME_WIDTH = 40;
const THREAD_HEIGHT = 64;

const IconBtn = ({ icon, onClick, disabled, variant = "outline" as const }: { icon: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "outline" | "ghost" }) => (
  <Button variant={variant} size="icon" className="h-7 w-7" onClick={onClick} disabled={disabled}>{icon}</Button>
);

const SmallIconBtn = ({ icon, onClick, stopPropagation }: { icon: React.ReactNode; onClick: () => void; stopPropagation?: boolean }) => (
  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { if (stopPropagation) e.stopPropagation(); onClick(); }}>{icon}</Button>
);

const FrameGrid = ({ count, currentFrame }: { count: number; currentFrame: number }) => (
  <div className="absolute inset-0 flex pointer-events-none">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cn("flex-shrink-0 border-r border-border/30", i === currentFrame && "bg-primary/5")} style={{ width: FRAME_WIDTH }} />
    ))}
  </div>
);

interface AnimationLoomProps {
  threads: Thread[];
  activeThreadId: string;
  currentFrame: number;
  isPlaying: boolean;
  fps: number;
  loop: boolean;
  frameCount: number;
  onFrameChange: (frame: number) => void;
  onFpsChange: (fps: number) => void;
  onLoopChange: (loop: boolean) => void;
  onActiveThreadChange: (id: string) => void;
  onAddThread: () => void;
  onRemoveThread: (id: string) => void;
  onRenameThread: (id: string, name: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onAddKeyframe: (frameIndex: number, imageId: string, imageUrl: string, threadId?: string) => void;
  onRemoveKeyframe: (frameIndex: number, threadId?: string) => void;
  onMoveKeyframe: (fromIndex: number, toIndex: number, threadId?: string) => void;
  onUpdateKeyframeTransform: (frameIndex: number, transform: Partial<Transform>, threadId?: string) => void;
  onUpdateKeyframeTween: (frameIndex: number, tweenToNext: boolean, easing?: EasingType, threadId?: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onClearAll: () => void;
  getCompositeFrame: (frameIndex: number) => Keyframe[];
}

export function AnimationLoom({
  threads, activeThreadId, currentFrame, isPlaying, fps, loop, frameCount,
  onFrameChange, onFpsChange, onLoopChange, onActiveThreadChange, onAddThread,
  onRemoveThread, onRenameThread, onToggleVisibility, onToggleLock, onAddKeyframe,
  onRemoveKeyframe, onMoveKeyframe, onUpdateKeyframeTransform, onUpdateKeyframeTween,
  onPlay, onPause, onStop, onSkipBack, onSkipForward, onClearAll, getCompositeFrame,
}: AnimationLoomProps) {
  const [dragOverThreadId, setDragOverThreadId] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ threadId: string; frameIndex: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const threadsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onFrameChange(currentFrame + 1 >= frameCount 
        ? (loop ? 0 : (onPause(), currentFrame))
        : currentFrame + 1
      );
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [isPlaying, currentFrame, frameCount, fps, loop, onFrameChange, onPause]);

  const compositePreview = useMemo(() => getCompositeFrameStates(threads, currentFrame), [threads, currentFrame]);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frame = Math.floor((e.clientX - rect.left) / FRAME_WIDTH);
    if (frame >= 0 && frame < frameCount) onFrameChange(frame);
  };

  const handleDragOver = (e: React.DragEvent, threadId: string) => {
    e.preventDefault();
    if (!threads.find(t => t.id === threadId)?.locked) setDragOverThreadId(threadId);
  };

  const handleDrop = (e: React.DragEvent, threadId: string) => {
    e.preventDefault();
    setDragOverThreadId(null);
    const thread = threads.find(t => t.id === threadId);
    if (thread?.locked) return;
    const imageId = e.dataTransfer.getData('imageId');
    const imageUrl = e.dataTransfer.getData('imageUrl');
    const threadEl = threadsRef.current.get(threadId);
    if (!imageId || !imageUrl || !threadEl) return;
    const rect = threadEl.getBoundingClientRect();
    const frameIndex = Math.max(0, Math.min(Math.floor((e.clientX - rect.left) / FRAME_WIDTH), frameCount - 1));
    onAddKeyframe(frameIndex, imageId, imageUrl, threadId);
  };

  const handleKeyframeDragStart = (e: React.DragEvent, threadId: string, frameIndex: number) => {
    if (threads.find(t => t.id === threadId)?.locked) { e.preventDefault(); return; }
    setDraggingKeyframe({ threadId, frameIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleKeyframeDropOnThread = (e: React.DragEvent, targetThreadId: string) => {
    if (!draggingKeyframe) return;
    const targetThread = threads.find(t => t.id === targetThreadId);
    if (targetThread?.locked) return;
    const threadEl = threadsRef.current.get(targetThreadId);
    if (!threadEl) return;
    const rect = threadEl.getBoundingClientRect();
    const targetFrame = Math.max(0, Math.min(Math.floor((e.clientX - rect.left) / FRAME_WIDTH), frameCount - 1));
    if (draggingKeyframe.threadId === targetThreadId) {
      onMoveKeyframe(draggingKeyframe.frameIndex, targetFrame, targetThreadId);
    } else {
      const sourceThread = threads.find(t => t.id === draggingKeyframe.threadId);
      const keyframe = sourceThread?.keyframes.find(k => k.frameIndex === draggingKeyframe.frameIndex);
      if (keyframe) {
        onRemoveKeyframe(draggingKeyframe.frameIndex, draggingKeyframe.threadId);
        onAddKeyframe(targetFrame, keyframe.imageId, keyframe.imageUrl, targetThreadId);
      }
    }
    setDraggingKeyframe(null);
    setDragOverThreadId(null);
  };

  const handleThreadNameDoubleClick = (thread: Thread) => {
    if (!thread.locked) { setEditingThreadId(thread.id); setEditingName(thread.name); }
  };

  const handleThreadNameBlur = () => {
    if (editingThreadId && editingName.trim()) onRenameThread(editingThreadId, editingName.trim());
    setEditingThreadId(null);
    setEditingName('');
  };

  const handleThreadNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleThreadNameBlur();
    else if (e.key === 'Escape') { setEditingThreadId(null); setEditingName(''); }
  };

  const handleExportGif = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await exportToGif(threads, frameCount, fps, 256, 256, setExportProgress);
      downloadBlob(blob, 'animation.gif');
      toast.success('GIF exported!');
    } catch (error) {
      toast.error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally { setIsExporting(false); }
  }, [threads, fps, frameCount]);

  const handleExportSpriteSheet = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const result = await exportToSpriteSheet(threads, frameCount, 128, 128, setExportProgress);
      downloadBlob(result.blob, `spritesheet-${result.frameCount}frames.png`);
      toast.success(`Exported ${result.frameCount} frames as sprite sheet!`);
    } catch (error) {
      toast.error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally { setIsExporting(false); }
  }, [threads, frameCount]);

  const handleExportJson = useCallback(() => {
    const json = exportToJsonManifest(threads, frameCount, fps);
    downloadBlob(new Blob([json], { type: 'application/json' }), 'animation.json');
    toast.success('JSON manifest exported!');
  }, [threads, frameCount, fps]);

  const handleExportZip = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await exportToZip(threads, frameCount, fps, 256, 256, setExportProgress);
      downloadBlob(blob, 'animation-frames.zip');
      toast.success('Frame folder exported!');
    } catch (error) {
      toast.error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally { setIsExporting(false); }
  }, [threads, frameCount, fps]);

  const totalKeyframes = threads.reduce((sum, t) => sum + t.keyframes.length, 0);

  return (
    <div className="bg-background h-full flex flex-col min-h-0 overflow-hidden">
      {/* Sticky header section */}
      <div className="sticky top-0 z-10 bg-background flex-shrink-0">
        <div className="px-3 py-1.5 flex items-center gap-2 border-b bg-muted/30">
          <span className="text-sm font-medium">Animation Loom</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {threads.length} layer{threads.length !== 1 ? 's' : ''} • {totalKeyframes} keyframe{totalKeyframes !== 1 ? 's' : ''} • Frame {currentFrame + 1} • {fps} FPS
          </span>
        </div>

        <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <IconBtn icon={<SkipBack className="h-4 w-4" />} onClick={onSkipBack} disabled={currentFrame === 0} />
          <IconBtn icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} onClick={isPlaying ? onPause : onPlay} />
          <IconBtn icon={<Square className="h-4 w-4" />} onClick={onStop} />
          <IconBtn icon={<SkipForward className="h-4 w-4" />} onClick={onSkipForward} disabled={currentFrame === frameCount - 1} />
        </div>
        <div className="h-4 w-px bg-border" />
        <Button variant={loop ? "default" : "outline"} size="icon" className="h-7 w-7" onClick={() => onLoopChange(!loop)} title={loop ? "Loop on" : "Loop off"}><Repeat className="h-4 w-4" /></Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">FPS:</span>
          <Slider value={[fps]} onValueChange={([v]) => onFpsChange(v)} min={1} max={60} step={1} className="w-20" />
          <span className="text-xs font-mono w-6">{fps}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1" disabled={isExporting || totalKeyframes === 0}>
              {isExporting ? <><Loader2 className="h-3 w-3 animate-spin" /><span className="text-xs">{Math.round(exportProgress * 100)}%</span></> : <><Download className="h-3 w-3" /><span className="text-xs">Export</span></>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportGif}><Film className="h-4 w-4 mr-2" />Export as GIF</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportSpriteSheet}><Film className="h-4 w-4 mr-2" />Export Sprite Sheet</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJson}><FileJson className="h-4 w-4 mr-2" />Export JSON Manifest</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportZip}><FolderArchive className="h-4 w-4 mr-2" />Export Frame Folder (ZIP)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="h-4 w-px bg-border" />
        <IconBtn icon={<Trash2 className="h-4 w-4" />} onClick={onClearAll} disabled={totalKeyframes === 0} variant="ghost" />
        <div className="h-4 w-px bg-border" />
        <KeyboardShortcutsPopover variant="animation" />
        <span className="text-xs text-muted-foreground ml-auto">Drag sprites • Drag keyframes to reposition • Right-click to delete</span>
        </div>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin overflow-auto">
        <div className="flex min-h-0">
          <div className="w-40 border-r bg-muted/20 p-2 flex flex-col shrink-0">
            <span className="text-xs text-muted-foreground mb-2">Weave Preview</span>
            <div className="flex-1 bg-secondary/50 rounded flex items-center justify-center overflow-hidden relative min-h-[120px]">
              {compositePreview.length > 0 ? compositePreview.map((state, i) => (
                <img key={state.threadId} src={state.imageUrl} alt={`Layer ${i + 1}`}
                  className="absolute max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated', zIndex: i,
                    transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale * state.transform.scaleX}, ${state.transform.scale * state.transform.scaleY}) rotate(${state.transform.rotation}deg)`,
                    opacity: state.transform.opacity }} />
              )) : <span className="text-muted-foreground text-xs text-center px-2">No frame</span>}
            </div>
            <span className="text-[10px] text-muted-foreground text-center mt-1">Frame {currentFrame + 1} • {compositePreview.length} layer{compositePreview.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex flex-1 min-h-0">
            <div className="w-36 border-r bg-muted/20 flex flex-col flex-shrink-0">
              <div className="h-6 border-b" />
              {threads.map(thread => (
                <div key={thread.id} className={cn("flex items-center gap-1 px-2 border-b cursor-pointer", activeThreadId === thread.id && "bg-accent/50")} style={{ height: THREAD_HEIGHT }} onClick={() => onActiveThreadChange(thread.id)}>
                  <SmallIconBtn icon={thread.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />} onClick={() => onToggleVisibility(thread.id)} stopPropagation />
                  <SmallIconBtn icon={thread.locked ? <Lock className="h-3 w-3 text-destructive" /> : <Unlock className="h-3 w-3 text-muted-foreground" />} onClick={() => onToggleLock(thread.id)} stopPropagation />
                  {editingThreadId === thread.id ? (
                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={handleThreadNameBlur} onKeyDown={handleThreadNameKeyDown} className="h-5 text-xs flex-1" autoFocus />
                  ) : (
                    <span className="text-xs truncate flex-1" onDoubleClick={() => handleThreadNameDoubleClick(thread)}>{thread.name}</span>
                  )}
                  {threads.length > 1 && <SmallIconBtn icon={<Trash2 className="h-3 w-3" />} onClick={() => onRemoveThread(thread.id)} stopPropagation />}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="h-8 justify-start gap-1 m-1" onClick={onAddThread}><Plus className="h-3 w-3" /><span className="text-xs">Add Layer</span></Button>
            </div>

            <ScrollArea className="flex-1 scrollbar-thin">
              <div className="relative" style={{ width: frameCount * FRAME_WIDTH }}>
                <div className="flex border-b cursor-pointer select-none h-6" onClick={handleRulerClick}>
                  {Array.from({ length: frameCount }).map((_, i) => (
                    <div key={i} className={cn("flex-shrink-0 text-xs text-center border-r flex items-center justify-center", i === currentFrame ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground")} style={{ width: FRAME_WIDTH }}>{i + 1}</div>
                  ))}
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none" style={{ left: currentFrame * FRAME_WIDTH + FRAME_WIDTH / 2 }}>
                  <div className="w-2 h-2 bg-primary rounded-full -translate-x-[3px] -translate-y-1" />
                </div>
                {threads.map(thread => (
                  <div key={thread.id}
                    ref={(el) => { if (el) threadsRef.current.set(thread.id, el); else threadsRef.current.delete(thread.id); }}
                    className={cn("relative border-b", dragOverThreadId === thread.id && !thread.locked && "bg-primary/10", activeThreadId === thread.id && "bg-accent/30", thread.locked && "opacity-50")}
                    style={{ height: THREAD_HEIGHT }}
                    onDragOver={(e) => handleDragOver(e, thread.id)}
                    onDragLeave={() => setDragOverThreadId(null)}
                    onDrop={(e) => { if (draggingKeyframe) handleKeyframeDropOnThread(e, thread.id); else handleDrop(e, thread.id); }}>
                    <FrameGrid count={frameCount} currentFrame={currentFrame} />
                    {thread.keyframes.map((keyframe, i) => {
                      const nextKeyframe = thread.keyframes[i + 1];
                      if (!nextKeyframe || !keyframe.tweenToNext) return null;
                      return <TweenMarker key={`tween-${keyframe.id}`} startFrame={keyframe.frameIndex} endFrame={nextKeyframe.frameIndex} frameWidth={FRAME_WIDTH} easing={keyframe.easing} />;
                    })}
                    {thread.keyframes.map(keyframe => (
                      <KeyframePropertiesPopover key={`${thread.id}-${keyframe.frameIndex}`} keyframe={keyframe}
                        onUpdateTransform={(transform) => onUpdateKeyframeTransform(keyframe.frameIndex, transform, thread.id)}
                        onUpdateTween={(tweenToNext, easing) => onUpdateKeyframeTween(keyframe.frameIndex, tweenToNext, easing, thread.id)}
                        onDelete={() => onRemoveKeyframe(keyframe.frameIndex, thread.id)}>
                        <div className={cn("absolute top-1 bottom-1 rounded border-2 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50",
                            activeThreadId === thread.id ? "border-primary" : "border-border", thread.locked && "cursor-not-allowed", keyframe.tweenToNext && "ring-1 ring-primary/30")}
                          style={{ left: keyframe.frameIndex * FRAME_WIDTH + 2, width: FRAME_WIDTH - 4 }}
                          draggable={!thread.locked}
                          onDragStart={(e) => handleKeyframeDragStart(e, thread.id, keyframe.frameIndex)}
                          onDragEnd={() => setDraggingKeyframe(null)}
                          onContextMenu={(e) => { e.preventDefault(); if (!thread.locked) onRemoveKeyframe(keyframe.frameIndex, thread.id); }}>
                          <img src={keyframe.imageUrl} alt="" className="w-full h-full object-contain bg-secondary/50" style={{ imageRendering: 'pixelated' }} />
                        </div>
                      </KeyframePropertiesPopover>
                    ))}
                    {thread.keyframes.length === 0 && !thread.locked && <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Drop sprites here to weave</div>}
                    {thread.locked && <div className="absolute inset-0 flex items-center justify-center bg-background/50"><Lock className="h-4 w-4 text-muted-foreground" /></div>}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-muted/20" />
            </ScrollArea>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
