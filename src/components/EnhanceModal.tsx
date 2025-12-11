import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SpriteAsset } from '@/types/sprite';
import { toast } from 'sonner';

interface EnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: SpriteAsset | null;
  onEnhance: (assetId: string, prompt: string) => void;
}

export function EnhanceModal({ isOpen, onClose, asset, onEnhance }: EnhanceModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnhance = async () => {
    if (!asset || !prompt.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing (stubbed to Flux 2.5)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onEnhance(asset.id, prompt.trim());
    
    toast.success('Enhancement queued', {
      description: 'Check back soon — your sprite is being enhanced',
      icon: <Sparkles className="w-4 h-4 text-warning" />,
    });

    setIsProcessing(false);
    setPrompt('');
    onClose();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPrompt('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warning" />
            AI Enhance
          </DialogTitle>
          <DialogDescription>
            Describe how you'd like to enhance this sprite using AI (powered by Flux 2.5)
          </DialogDescription>
        </DialogHeader>

        {asset && (
          <div className="py-4 space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-secondary/30 rounded-lg grid-pattern flex items-center justify-center p-2">
                <img
                  src={asset.imageData}
                  alt={asset.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Prompt Input */}
            <Textarea
              placeholder="Describe the enhancement...&#10;&#10;Examples:&#10;• Add a glowing outline&#10;• Make it look more detailed&#10;• Add drop shadow&#10;• Increase contrast and saturation"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-input border-border min-h-[120px] resize-none"
              disabled={isProcessing}
            />

            <p className="text-xs text-muted-foreground">
              Note: AI enhancement is currently in preview mode. Results may vary.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEnhance} 
            disabled={!prompt.trim() || isProcessing}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Enhance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
