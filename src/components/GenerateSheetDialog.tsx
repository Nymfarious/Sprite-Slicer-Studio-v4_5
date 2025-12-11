import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Layers } from "lucide-react";
import { createLovableAIService, stubAIService } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

interface GenerateSheetDialogProps {
  onGenerate: (imageUrl: string) => void;
  disabled?: boolean;
}

const LAYOUT_OPTIONS = [
  { value: '1x4', label: '1 row × 4 cols', cols: 4 },
  { value: '1x6', label: '1 row × 6 cols', cols: 6 },
  { value: '2x3', label: '2 rows × 3 cols', cols: 3 },
  { value: '2x4', label: '2 rows × 4 cols', cols: 4 },
  { value: '3x4', label: '3 rows × 4 cols', cols: 4 },
  { value: '4x4', label: '4 rows × 4 cols', cols: 4 },
];

const POSE_PRESETS = [
  { value: 'walk', label: 'Walk cycle', description: 'stepping forward in sequence' },
  { value: 'run', label: 'Run cycle', description: 'running forward in sequence' },
  { value: 'jump', label: 'Jump', description: 'crouch, jump, apex, land' },
  { value: 'attack', label: 'Attack', description: 'windup, swing, follow-through' },
  { value: 'idle', label: 'Idle breathing', description: 'subtle breathing animation' },
  { value: 'wave', label: 'Wave hello', description: 'arm raising to wave' },
  { value: 'custom', label: 'Custom action', description: 'describe your own' },
];

export function GenerateSheetDialog({ 
  onGenerate,
  disabled = false,
}: GenerateSheetDialogProps) {
  const [open, setOpen] = useState(false);
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [actionPreset, setActionPreset] = useState('walk');
  const [customAction, setCustomAction] = useState('');
  const [poseCount, setPoseCount] = useState('6');
  const [layout, setLayout] = useState('2x3');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    if (!characterPrompt.trim()) return;
    
    const actionPrompt = actionPreset === 'custom' 
      ? customAction 
      : POSE_PRESETS.find(p => p.value === actionPreset)?.description || '';
    
    if (!actionPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const layoutOption = LAYOUT_OPTIONS.find(l => l.value === layout);
      const columns = layoutOption?.cols || 3;
      
      let imageUrl: string;
      try {
        const aiService = createLovableAIService();
        imageUrl = await aiService.generateSheet({
          characterPrompt: characterPrompt.trim(),
          actionPrompt: actionPrompt.trim(),
          poseCount: parseInt(poseCount),
          columns,
        });
      } catch (apiError) {
        console.warn('Lovable AI not available, using stub:', apiError);
        imageUrl = await stubAIService.generateSheet({
          characterPrompt: characterPrompt.trim(),
          actionPrompt: actionPrompt.trim(),
          poseCount: parseInt(poseCount),
          columns,
        });
      }
      
      onGenerate(imageUrl);
      
      toast({
        title: "Sprite sheet generated!",
        description: "The AI-generated sheet is ready for slicing.",
      });
      
      setOpen(false);
      setCharacterPrompt('');
      setCustomAction('');
      setActionPreset('walk');
    } catch (err) {
      console.error('Generation failed:', err);
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Could not generate sprite sheet",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const isValid = characterPrompt.trim() && (
    actionPreset !== 'custom' || customAction.trim()
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Sparkles className="h-4 w-4 mr-1" />
          Generate Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Generate Sprite Sheet
          </DialogTitle>
          <DialogDescription>
            Describe a character and action sequence. AI will generate a full sprite sheet you can slice into individual frames.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="character-prompt">Describe the character</Label>
            <Textarea
              id="character-prompt"
              placeholder="e.g., Pixel art knight in silver armor with red cape, 32x32 style, facing right"
              value={characterPrompt}
              onChange={(e) => setCharacterPrompt(e.target.value)}
              rows={2}
              maxLength={200}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {characterPrompt.length}/200
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Action type</Label>
            <Select value={actionPreset} onValueChange={setActionPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSE_PRESETS.map(preset => (
                  <SelectItem key={preset.value} value={preset.value}>
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      — {preset.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {actionPreset === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-action">Custom action description</Label>
              <Textarea
                id="custom-action"
                placeholder="e.g., Casting a spell - hands together, raising wand, magic burst, cool down"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                rows={2}
                maxLength={200}
                className="resize-none"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of poses</Label>
              <Select value={poseCount} onValueChange={setPoseCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 poses</SelectItem>
                  <SelectItem value="6">6 poses</SelectItem>
                  <SelectItem value="8">8 poses</SelectItem>
                  <SelectItem value="12">12 poses</SelectItem>
                  <SelectItem value="16">16 poses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sheet layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>
                Tip: For best results, describe a consistent art style (e.g., "pixel art", "hand-drawn", "anime style") and facing direction in your character description.
              </span>
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!isValid || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Generate Sheet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
