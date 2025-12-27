// Testing Checklist Utility Functions

import { PlanResponse, PlanPriority, ErrorLogEntry } from './types';

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'P1': return 'text-rose-400';
    case 'P2': return 'text-orange-400';
    case 'P3': return 'text-sky-400';
    case 'V2': return 'text-zinc-500';
    default: return 'text-muted-foreground';
  }
};

export const getResponseStyle = (
  planResponses: Record<string, PlanResponse>,
  id: string,
  value: PlanResponse
): string => {
  const isSelected = planResponses[id] === value;
  const base = "px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer";
  if (!isSelected) return `${base} bg-muted text-muted-foreground hover:bg-muted/80`;
  if (value === 'yes') return `${base} bg-emerald-600 text-white`;
  if (value === 'no') return `${base} bg-red-600 text-white`;
  if (value === 'maybe') return `${base} bg-amber-600 text-white`;
  if (value === 'later') return `${base} bg-zinc-500 text-white`;
  return base;
};

export const getPlanPriorityStyle = (
  planPriorities: Record<string, PlanPriority>,
  id: string,
  value: PlanPriority
): string => {
  const isSelected = planPriorities[id] === value;
  const base = "w-6 h-6 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center";
  if (!isSelected) return `${base} bg-muted text-muted-foreground hover:bg-muted/80`;
  if (value === 1) return `${base} bg-rose-500 text-white`;
  if (value === 2) return `${base} bg-orange-500 text-white`;
  if (value === 3) return `${base} bg-sky-500 text-white`;
  return base;
};

export const priorityLabel = (p: PlanPriority): string => {
  if (p === 1) return 'P1-Must';
  if (p === 2) return 'P2-Should';
  if (p === 3) return 'P3-Nice';
  return '';
};

export const getLogColor = (type: ErrorLogEntry['type']): string => {
  switch (type) {
    case 'error': return 'text-red-400';
    case 'warn': return 'text-yellow-400';
    case 'info': return 'text-blue-400';
    case 'debug': return 'text-zinc-400';
    default: return 'text-muted-foreground';
  }
};

export const getStatusEmoji = (status: 'complete' | 'partial' | 'stub' | 'bug'): string => {
  switch (status) {
    case 'complete': return '✅';
    case 'partial': return '🔨';
    case 'stub': return '📋';
    case 'bug': return '🐛';
  }
};
