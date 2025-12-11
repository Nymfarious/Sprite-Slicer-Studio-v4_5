import { useState, useMemo } from 'react';
import { Download, FileJson, Layers, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SpriteAsset, ExportPackJSON } from '@/types/sprite';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface ExportPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: SpriteAsset[];
  onClearSelection: () => void;
}

export function ExportPackModal({ 
  isOpen, 
  onClose, 
  selectedAssets,
  onClearSelection,
}: ExportPackModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('zip');

  // Generate JSON preview
  const jsonData = useMemo<ExportPackJSON>(() => {
    const frames: ExportPackJSON['frames'] = {};
    
    selectedAssets.forEach(asset => {
      frames[`${asset.name}.png`] = {
        x: asset.coordinates.x,
        y: asset.coordinates.y,
        w: asset.coordinates.width,
        h: asset.coordinates.height,
      };
    });

    // Get source info from first asset
    const firstAsset = selectedAssets[0];
    
    return {
      frames,
      meta: {
        source: firstAsset?.sourceSheet.filename || 'unknown',
        size: {
          w: firstAsset?.sourceSheet.originalWidth || 0,
          h: firstAsset?.sourceSheet.originalHeight || 0,
        },
        generated: new Date().toISOString(),
        app: 'Sprite Slicer Pro v1.0',
      },
    };
  }, [selectedAssets]);

  const handleDownloadZip = async () => {
    setIsExporting(true);
    
    try {
      const zip = new JSZip();
      
      // Add each sprite to the zip
      for (const asset of selectedAssets) {
        // Convert base64 to blob
        const base64Data = asset.imageData.split(',')[1];
        zip.file(`${asset.name}.png`, base64Data, { base64: true });
      }
      
      // Add JSON manifest
      zip.file('sprites.json', JSON.stringify(jsonData, null, 2));
      
      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sprites_export_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${selectedAssets.length} sprites as ZIP`);
      onClearSelection();
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to create ZIP file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sprites_coordinates_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('JSON coordinates exported');
  };

  const handleRepackSheet = async () => {
    setIsExporting(true);
    
    try {
      // Calculate optimal sheet dimensions
      const totalWidth = selectedAssets.reduce((sum, a) => sum + a.coordinates.width, 0);
      const maxHeight = Math.max(...selectedAssets.map(a => a.coordinates.height));
      
      // Simple horizontal packing for now
      const columns = Math.ceil(Math.sqrt(selectedAssets.length));
      const rows = Math.ceil(selectedAssets.length / columns);
      const cellWidth = Math.max(...selectedAssets.map(a => a.coordinates.width));
      const cellHeight = Math.max(...selectedAssets.map(a => a.coordinates.height));
      
      const sheetWidth = columns * cellWidth;
      const sheetHeight = rows * cellHeight;
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = sheetWidth;
      canvas.height = sheetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Draw each sprite
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };
      
      for (let i = 0; i < selectedAssets.length; i++) {
        const asset = selectedAssets[i];
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        const img = await loadImage(asset.imageData);
        ctx.drawImage(img, x, y);
      }
      
      // Export
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `repacked_sheet_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Also generate new JSON for the repacked sheet
      const repackedJson: ExportPackJSON = {
        frames: {},
        meta: {
          source: `repacked_sheet_${Date.now()}.png`,
          size: { w: sheetWidth, h: sheetHeight },
          generated: new Date().toISOString(),
          app: 'Sprite Slicer Pro v1.0',
        },
      };
      
      for (let i = 0; i < selectedAssets.length; i++) {
        const asset = selectedAssets[i];
        const col = i % columns;
        const row = Math.floor(i / columns);
        repackedJson.frames[`${asset.name}.png`] = {
          x: col * cellWidth,
          y: row * cellHeight,
          w: asset.coordinates.width,
          h: asset.coordinates.height,
        };
      }
      
      // Download JSON alongside
      const jsonBlob = new Blob([JSON.stringify(repackedJson, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `repacked_sheet_${Date.now()}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
      
      toast.success('Sprite sheet repacked', {
        description: `${columns}×${rows} grid (${sheetWidth}×${sheetHeight}px)`,
      });
      onClearSelection();
      onClose();
    } catch (error) {
      console.error('Repack error:', error);
      toast.error('Failed to repack sprite sheet');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Export Pack
          </DialogTitle>
          <DialogDescription>
            Export {selectedAssets.length} selected sprite{selectedAssets.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="zip" className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              ZIP
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <FileJson className="w-3.5 h-3.5 mr-1.5" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="repack" className="text-xs">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Re-pack
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zip" className="mt-4 space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <h4 className="text-sm font-medium mb-2">Download ZIP Archive</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Bundles all selected sprites into a .zip file along with a JSON manifest containing coordinates.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>• {selectedAssets.length} PNG file{selectedAssets.length > 1 ? 's' : ''}</li>
                <li>• sprites.json (coordinate manifest)</li>
              </ul>
              <Button 
                onClick={handleDownloadZip} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download ZIP
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="json" className="mt-4 space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <h4 className="text-sm font-medium mb-2">Export JSON Coordinates</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Generate a JSON file with sprite positions for game engines (Unity, Godot, Phaser, etc.)
              </p>
              
              {/* JSON Preview */}
              <div className="bg-background rounded border border-border p-2 mb-4 max-h-[200px] overflow-auto">
                <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
              
              <Button onClick={handleDownloadJSON} className="w-full">
                <FileJson className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="repack" className="mt-4 space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <h4 className="text-sm font-medium mb-2">Re-pack Sprite Sheet</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Combines selected sprites back into a single optimized sprite sheet with updated coordinates.
              </p>
              
              {/* Preview info */}
              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                <p>Selected sprites will be arranged in a grid:</p>
                <ul className="ml-4 mt-1 space-y-0.5">
                  <li>• {Math.ceil(Math.sqrt(selectedAssets.length))} columns</li>
                  <li>• {Math.ceil(selectedAssets.length / Math.ceil(Math.sqrt(selectedAssets.length)))} rows</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleRepackSheet} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Layers className="w-4 h-4 mr-2" />
                )}
                Re-pack Sheet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
