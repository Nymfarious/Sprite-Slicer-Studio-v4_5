// Testing Checklist Types

export interface ChecklistItem {
  id: string;
  text: string;
  priority: 'P1' | 'P2' | 'P3' | 'V2';
}

export interface Category {
  title: string;
  items: ChecklistItem[];
}

export interface AINote {
  id: string;
  content: string;
  createdAt: number;
  resolved: boolean;
}

export interface ErrorLogEntry {
  id: string;
  type: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: number;
  stack?: string;
}

export interface AISuggestion {
  id: string;
  errorId: string;
  errorMessage: string;
  diagnosis: string;
  timestamp: number;
}

export interface BuildLogItem {
  category: string;
  items: { name: string; status: 'complete' | 'partial' | 'stub' | 'bug'; desc: string }[];
}

export interface MobileIssue {
  section: string;
  issue: string;
  priority: 'P1' | 'P2' | 'P3';
  status: 'tracked' | 'in-progress' | 'resolved';
}

export interface AIFeature {
  id: string;
  feature: string;
  location: string;
  purpose: string;
  withoutAI: string;
  fallback: string;
  apiUsed: string;
}

export interface PlanItem {
  id: string;
  num: number;
  text: string;
}

export interface PlanCategory {
  title: string;
  items: PlanItem[];
}

export type PlanResponse = 'yes' | 'no' | 'maybe' | 'later';
export type PlanPriority = 1 | 2 | 3;
