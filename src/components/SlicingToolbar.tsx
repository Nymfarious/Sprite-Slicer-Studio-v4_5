import { useState, useEffect, useCallback } from 'react';
import { Grid3X3, Sparkles, Layers, ChevronDown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { BatchCompletionScreen } from './BatchCompletionScreen';

interface GridPreset {
  name: string;
  columns: number;
  rows: number;
  type: 'regular' | 'irregular';
  description?: string;
}

const regularPresets: GridPreset[] = [
  { name: '2×2', columns: 2, rows: 2, type: 'regular' },
  { name: '2×3', columns: 2, rows: 3, type: 'regular' },
  { name: '3×2', columns: 3, rows: 2, type: 'regular' },
  { name: '3×3', columns: 3, rows: 3, type: 'regular' },
  { name: '4×4', columns: 4, rows: 4, type: 'regular' },
];

const irregularPresets: GridPreset[] = [
  { name: 'Top-heavy', columns: 3, rows: 2, type: 'irregular', description: '3 top / 2 bottom' },
  { name: 'Bottom-heavy', columns: 2, rows: 2, type: 'irregular', description: '2 top / 3 bottom' },
  { name: '5-die', columns: 2, rows: 3, type: 'irregular', description: '2-1-2 pattern' },
];

interface SlicingToolbarProps {
  onPresetSelect: (columns: number, rows: number) => void;
  onAIDetect: () => Promise<void> | void;
  isAnalyzing: boolean;
  disabled: boolean;
}

interface BatchSheet {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete';
}

export function SlicingToolbar({ 
  onPresetSelect, 
  onAIDetect, 
  isAnalyzing, 
  disabled,
}: SlicingToolbarProps) {
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchSheets, setBatchSheets] = useState<BatchSheet[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentSheetProgress, setCurrentSheetProgress] = useState(0);
  const [batchPhase, setBatchPhase] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  const simulateBatchProcessing = useCallback(() => {
    if (batchSheets.length === 0) return;
    
    setBatchPhase('processing');
    setCurrentSheetIndex(0);
    setOverallProgress(0);
    setCurrentSheetProgress(0);

    let sheetIdx = 0;
    let progress = 0;
    
    const processSheet = () => {
      if (sheetIdx >= batchSheets.length) {
        setBatchPhase('complete');
        setBatchModalOpen(false);
        setShowCompletionScreen(true);
        return;
      }

      // Update current sheet status
      setBatchSheets(prev => prev.map((sheet, idx) => ({
        ...sheet,
        status: idx === sheetIdx ? 'processing' : idx < sheetIdx ? 'complete' : 'pending'
      })));
      setCurrentSheetIndex(sheetIdx);

      // Animate progress for current sheet
      let sheetProgress = 0;
      const progressInterval = setInterval(() => {
        sheetProgress += Math.random() * 15 + 5;
        if (sheetProgress >= 100) {
          sheetProgress = 100;
          clearInterval(progressInterval);
          
          // Update overall progress
          progress = ((sheetIdx + 1) / batchSheets.length) * 100;
          setOverallProgress(progress);
          setCurrentSheetProgress(0);
          
          // Move to next sheet
          sheetIdx++;
          setTimeout(processSheet, 500);
        } else {
          setCurrentSheetProgress(sheetProgress);
        }
      }, 200);
    };

    processSheet();
  }, [batchSheets]);

  const handleAddSheets = () => {
    // Simulate adding sheets (in real app, this would be file picker)
    const mockSheets: BatchSheet[] = [
      { id: '1', name: 'characters.png', status: 'pending' },
      { id: '2', name: 'items.png', status: 'pending' },
      { id: '3', name: 'ui-elements.png', status: 'pending' },
      { id: '4', name: 'terrain.png', status: 'pending' },
      { id: '5', name: 'effects.png', status: 'pending' },
    ];
    setBatchSheets(mockSheets);
    toast.success('5 sheets added to batch');
  };

  const handleStartBatch = () => {
    if (batchSheets.length === 0) {
      toast.error('Add some sheets first');
      return;
    }
    simulateBatchProcessing();
  };

  const handleOpenBatchModal = () => {
    setBatchModalOpen(true);
    setBatchPhase('upload');
    setBatchSheets([]);
    setOverallProgress(0);
    setCurrentSheetProgress(0);
  };

  const handleCompletionContinue = () => {
    setShowCompletionScreen(false);
    setBatchPhase('upload');
    setBatchSheets([]);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Slicing Tools
        </div>

        <div className="flex gap-2">
          {/* Cookie Cutter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 justify-between"
                disabled={disabled}
              >
                <span className="flex items-center gap-1.5">
                  <Grid3X3 className="w-3.5 h-3.5" />
                  Cookie Cutter
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover border-border z-50">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Quick Presets → Grid Settings
              </DropdownMenuLabel>
              <p className="text-[10px] text-muted-foreground/70 px-2 pb-2">
                Select a preset to populate Grid Settings values
              </p>
              {regularPresets.map(preset => (
                <DropdownMenuItem
                  key={preset.name}
                  onClick={() => onPresetSelect(preset.columns, preset.rows)}
                  className="font-mono text-sm flex justify-between"
                >
                  <span>{preset.name}</span>
                  <span className="text-muted-foreground text-xs">→ Grid</span>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator className="bg-border" />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Irregular Layouts
              </DropdownMenuLabel>
              {irregularPresets.map(preset => (
                <DropdownMenuItem
                  key={preset.name}
                  onClick={() => {
                    onPresetSelect(preset.columns, preset.rows);
                    toast.info(`${preset.name} layout applied`, {
                      description: preset.description,
                    });
                  }}
                  className="flex flex-col items-start"
                >
                  <span className="text-sm">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                className="relative overflow-hidden opacity-50 cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Magic
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">AI Boundaries</p>
              <p className="text-muted-foreground">Coming soon in v4.5</p>
            </TooltipContent>
          </Tooltip>
        </div>


        {/* Batch Session Link */}
        <button
          onClick={handleOpenBatchModal}
          disabled={disabled}
          className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Layers className="w-3 h-3 inline mr-1" />
          Batch Session (up to 5 sheets)
        </button>

        {/* Batch Modal */}
        <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Batch AI Processing
                <Badge variant="outline" className="text-[10px] text-warning border-warning/50">
                  Coming Soon
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {batchPhase === 'upload' 
                  ? 'Load multiple sprite sheets for AI analysis'
                  : `Processing ${batchSheets.length} sheets...`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {batchPhase === 'upload' ? (
                <>
                  {/* Upload area */}
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={handleAddSheets}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to add sprite sheets
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Maximum 5 sheets per batch
                    </p>
                  </div>

                  {/* Sheet list */}
                  {batchSheets.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        {batchSheets.length} sheets ready
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {batchSheets.map((sheet, idx) => (
                          <div 
                            key={sheet.id}
                            className="flex items-center gap-2 text-sm py-1.5 px-2 rounded bg-secondary/50"
                          >
                            <span className="w-5 h-5 rounded bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="truncate flex-1">{sheet.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleStartBatch} 
                    className="w-full"
                    disabled={batchSheets.length === 0}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Batch Analysis
                  </Button>
                </>
              ) : batchPhase === 'processing' ? (
                <div className="space-y-6">
                  {/* Overall progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Overall Progress</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  {/* Sheet list with status */}
                  <div className="space-y-2">
                    {batchSheets.map((sheet, idx) => (
                      <div 
                        key={sheet.id}
                        className={`flex items-center gap-3 text-sm py-2 px-3 rounded transition-all ${
                          sheet.status === 'processing' 
                            ? 'bg-primary/10 border border-primary/30' 
                            : sheet.status === 'complete'
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-secondary/30'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-mono ${
                          sheet.status === 'complete' 
                            ? 'bg-green-500/20 text-green-500'
                            : sheet.status === 'processing'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {sheet.status === 'complete' ? '✓' : idx + 1}
                        </span>
                        <span className={`truncate flex-1 ${
                          sheet.status === 'processing' ? 'text-primary font-medium' : ''
                        }`}>
                          {sheet.name}
                        </span>
                        {sheet.status === 'processing' && (
                          <span className="text-xs text-primary">
                            {Math.round(currentSheetProgress)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Animated scanning effect */}
                  <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_1.5s_ease-in-out_infinite]"
                    />
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Analyzing sprite boundaries and detecting grid patterns...
                  </p>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Completion Screen Overlay */}
      {showCompletionScreen && (
        <BatchCompletionScreen onContinue={handleCompletionContinue} />
      )}

      {/* Scan animation keyframe */}
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </>
  );
}
