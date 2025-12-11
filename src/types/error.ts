export type ErrorType = 'import' | 'export' | 'processing' | 'network' | 'validation';

export interface ErrorLogEntry {
  id: string;
  timestamp: number;
  type: ErrorType;
  message: string;
  details?: string;
  fileName?: string;
  pinned: boolean;
}
