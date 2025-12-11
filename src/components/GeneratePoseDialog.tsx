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
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { createLovableAIService, stubAIService } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

interface StyleReference {
  id: string;
  url: string;
  name: string;
}

interface GeneratePoseDialogProps {
  onGenerate: (imageUrl: string) => void;
  styleReferences?: StyleReference[];
  disabled?: boolean;
}

export function GeneratePoseDialog({ 
  onGenerate, 
  styleReferences = [],
  disabled = false,
}: GeneratePoseDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Try Lovable AI first, fallback to stub
      let imageUrl: string;
      try {
        const aiService = createLovableAIService();
        const styleRef = selectedReference 
          ? styleReferences.find(r => r.id === selectedReference)?.url 
          : undefined;
        
        imageUrl = await aiService.generatePose({
          prompt: prompt.trim(),
          styleReference: styleRef,
          width: 256,
          height: 256,
        });
      } catch (apiError) {
        console.warn('Lovable AI not available, using stub:', apiError);
        imageUrl = await stubAIService.generatePose({
          prompt: prompt.trim(),
        });
      }
      
      onGenerate(imageUrl);
      
      toast({
        title: "Pose generated!",
        description: "The AI-generated pose has been added to your library.",
      });
      
      setOpen(false);
      setPrompt('');
      setSelectedReference(null);
    } catch (err) {
      console.error('Generation failed:', err);
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Could not generate pose",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Sparkles className="h-4 w-4 mr-1" />
          Generate Pose
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Missing Pose
          </DialogTitle>
          <DialogDescription>
            Describe the pose you need. AI will generate a single image to add to your sprite library.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pose-prompt">Describe the pose</Label>
            <Textarea
              id="pose-prompt"
              placeholder="e.g., Character with arms raised overhead, same style as reference, joyful expression, facing right"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {prompt.length}/200
            </div>
          </div>
          
          {styleReferences.length > 0 && (
            <div className="space-y-2">
              <Label>Style reference (optional)</Label>
              <div className="flex gap-2 flex-wrap">
                {styleReferences.slice(0, 6).map(ref => (
                  <button
                    key={ref.id}
                    type="button"
                    onClick={() => setSelectedReference(
                      selectedReference === ref.id ? null : ref.id
                    )}
                    className={`relative w-14 h-14 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
                      selectedReference === ref.id 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={ref.url} 
                      alt={ref.name} 
                      className="w-full h-full object-cover" 
                    />
                    {selectedReference === ref.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select an image to help AI match your art style
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
