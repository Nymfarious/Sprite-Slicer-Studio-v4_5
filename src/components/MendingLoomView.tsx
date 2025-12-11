import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, Pause, Square, SkipBack, SkipForward, Repeat, 
  Plus, Eye, EyeOff, Lock, Unlock, Trash2, Layers, Save
} from 'lucide-react';
import { Thread, Keyframe, EasingType, Transform } from '@/types/animation';
import { getCompositeFrameStates } from '@/lib/tweening';

const FRAME_WIDTH = 32;

interface MendingLoomViewProps {
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
  onSaveProject?: () => void;
  getCompositeFrame: (frameIndex: number) => Keyframe[];
}

export function MendingLoomView({
  threads,
  activeThreadId,
  currentFrame,
  isPlaying,
  fps,
  loop,
  frameCount,
  onFrameChange,
  onFpsChange,
  onLoopChange,
  onActiveThreadChange,
  onAddThread,
  onRemoveThread,
  onToggleVisibility,
  onToggleLock,
  onUpdateKeyframeTransform,
  onUpdateKeyframeTween,
  onPlay,
  onPause,
  onStop,
  onSkipBack,
  onSkipForward,
  onSaveProject,
  getCompositeFrame,
}: MendingLoomViewProps) {
  const [onionSkinning, setOnionSkinning] = useState(false);
  const [onionFrames, setOnionFrames] = useState(2);

  const currentComposite = useMemo(() => getCompositeFrameStates(threads, currentFrame), [threads, currentFrame]);
  const prevComposite = useMemo(() => onionSkinning && currentFrame > 0 
    ? getCompositeFrameStates(threads, currentFrame - 1) : [], [threads, currentFrame, onionSkinning]);
  const nextComposite = useMemo(() => onionSkinning && currentFrame < frameCount - 1 
    ? getCompositeFrameStates(threads, currentFrame + 1) : [], [threads, currentFrame, frameCount, onionSkinning]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const selectedKeyframe = activeThread?.keyframes.find(kf => kf.frameIndex === currentFrame);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main content area */}
      <div className="flex-1 flex min-h-0 gap-4 p-4">
        {/* Large Preview */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg border border-border overflow-hidden">
          <div className="relative w-full max-w-lg aspect-square bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] rounded">
            {/* Previous frame onion skin */}
            {prevComposite.map((state, index) => (
              <img
                key={`prev-${state.imageId}-${index}`}
                src={state.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale * state.transform.scaleX}, ${state.transform.scale * state.transform.scaleY}) rotate(${state.transform.rotation}deg)`,
                  opacity: 0.3,
                  zIndex: index,
                  filter: 'sepia(1) saturate(5) hue-rotate(180deg)',
                }}
              />
            ))}
            {/* Next frame onion skin */}
            {nextComposite.map((state, index) => (
              <img
                key={`next-${state.imageId}-${index}`}
                src={state.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale * state.transform.scaleX}, ${state.transform.scale * state.transform.scaleY}) rotate(${state.transform.rotation}deg)`,
                  opacity: 0.3,
                  zIndex: index + 10,
                  filter: 'sepia(1) saturate(5) hue-rotate(90deg)',
                }}
              />
            ))}
            {/* Current frame */}
            {currentComposite.map((state, index) => (
              <img
                key={`${state.imageId}-${index}`}
                src={state.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale * state.transform.scaleX}, ${state.transform.scale * state.transform.scaleY}) rotate(${state.transform.rotation}deg)`,
                  opacity: state.transform.opacity,
                  zIndex: index + 20,
                }}
              />
            ))}
            {currentComposite.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No frames at position {currentFrame}
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-medium text-sm">Transform</h3>
            {selectedKeyframe ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      value={selectedKeyframe.transform.x}
                      onChange={(e) => onUpdateKeyframeTransform(currentFrame, { x: Number(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      value={selectedKeyframe.transform.y}
                      onChange={(e) => onUpdateKeyframeTransform(currentFrame, { y: Number(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Scale: {selectedKeyframe.transform.scale.toFixed(2)}</Label>
                  <Slider
                    value={[selectedKeyframe.transform.scale]}
                    min={0.1}
                    max={3}
                    step={0.01}
                    onValueChange={([v]) => onUpdateKeyframeTransform(currentFrame, { scale: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Rotation: {selectedKeyframe.transform.rotation}°</Label>
                  <Slider
                    value={[selectedKeyframe.transform.rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={([v]) => onUpdateKeyframeTransform(currentFrame, { rotation: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Opacity: {(selectedKeyframe.transform.opacity * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[selectedKeyframe.transform.opacity]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([v]) => onUpdateKeyframeTransform(currentFrame, { opacity: v })}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a keyframe to edit</p>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-medium text-sm">Timing</h3>
            {selectedKeyframe ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Easing</Label>
                  <Select
                    value={selectedKeyframe.easing}
                    onValueChange={(v) => onUpdateKeyframeTween(currentFrame, selectedKeyframe.tweenToNext, v as EasingType)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="ease-in">Ease In</SelectItem>
                      <SelectItem value="ease-out">Ease Out</SelectItem>
                      <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                      <SelectItem value="elastic">Elastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a keyframe to edit</p>
            )}
          </div>

          {/* Onion Skinning */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" /> Onion Skin
              </h3>
              <Switch checked={onionSkinning} onCheckedChange={setOnionSkinning} />
            </div>
            {onionSkinning && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400" /> Previous
                  <span className="w-3 h-3 rounded-full bg-green-400 ml-2" /> Next
                </div>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Playback</h3>
              {onSaveProject && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onSaveProject} title="Save Project">
                  <Save className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkipBack}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={isPlaying ? onPause : onPlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStop}>
                <Square className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkipForward}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("h-8 w-8", loop && "text-primary")} onClick={() => onLoopChange(!loop)}>
                <Repeat className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">FPS:</Label>
              <Input type="number" value={fps} onChange={(e) => onFpsChange(Math.max(1, Math.min(60, Number(e.target.value))))} className="h-7 w-16" min={1} max={60} />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline at bottom */}
      <div className="shrink-0 border-t border-border bg-card/50">
        <div className="p-2 space-y-1">
          {/* Frame scrubber */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-muted-foreground w-16">
              Frame {currentFrame + 1}/{frameCount}
            </span>
            <Slider
              value={[currentFrame]}
              min={0}
              max={Math.max(0, frameCount - 1)}
              step={1}
              onValueChange={([v]) => onFrameChange(v)}
              className="flex-1"
            />
          </div>

          {/* Thread rows */}
          <ScrollArea className="h-32">
            <div className="space-y-1 pr-4">
              {threads.map(thread => (
                <div 
                  key={thread.id}
                  className={cn(
                    "flex items-center gap-2 p-1 rounded",
                    activeThreadId === thread.id && "bg-primary/10"
                  )}
                  onClick={() => onActiveThreadChange(thread.id)}
                >
                  <div className="w-24 shrink-0 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => { e.stopPropagation(); onToggleVisibility(thread.id); }}
                    >
                      {thread.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => { e.stopPropagation(); onToggleLock(thread.id); }}
                    >
                      {thread.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </Button>
                    <span className="text-xs truncate">{thread.name}</span>
                  </div>
                  
                  {/* Keyframe markers */}
                  <div className="flex-1 h-8 bg-muted/30 rounded relative">
                    {thread.keyframes.map(kf => (
                      <div
                        key={kf.id}
                        className={cn(
                          "absolute top-1 w-6 h-6 rounded border-2 overflow-hidden",
                          kf.frameIndex === currentFrame 
                            ? "border-primary ring-1 ring-primary" 
                            : "border-border"
                        )}
                        style={{ left: `${(kf.frameIndex / Math.max(1, frameCount - 1)) * 100}%` }}
                      >
                        <img src={kf.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {/* Playhead */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-primary"
                      style={{ left: `${(currentFrame / Math.max(1, frameCount - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 text-xs"
              onClick={onAddThread}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Layer
            </Button>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
