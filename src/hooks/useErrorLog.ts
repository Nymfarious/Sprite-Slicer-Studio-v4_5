import { useCallback, useState } from 'react';
import { ErrorLogEntry, ErrorType } from '@/types/error';
import { useLocalStorage } from './useLocalStorage';

const MAX_ERRORS = 50;

export function useErrorLog() {
  const [errors, setErrors] = useLocalStorage<ErrorLogEntry[]>('sprite-slicer-error-log', []);
  const [spriteMessage, setSpriteMessage] = useState<string | null>(null);
  const [spriteVisible, setSpriteVisible] = useState(false);

  const getHelpfulMessage = useCallback((type: ErrorType, message: string): string => {
    switch (type) {
      case 'import':
        return "Hmm, I couldn't read that file. Try a different format (PNG, JPG, or GIF)?";
      case 'export':
        return "Export hiccup! Check if you have storage space available.";
      case 'processing':
        return "Something went wrong while processing. Try with a smaller image?";
      case 'network':
        return "Connection issue! Check your internet and try again.";
      case 'validation':
        return "That doesn't look quite right. Double-check the input?";
      default:
        return "Something went wrong. Check the error log for details!";
    }
  }, []);

  const logError = useCallback((
    type: ErrorType, 
    message: string, 
    details?: string, 
    fileName?: string
  ) => {
    const newError: ErrorLogEntry = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      message,
      details,
      fileName,
      pinned: false,
    };

    setErrors(prev => [newError, ...prev].slice(0, MAX_ERRORS));

    // Show Sprite helper
    setSpriteMessage(getHelpfulMessage(type, message));
    setSpriteVisible(true);
  }, [setErrors, getHelpfulMessage]);

  const togglePin = useCallback((id: string) => {
    setErrors(prev => prev.map(err => 
      err.id === id ? { ...err, pinned: !err.pinned } : err
    ));
  }, [setErrors]);

  const deleteError = useCallback((id: string) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, [setErrors]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, [setErrors]);

  const dismissSprite = useCallback(() => {
    setSpriteVisible(false);
    setSpriteMessage(null);
  }, []);

  const exportErrorsAsMd = useCallback(() => {
    if (errors.length === 0) return;

    const md = `# Error Log Export\n\nGenerated: ${new Date().toISOString()}\n\n---\n\n` +
      errors.map(e => 
        `## ${e.type.toUpperCase()} - ${new Date(e.timestamp).toISOString()}\n\n` +
        `**Message:** ${e.message}\n\n` +
        (e.fileName ? `**File:** ${e.fileName}\n\n` : '') +
        (e.details ? `**Details:**\n\`\`\`\n${e.details}\n\`\`\`\n\n` : '') +
        `---`
      ).join('\n\n');
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [errors]);

  // Sort errors: pinned first, then by timestamp
  const sortedErrors = [...errors].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp - a.timestamp;
  });

  return {
    errors: sortedErrors,
    logError,
    togglePin,
    deleteError,
    clearErrors,
    exportErrorsAsMd,
    spriteMessage,
    spriteVisible,
    dismissSprite,
  };
}
