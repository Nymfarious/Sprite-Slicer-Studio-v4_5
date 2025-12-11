import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onConfirm?: () => void;
  // Animation-specific shortcuts
  onPlayPause?: () => void;
  onPrevFrame?: () => void;
  onNextFrame?: () => void;
  onJumpStart?: () => void;
  onJumpEnd?: () => void;
  onSetInPoint?: () => void;
  onSetOutPoint?: () => void;
  onToggleSnap?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onNavigateUp,
  onNavigateDown,
  onNavigateLeft,
  onNavigateRight,
  onConfirm,
  onPlayPause,
  onPrevFrame,
  onNextFrame,
  onJumpStart,
  onJumpEnd,
  onSetInPoint,
  onSetOutPoint,
  onToggleSnap,
  enabled = true,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

    // Space: Play/Pause
    if (event.code === 'Space') {
      event.preventDefault();
      onPlayPause?.();
      return;
    }

    // Undo: Ctrl/Cmd + Z
    if (ctrlOrCmd && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      onUndo?.();
      return;
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if (
      (ctrlOrCmd && event.shiftKey && event.key.toLowerCase() === 'z') ||
      (ctrlOrCmd && event.key.toLowerCase() === 'y')
    ) {
      event.preventDefault();
      onRedo?.();
      return;
    }

    // Select All: Ctrl/Cmd + A
    if (ctrlOrCmd && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      onSelectAll?.();
      return;
    }

    // Deselect All: Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      onDeselectAll?.();
      return;
    }

    // Delete: Delete or Backspace
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      onDelete?.();
      return;
    }

    // Arrow key navigation / frame stepping
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onNavigateUp?.();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onNavigateDown?.();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (event.shiftKey) {
        // Jump 10 frames back
        for (let i = 0; i < 10; i++) onPrevFrame?.();
      } else {
        onPrevFrame?.();
        onNavigateLeft?.();
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (event.shiftKey) {
        // Jump 10 frames forward
        for (let i = 0; i < 10; i++) onNextFrame?.();
      } else {
        onNextFrame?.();
        onNavigateRight?.();
      }
      return;
    }

    // Home: Jump to first frame
    if (event.key === 'Home') {
      event.preventDefault();
      onJumpStart?.();
      return;
    }

    // End: Jump to last frame
    if (event.key === 'End') {
      event.preventDefault();
      onJumpEnd?.();
      return;
    }

    // [ Set IN point
    if (event.code === 'BracketLeft') {
      event.preventDefault();
      onSetInPoint?.();
      return;
    }

    // ] Set OUT point
    if (event.code === 'BracketRight') {
      event.preventDefault();
      onSetOutPoint?.();
      return;
    }

    // S: Toggle snap mode
    if (event.key.toLowerCase() === 's' && !ctrlOrCmd) {
      event.preventDefault();
      onToggleSnap?.();
      return;
    }

    // Enter to confirm/send
    if (event.key === 'Enter' && !event.shiftKey) {
      onConfirm?.();
      return;
    }
  }, [
    enabled,
    onUndo,
    onRedo,
    onDelete,
    onSelectAll,
    onDeselectAll,
    onNavigateUp,
    onNavigateDown,
    onNavigateLeft,
    onNavigateRight,
    onConfirm,
    onPlayPause,
    onPrevFrame,
    onNextFrame,
    onJumpStart,
    onJumpEnd,
    onSetInPoint,
    onSetOutPoint,
    onToggleSnap,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Helper to format shortcut for display
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return shortcut
    .replace('Ctrl', isMac ? '⌘' : 'Ctrl')
    .replace('Shift', isMac ? '⇧' : 'Shift')
    .replace('Alt', isMac ? '⌥' : 'Alt');
}
