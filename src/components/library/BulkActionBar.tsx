import { useMemo } from 'react';
import { Trash2, Tag as TagIcon, Edit2, FileImage, Save, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BulkActionBarProps {
  selectedCount: number;
  batchPrefix: string;
  setBatchPrefix: (v: string) => void;
  batchSuffix: string;
  setBatchSuffix: (v: string) => void;
  batchNumbering: 'sequential' | 'row-col';
  setBatchNumbering: (v: 'sequential' | 'row-col') => void;
  exportFormat: 'png' | 'jpeg' | 'webp';
  setExportFormat: (v: 'png' | 'jpeg' | 'webp') => void;
  onBatchRename: () => void;
  onBatchSave: () => void;
  onOpenTagDialog: () => void;
  onOpenExportPack: () => void;
  onOpenDeleteDialog: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  batchPrefix,
  setBatchPrefix,
  batchSuffix,
  setBatchSuffix,
  batchNumbering,
  setBatchNumbering,
  exportFormat,
  setExportFormat,
  onBatchRename,
  onBatchSave,
  onOpenTagDialog,
  onOpenExportPack,
  onOpenDeleteDialog,
  onClearSelection,
}: BulkActionBarProps) {
  const batchPreviewName = useMemo(() => {
    const baseName = batchPrefix || 'sprite';
    const suffix = batchSuffix || '';
    const number = batchNumbering === 'sequential' ? '001' : '1-1';
    return `${baseName}${suffix}_${number}.${exportFormat}`;
  }, [batchPrefix, batchSuffix, batchNumbering, exportFormat]);

  return (
    <div className="px-4 py-2 bg-primary/10 border-b border-primary/30 flex items-center justify-between animate-fade-in">
      <span className="text-sm text-primary font-medium">
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Edit2 className="w-3 h-3 mr-1" />
              Rename
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-popover border-border z-50" align="start">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Prefix</Label>
                <Input 
                  placeholder="e.g., sprite_character"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="h-8 text-xs bg-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Suffix</Label>
                <Input 
                  placeholder="e.g., _v2"
                  value={batchSuffix}
                  onChange={(e) => setBatchSuffix(e.target.value)}
                  className="h-8 text-xs bg-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Numbering</Label>
                <Select value={batchNumbering} onValueChange={(v) => setBatchNumbering(v as 'sequential' | 'row-col')}>
                  <SelectTrigger className="h-8 text-xs bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="sequential">Sequential (001, 002...)</SelectItem>
                    <SelectItem value="row-col">Row-Column (1-1, 1-2...)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground font-mono bg-secondary/50 p-2 rounded">
                Preview: {batchPreviewName}
              </div>
              <Button onClick={onBatchRename} className="w-full h-8 text-xs">
                Apply to {selectedCount} Selected
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'png' | 'jpeg' | 'webp')}>
          <SelectTrigger className="h-7 w-20 text-xs bg-transparent border-primary/30">
            <FileImage className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={onBatchSave} className="h-7 text-xs">
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>

        <Button variant="ghost" size="sm" onClick={onOpenTagDialog} className="h-7 text-xs">
          <TagIcon className="w-3 h-3 mr-1" />
          Tag
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenExportPack} className="h-7 text-xs">
          <Package className="w-3 h-3 mr-1" />
          Export Pack
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenDeleteDialog}
          className="h-7 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-7 w-7">
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
