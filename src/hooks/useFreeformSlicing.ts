import { useState, useCallback } from 'react';
import { 
  FreeformTool, 
  SliceLine, 
  SliceRegion, 
  AISuggestion 
} from '@/components/FreeformSlicing';
import { toast } from 'sonner';

let lineIdCounter = 0;
let regionIdCounter = 0;
let suggestionIdCounter = 0;

export function useFreeformSlicing(imageWidth: number, imageHeight: number) {
  const [freeformEnabled, setFreeformEnabled] = useState(false);
  const [selectedTool, setSelectedTool] = useState<FreeformTool>('select');
  const [lines, setLines] = useState<SliceLine[]>([]);
  const [regions, setRegions] = useState<SliceRegion[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [expectedSpriteCount, setExpectedSpriteCount] = useState(4);
  const [isDetecting, setIsDetecting] = useState(false);

  const addLine = useCallback((line: Omit<SliceLine, 'id'>) => {
    const newLine: SliceLine = {
      ...line,
      id: `line-${++lineIdCounter}`,
    };
    setLines(prev => [...prev, newLine]);
    setSelectedLineId(newLine.id);
  }, []);

  const updateLine = useCallback((id: string, updates: Partial<SliceLine>) => {
    setLines(prev => prev.map(line => 
      line.id === id ? { ...line, ...updates } : line
    ));
  }, []);

  const deleteLine = useCallback((id: string) => {
    setLines(prev => prev.filter(line => line.id !== id));
    if (selectedLineId === id) {
      setSelectedLineId(null);
    }
  }, [selectedLineId]);

  const addRegion = useCallback((region: Omit<SliceRegion, 'id'>) => {
    const newRegion: SliceRegion = {
      ...region,
      id: `region-${++regionIdCounter}`,
    };
    setRegions(prev => [...prev, newRegion]);
  }, []);

  const deleteRegion = useCallback((id: string) => {
    setRegions(prev => prev.filter(region => region.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setLines([]);
    setRegions([]);
    setSuggestions([]);
    setSelectedLineId(null);
    toast.success('All lines and regions cleared');
  }, []);

  const smartDetect = useCallback(async () => {
    if (!imageWidth || !imageHeight) return;

    setIsDetecting(true);
    
    // Simulate AI detection (in real implementation, this would analyze the image)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate smart suggestions based on expected sprite count
    const cols = Math.ceil(Math.sqrt(expectedSpriteCount));
    const rows = Math.ceil(expectedSpriteCount / cols);
    
    const newSuggestions: AISuggestion[] = [];

    // Suggest horizontal lines
    for (let i = 1; i < rows; i++) {
      const yPos = (imageHeight / rows) * i;
      newSuggestions.push({
        id: `suggestion-${++suggestionIdCounter}`,
        type: 'line',
        data: {
          id: '',
          type: 'horizontal',
          position: yPos,
          start: 0,
          end: imageWidth,
        },
        confidence: 0.7 + Math.random() * 0.25,
        accepted: null,
      });
    }

    // Suggest vertical lines
    for (let i = 1; i < cols; i++) {
      const xPos = (imageWidth / cols) * i;
      newSuggestions.push({
        id: `suggestion-${++suggestionIdCounter}`,
        type: 'line',
        data: {
          id: '',
          type: 'vertical',
          position: xPos,
          start: 0,
          end: imageHeight,
        },
        confidence: 0.65 + Math.random() * 0.3,
        accepted: null,
      });
    }

    setSuggestions(newSuggestions);
    setIsDetecting(false);
    
    toast.success(`Found ${newSuggestions.length} potential boundaries`, {
      description: 'Review and accept/reject suggestions',
    });
  }, [imageWidth, imageHeight, expectedSpriteCount]);

  const acceptSuggestion = useCallback((id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion) return;

    if (suggestion.type === 'line') {
      const lineData = suggestion.data as SliceLine;
      addLine({
        type: lineData.type,
        position: lineData.position,
        start: lineData.start,
        end: lineData.end,
      });
    } else {
      const regionData = suggestion.data as SliceRegion;
      addRegion({
        type: regionData.type,
        points: regionData.points,
        bounds: regionData.bounds,
      });
    }

    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, accepted: true } : s
    ));
  }, [suggestions, addLine, addRegion]);

  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, accepted: false } : s
    ));
  }, []);

  const toggleFreeform = useCallback(() => {
    setFreeformEnabled(prev => !prev);
    if (!freeformEnabled) {
      setSelectedTool('h-line');
    }
  }, [freeformEnabled]);

  // Calculate slice regions from lines
  const getSliceRegionsFromLines = useCallback(() => {
    const horizontalLines = [0, ...lines.filter(l => l.type === 'horizontal').map(l => l.position).sort((a, b) => a - b), imageHeight];
    const verticalLines = [0, ...lines.filter(l => l.type === 'vertical').map(l => l.position).sort((a, b) => a - b), imageWidth];

    const slices: { x: number; y: number; width: number; height: number }[] = [];

    for (let row = 0; row < horizontalLines.length - 1; row++) {
      for (let col = 0; col < verticalLines.length - 1; col++) {
        slices.push({
          x: verticalLines[col],
          y: horizontalLines[row],
          width: verticalLines[col + 1] - verticalLines[col],
          height: horizontalLines[row + 1] - horizontalLines[row],
        });
      }
    }

    return slices;
  }, [lines, imageWidth, imageHeight]);

  return {
    freeformEnabled,
    toggleFreeform,
    selectedTool,
    setSelectedTool,
    lines,
    regions,
    suggestions,
    selectedLineId,
    setSelectedLineId,
    expectedSpriteCount,
    setExpectedSpriteCount,
    isDetecting,
    addLine,
    updateLine,
    deleteLine,
    addRegion,
    deleteRegion,
    clearAll,
    smartDetect,
    acceptSuggestion,
    rejectSuggestion,
    getSliceRegionsFromLines,
  };
}
