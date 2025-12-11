import { createContext, useContext, ReactNode } from 'react';
import { useErrorLog } from '@/hooks/useErrorLog';
import { ErrorLogEntry, ErrorType } from '@/types/error';

interface ErrorLogContextType {
  errors: ErrorLogEntry[];
  logError: (type: ErrorType, message: string, details?: string, fileName?: string) => void;
  togglePin: (id: string) => void;
  deleteError: (id: string) => void;
  clearErrors: () => void;
  exportErrorsAsMd: () => void;
  spriteMessage: string | null;
  spriteVisible: boolean;
  dismissSprite: () => void;
}

const ErrorLogContext = createContext<ErrorLogContextType | null>(null);

export function ErrorLogProvider({ children }: { children: ReactNode }) {
  const errorLog = useErrorLog();

  return (
    <ErrorLogContext.Provider value={errorLog}>
      {children}
    </ErrorLogContext.Provider>
  );
}

export function useErrorLogContext() {
  const context = useContext(ErrorLogContext);
  if (!context) {
    throw new Error('useErrorLogContext must be used within ErrorLogProvider');
  }
  return context;
}
