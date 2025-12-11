import { useState, useCallback } from 'react';

const MAX_HISTORY = 10;

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

export function useUndoRedo<T>(initialState: T): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];

  const setState = useCallback((newState: T) => {
    setHistory(prev => {
      // Remove any future states after current index
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new state
      newHistory.push(newState);
      // Keep only last MAX_HISTORY states
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const clearHistory = useCallback(() => {
    setHistory([state]);
    setCurrentIndex(0);
  }, [state]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    clearHistory,
  };
}
