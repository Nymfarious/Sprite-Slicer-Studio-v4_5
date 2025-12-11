import { Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SpriteAsset } from '@/types/sprite';

interface LibraryDialogsProps {
  // Delete single
  pendingDeleteId: string | null;
  setPendingDeleteId: (id: string | null) => void;
  assetToDelete?: SpriteAsset;
  onDeleteSingle: (id: string) => void;
  
  // Delete selected
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  
  // Clear all
  clearDialogOpen: boolean;
  setClearDialogOpen: (open: boolean) => void;
  totalAssetCount: number;
  onClearLibrary: () => void;
  
  // Tag dialog
  tagDialogOpen: boolean;
  setTagDialogOpen: (open: boolean) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  onTagSelected: () => void;
}

export function LibraryDialogs({
  pendingDeleteId,
  setPendingDeleteId,
  assetToDelete,
  onDeleteSingle,
  deleteDialogOpen,
  setDeleteDialogOpen,
  selectedCount,
  onDeleteSelected,
  clearDialogOpen,
  setClearDialogOpen,
  totalAssetCount,
  onClearLibrary,
  tagDialogOpen,
  setTagDialogOpen,
  tagInput,
  setTagInput,
  onTagSelected,
}: LibraryDialogsProps) {
  return (
    <>
      {/* Delete Single Item Dialog */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{assetToDelete?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingDeleteId && onDeleteSingle(pendingDeleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selectedCount} item{selectedCount > 1 ? 's' : ''}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteSelected}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Library</AlertDialogTitle>
            <AlertDialogDescription>
              Delete all {totalAssetCount} assets? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onClearLibrary}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Tag {selectedCount} Item{selectedCount > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Add tags to organize and filter your sprites. Separate multiple tags with commas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter tags, comma separated..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="bg-input border-border"
              onKeyDown={(e) => e.key === 'Enter' && onTagSelected()}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Example: character, walk, animation
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onTagSelected} disabled={!tagInput.trim()}>
              Add Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
