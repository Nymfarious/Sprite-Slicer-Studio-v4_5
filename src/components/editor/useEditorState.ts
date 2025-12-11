import { useState, useCallback, useEffect } from 'react';
import { GridSettings, UploadedImage, SpriteAsset } from '@/types/sprite';
import { GuidePositions, generateGuidesFromGrid, getCellBoundsFromGuides } from '../ElasticGridOverlay';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useFreeformSlicing } from '@/hooks/useFreeformSlicing';
import { useCropTool } from '@/hooks/useCropTool';
import { detectSpriteBoundaries } from '@/lib/spriteDetection';
import { toast } from 'sonner';
import { SelectionState, defaultGridSettings } from './types';

interface UseEditorStateProps {
  onSliceComplete: (assets: Omit<SpriteAsset, 'id' | 'createdAt'>[]) => void;
  sliceBackground: 'transparent' | 'black' | 'white';
}

export function useEditorState({ onSliceComplete, sliceBackground }: UseEditorStateProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [gridSettings, setGridSettings] = useState<GridSettings>(defaultGridSettings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elasticGridEnabled, setElasticGridEnabled] = useState(false);
  const [guidePositions, setGuidePositions] = useState<GuidePositions>({
    verticalGuides: [],
    horizontalGuides: [],
  });

  useEffect(() => {
    if (uploadedImage && elasticGridEnabled) {
      const newGuides = generateGuidesFromGrid(
        uploadedImage.width,
        uploadedImage.height,
        gridSettings.columns,
        gridSettings.rows,
        gridSettings.offsetX,
        gridSettings.offsetY
      );
      setGuidePositions(newGuides);
    }
  }, [elasticGridEnabled, gridSettings.columns, gridSettings.rows, gridSettings.offsetX, gridSettings.offsetY, uploadedImage]);

  const handleGuidesChange = useCallback((newGuides: GuidePositions) => {
    setGuidePositions(newGuides);
    const newColumns = newGuides.verticalGuides.length + 1;
    const newRows = newGuides.horizontalGuides.length + 1;
    if (newColumns !== gridSettings.columns || newRows !== gridSettings.rows) {
      setGridSettings(prev => ({
        ...prev,
        columns: newColumns,
        rows: newRows,
      }));
    }
  }, [gridSettings.columns, gridSettings.rows]);
  
  const freeform = useFreeformSlicing(uploadedImage?.width || 0, uploadedImage?.height || 0);
  const cropTool = useCropTool();

  const handleImageUpdate = useCallback((newDataUrl: string) => {
    if (!uploadedImage) return;
    const img = new Image();
    img.onload = () => {
      setUploadedImage({
        ...uploadedImage,
        dataUrl: newDataUrl,
        width: img.width,
        height: img.height,
      });
    };
    img.src = newDataUrl;
  }, [uploadedImage]);
  
  const { state: selectionState, setState: setSelectionState, undo, redo, canUndo, canRedo } = useUndoRedo<SelectionState>({ cells: [] });
  const selectedCells = new Set(selectionState.cells);

  const getLastSelectedCell = useCallback((): { col: number; row: number } | null => {
    if (selectionState.cells.length === 0) return null;
    const lastCell = selectionState.cells[selectionState.cells.length - 1];
    const [col, row] = lastCell.split('-').map(Number);
    return { col, row };
  }, [selectionState.cells]);

  const handleNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const last = getLastSelectedCell();
    const { columns, rows } = gridSettings;
    let newCol: number, newRow: number;
    
    if (!last) {
      newCol = 0;
      newRow = 0;
    } else {
      newCol = last.col;
      newRow = last.row;
      switch (direction) {
        case 'up': newRow = Math.max(0, last.row - 1); break;
        case 'down': newRow = Math.min(rows - 1, last.row + 1); break;
        case 'left': newCol = Math.max(0, last.col - 1); break;
        case 'right': newCol = Math.min(columns - 1, last.col + 1); break;
      }
    }
    setSelectionState({ cells: [`${newCol}-${newRow}`] });
  }, [getLastSelectedCell, gridSettings, setSelectionState]);

  const handleGridChange = useCallback((updates: Partial<GridSettings>) => {
    setGridSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePresetSelect = useCallback((columns: number, rows: number) => {
    setGridSettings(prev => ({ ...prev, columns, rows }));
    setSelectionState({ cells: [] });
    toast.success(`Applied ${columns}×${rows} grid`);
  }, [setSelectionState]);

  const handleAIDetect = useCallback(async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await detectSpriteBoundaries(
        uploadedImage.dataUrl,
        (progress, message) => console.log(`AI Detection: ${progress}% - ${message}`)
      );
      
      if (result.suggestedGrid) {
        const { columns, rows, cellWidth, cellHeight, offsetX, offsetY } = result.suggestedGrid;
        
        setGridSettings(prev => ({
          ...prev,
          columns,
          rows,
          cellWidth,
          cellHeight,
          offsetX,
          offsetY,
        }));
        
        toast.success('AI analysis complete!', {
          description: `Detected ${result.sprites.length} sprites in ${columns}×${rows} grid`,
        });
      } else {
        toast.info('No sprites detected', {
          description: 'Try adjusting the grid manually or ensure the image has transparent backgrounds',
        });
      }
    } catch (error) {
      console.error('AI detection error:', error);
      toast.error('AI detection failed', {
        description: 'Please try again or adjust the grid manually',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage]);

  const handleCellClick = useCallback((cellKey: string) => {
    const newCells = selectedCells.has(cellKey)
      ? selectionState.cells.filter(c => c !== cellKey)
      : [...selectionState.cells, cellKey];
    setSelectionState({ cells: newCells });
  }, [selectedCells, selectionState.cells, setSelectionState]);

  const handleSelectAll = useCallback(() => {
    const allCells: string[] = [];
    for (let row = 0; row < gridSettings.rows; row++) {
      for (let col = 0; col < gridSettings.columns; col++) {
        allCells.push(`${col}-${row}`);
      }
    }
    setSelectionState({ cells: allCells });
  }, [gridSettings, setSelectionState]);

  const handleDeselectAll = useCallback(() => {
    setSelectionState({ cells: [] });
  }, [setSelectionState]);

  const handleSendToLibrary = useCallback(() => {
    if (!uploadedImage || selectedCells.size === 0) {
      toast.error('Select at least one cell to slice');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const assets: Omit<SpriteAsset, 'id' | 'createdAt'>[] = [];
      const { cellWidth, cellHeight, offsetX, offsetY, spacingX, spacingY, columns } = gridSettings;
      const baseName = uploadedImage.file.name.replace(/\.[^/.]+$/, '');

      const sortedCells = Array.from(selectedCells).sort((a, b) => {
        const [colA, rowA] = a.split('-').map(Number);
        const [colB, rowB] = b.split('-').map(Number);
        return (rowA * columns + colA) - (rowB * columns + colB);
      });

      sortedCells.forEach(cellKey => {
        const [col, row] = cellKey.split('-').map(Number);
        const x = offsetX + col * (cellWidth + spacingX);
        const y = offsetY + row * (cellHeight + spacingY);

        canvas.width = cellWidth;
        canvas.height = cellHeight;
        if (sliceBackground === 'black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, cellWidth, cellHeight);
        } else if (sliceBackground === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, cellWidth, cellHeight);
        } else {
          ctx.clearRect(0, 0, cellWidth, cellHeight);
        }
        
        ctx.drawImage(img, x, y, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);

        const imageData = canvas.toDataURL('image/png');
        
        assets.push({
          name: `${baseName}_slice_${row + 1}-${col + 1}`,
          imageData,
          coordinates: { x, y, width: cellWidth, height: cellHeight },
          sourceSheet: {
            filename: uploadedImage.file.name,
            originalWidth: uploadedImage.width,
            originalHeight: uploadedImage.height,
          },
        });
      });

      onSliceComplete(assets);
      toast.success(`Sent ${assets.length} sprite${assets.length > 1 ? 's' : ''} to Library`);
      setSelectionState({ cells: [] });
    };
    img.src = uploadedImage.dataUrl;
  }, [uploadedImage, selectedCells, gridSettings, onSliceComplete, setSelectionState, sliceBackground]);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setSelectionState({ cells: [] });
    setGridSettings(defaultGridSettings);
    setElasticGridEnabled(false);
    setGuidePositions({ verticalGuides: [], horizontalGuides: [] });
  }, [setSelectionState]);

  const handleSendToLibraryElastic = useCallback(() => {
    if (!uploadedImage || selectedCells.size === 0) {
      toast.error('Select at least one cell to slice');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const assets: Omit<SpriteAsset, 'id' | 'createdAt'>[] = [];
      const baseName = uploadedImage.file.name.replace(/\.[^/.]+$/, '');
      const cellBounds = getCellBoundsFromGuides(guidePositions, uploadedImage.width, uploadedImage.height);
      const numCols = guidePositions.verticalGuides.length + 1;

      const sortedCells = Array.from(selectedCells).sort((a, b) => {
        const [colA, rowA] = a.split('-').map(Number);
        const [colB, rowB] = b.split('-').map(Number);
        return (rowA * numCols + colA) - (rowB * numCols + colB);
      });

      sortedCells.forEach(cellKey => {
        const [col, row] = cellKey.split('-').map(Number);
        const cell = cellBounds.find(c => c.col === col && c.row === row);
        if (!cell) return;

        canvas.width = cell.width;
        canvas.height = cell.height;
        if (sliceBackground === 'black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, cell.width, cell.height);
        } else if (sliceBackground === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, cell.width, cell.height);
        } else {
          ctx.clearRect(0, 0, cell.width, cell.height);
        }
        
        ctx.drawImage(img, cell.x, cell.y, cell.width, cell.height, 0, 0, cell.width, cell.height);

        const imageData = canvas.toDataURL('image/png');
        
        assets.push({
          name: `${baseName}_slice_${row + 1}-${col + 1}`,
          imageData,
          coordinates: { x: cell.x, y: cell.y, width: cell.width, height: cell.height },
          sourceSheet: {
            filename: uploadedImage.file.name,
            originalWidth: uploadedImage.width,
            originalHeight: uploadedImage.height,
          },
        });
      });

      onSliceComplete(assets);
      toast.success(`Sent ${assets.length} sprite${assets.length > 1 ? 's' : ''} to Library`);
      setSelectionState({ cells: [] });
    };
    img.src = uploadedImage.dataUrl;
  }, [uploadedImage, selectedCells, guidePositions, onSliceComplete, setSelectionState, sliceBackground]);

  const handleSlice = elasticGridEnabled ? handleSendToLibraryElastic : handleSendToLibrary;

  return {
    uploadedImage,
    setUploadedImage,
    gridSettings,
    isAnalyzing,
    elasticGridEnabled,
    setElasticGridEnabled,
    guidePositions,
    freeform,
    cropTool,
    selectedCells,
    canUndo,
    canRedo,
    undo,
    redo,
    handleGuidesChange,
    handleImageUpdate,
    handleNavigate,
    handleGridChange,
    handlePresetSelect,
    handleAIDetect,
    handleCellClick,
    handleSelectAll,
    handleDeselectAll,
    handleClearImage,
    handleSlice,
  };
}
