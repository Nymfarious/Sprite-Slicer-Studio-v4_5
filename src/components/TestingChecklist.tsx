import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ClipboardCheck, Download, Copy, Check, Bot, Trash2, Plus, Lightbulb, FileText, AlertTriangle, Play, Loader2, Paperclip, Smartphone, Cpu } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { SplitPane } from './SplitPane';
import { PipelineVisualization } from './PipelineVisualization';
import { CollapsibleSection } from './CollapsibleSection';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  text: string;
  priority: 'P1' | 'P2' | 'P3' | 'V2';
}

interface Category {
  title: string;
  items: ChecklistItem[];
}

interface AINote {
  id: string;
  content: string;
  createdAt: number;
  resolved: boolean;
}

interface ErrorLogEntry {
  id: string;
  type: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: number;
  stack?: string;
}

interface AISuggestion {
  id: string;
  errorId: string;
  errorMessage: string;
  diagnosis: string;
  timestamp: number;
}

interface BuildLogItem {
  category: string;
  items: { name: string; status: 'complete' | 'partial' | 'stub' | 'bug'; desc: string }[];
}

interface MobileIssue {
  section: string;
  issue: string;
  priority: 'P1' | 'P2' | 'P3';
  status: 'tracked' | 'in-progress' | 'resolved';
}

interface AIFeature {
  id: string;
  feature: string;
  location: string;
  purpose: string;
  withoutAI: string;
  fallback: string;
  apiUsed: string;
}

type PlanResponse = 'yes' | 'no' | 'maybe' | 'later';
type PlanPriority = 1 | 2 | 3;

interface PlanItem {
  id: string;
  num: number;
  text: string;
}

interface PlanCategory {
  title: string;
  items: PlanItem[];
}

const buildLog: BuildLogItem[] = [
  {
    category: "Layout & UI",
    items: [
      { name: "Resizable Two-Panel Layout", status: "complete", desc: "Drag handle between editor/library" },
      { name: "Responsive Mobile Stacking", status: "complete", desc: "Vertical layout on small screens" },
      { name: "Dark Theme with Accent Colors", status: "complete", desc: "Customizable via Preferences" },
      { name: "Tab Icons Added", status: "complete", desc: "Checklist ☑️ and Notes 📝 icons" },
      { name: "Tooltip Z-index Fix", status: "complete", desc: "Fixed .txt download tooltip overlap" },
      { name: "Tab Content Height", status: "complete", desc: "50%+ fill for all tabs" },
      { name: "Library Panel Opacity", status: "complete", desc: "85-90% backdrop blur" },
    ]
  },
  {
    category: "Image Upload",
    items: [
      { name: "Drag & Drop Upload", status: "complete", desc: "PNG, JPG, WebP support" },
      { name: "File Validation", status: "complete", desc: "Type and size (10MB) checks" },
      { name: "Empty State Guidance", status: "complete", desc: "Upload prompts in both panels" },
    ]
  },
  {
    category: "Slicing Engine",
    items: [
      { name: "Grid Presets (Cookie Cutter)", status: "complete", desc: "Merged with Grid Settings" },
      { name: "Visual Grid Overlay", status: "complete", desc: "Preview before slicing" },
      { name: "Manual Boundary Adjustment", status: "partial", desc: "Freeform drag deferred to V3" },
      { name: "Auto-naming Convention", status: "complete", desc: "sheet_name_row_col format" },
      { name: "10-Step Undo History", status: "complete", desc: "useUndoRedo hook" },
      { name: "Up/Down Buttons Styled", status: "complete", desc: "Improved visual design" },
    ]
  },
  {
    category: "Library Management",
    items: [
      { name: "Sprite Library Panel", status: "complete", desc: "Grid view with thumbnails" },
      { name: "Hover Metadata Tooltips", status: "complete", desc: "Size, source, slice info" },
      { name: "Delete with Confirmation", status: "complete", desc: "Modal confirmation dialog" },
      { name: "Clear All", status: "complete", desc: "Bulk delete with confirm" },
      { name: "Provenance Tracking", status: "complete", desc: "Link slices to source sheet" },
      { name: "Sort Options", status: "complete", desc: "Sort by name/date/size" },
      { name: "Tag Manager UI", status: "complete", desc: "View/edit/remove tags globally" },
    ]
  },
  {
    category: "Export System",
    items: [
      { name: "Individual PNG Export", status: "complete", desc: "Download single sprites" },
      { name: "ZIP Bundle Export", status: "complete", desc: "JSZip integration" },
      { name: "JSON Coordinates", status: "complete", desc: "Sprite atlas metadata" },
      { name: "Multi-select Export", status: "complete", desc: "Export Pack modal" },
      { name: "Re-pack Sheet", status: "complete", desc: "Combines sprites into sheet" },
    ]
  },
  {
    category: "AI Features",
    items: [
      { name: "AI Enhance Modal", status: "stub", desc: "Modal UI with sparkle badge" },
      { name: "Batch Processing Flow", status: "complete", desc: "Progress bar and completion screen" },
      { name: "Avatar Completion Screen", status: "complete", desc: "Replayable animation" },
      { name: "AI Error Analyzer", status: "complete", desc: "Edge function integration" },
    ]
  },
  {
    category: "Persistence",
    items: [
      { name: "localStorage Persistence", status: "complete", desc: "useLocalStorage hook" },
      { name: "Session Recovery", status: "complete", desc: "State restored on refresh" },
      { name: "Cloud Sync", status: "stub", desc: "Supabase connected, tables pending" },
    ]
  },
  {
    category: "Planning & Testing",
    items: [
      { name: "Testing Checklist Modal", status: "complete", desc: "This component!" },
      { name: "Plan Options Tab", status: "complete", desc: "30 items with Yes/No/Maybe/Later" },
      { name: "Build Log Tab", status: "complete", desc: "Feature changelog" },
      { name: "Error Log + AI Debugger", status: "complete", desc: "Split-screen error analysis" },
      { name: "Mind Map Flowchart", status: "complete", desc: "Mermaid diagram pane" },
    ]
  },
];

const planCategories: PlanCategory[] = [
  {
    title: "AI & Enhancement Features",
    items: [
      { id: "ai-flux", num: 1, text: "Connect AI Enhance to real Flux 2.5 image generation via Lovable AI Gateway?" },
      { id: "ai-auto-slice", num: 2, text: "Add AI-powered auto-detection of sprite boundaries (Magic Wand)?" },
      { id: "ai-upscale", num: 3, text: "Add AI upscaling for low-res sprites?" },
    ]
  },
  {
    title: "Export & Integration",
    items: [
      { id: "export-unity", num: 4, text: "Add Unity sprite sheet format export?" },
      { id: "export-godot", num: 5, text: "Add Godot sprite sheet format export?" },
      { id: "export-phaser", num: 6, text: "Add Phaser/Cocos game engine format export?" },
      { id: "export-trim", num: 7, text: "Add trim whitespace option for exports?" },
      { id: "export-binpack", num: 8, text: "Add optimal bin-packing algorithm for re-pack?" },
    ]
  },
  {
    title: "Library & Organization",
    items: [
      { id: "lib-folders", num: 9, text: "Add folder/collection organization for sprites?" },
      { id: "lib-tags", num: 10, text: "Add tagging system with filter by tags?" },
      { id: "lib-favorites", num: 11, text: "Add favorites/starring for quick access?" },
      { id: "lib-duplicates", num: 12, text: "Add duplicate detection for sprites?" },
    ]
  },
  {
    title: "Slicing Workflow",
    items: [
      { id: "slice-templates", num: 13, text: "Save custom grid presets as templates?" },
      { id: "slice-preview-anim", num: 14, text: "Add animation preview for sliced sprites?" },
      { id: "slice-batch-config", num: 15, text: "Add batch configuration (apply same grid to multiple sheets)?" },
      { id: "slice-smart-detect", num: 16, text: "Add smart edge detection for irregular sprites?" },
    ]
  },
  {
    title: "User Experience",
    items: [
      { id: "ux-keyboard", num: 17, text: "Add keyboard shortcuts (Ctrl+Z, Delete, Arrow keys)?" },
      { id: "ux-drag-reorder", num: 18, text: "Add drag-to-reorder in library?" },
      { id: "ux-zoom", num: 19, text: "Add zoom controls for editor canvas?" },
      { id: "ux-ruler", num: 20, text: "Add pixel ruler/guides overlay?" },
      { id: "ux-compare", num: 21, text: "Add before/after comparison view?" },
    ]
  },
  {
    title: "Cloud & Persistence",
    items: [
      { id: "cloud-sync", num: 22, text: "Enable Supabase cloud sync for library?" },
      { id: "cloud-share", num: 23, text: "Add shareable links for sprite packs?" },
      { id: "cloud-collab", num: 24, text: "Add team collaboration features?" },
      { id: "cloud-backup", num: 25, text: "Add automatic backup/versioning?" },
    ]
  },
  {
    title: "V2 Features (Stubs)",
    items: [
      { id: "v2-projects", num: 26, text: "Projects feature for grouping by game/genre/style?" },
      { id: "v2-animation", num: 27, text: "Animation stitching via Nano Banana?" },
      { id: "v2-a11y", num: 28, text: "Full accessibility (keyboard nav, screen readers, ARIA)?" },
      { id: "v2-mobile", num: 29, text: "Native mobile app version?" },
      { id: "v2-plugins", num: 30, text: "Plugin/extension system?" },
    ]
  },
];

// V2 COMPLETED items - pre-checked, kept for reference
const completedV2Items = [
  { id: "layout-1", text: "✅ Two-panel resizable layout (ResizablePanels.tsx with drag handle)", priority: "P1" as const },
  { id: "layout-2", text: "✅ Mobile responsive stacking (use-mobile hook + vertical layout)", priority: "P1" as const },
  { id: "upload-1", text: "✅ Upload with validation (ImageUpload.tsx - type/size checks)", priority: "P1" as const },
  { id: "upload-2", text: "✅ Empty states for editor & library panels", priority: "P1" as const },
  { id: "upload-3", text: "✅ PNG, JPG, WebP support in upload", priority: "P1" as const },
  { id: "upload-4", text: "✅ 10MB file size validation", priority: "P1" as const },
  { id: "slice-1", text: "✅ Grid presets in GridControls (merged Cookie Cutter)", priority: "P1" as const },
  { id: "slice-2", text: "✅ Visual grid overlay preview (EditorPanel canvas)", priority: "P1" as const },
  { id: "slice-4", text: "✅ Auto-naming: sheet_row_col format", priority: "P1" as const },
  { id: "slice-5", text: "✅ 10-step undo/redo (useUndoRedo hook)", priority: "P1" as const },
  { id: "lib-1", text: "✅ Library panel with hover metadata tooltips", priority: "P1" as const },
  { id: "lib-2", text: "✅ Delete confirmation modal", priority: "P1" as const },
  { id: "lib-3", text: "✅ Clear All with confirmation dialog", priority: "P1" as const },
  { id: "lib-4", text: "✅ Provenance tracking (sourceSheet in SpriteAsset)", priority: "P1" as const },
  { id: "lib-5", text: "✅ Sort by name/date/size in Library", priority: "P1" as const },
  { id: "lib-6", text: "✅ Search bar with filter in LibraryPanel", priority: "P1" as const },
  { id: "pref-1", text: "✅ Preferences panel (themes, export format, grid color)", priority: "P1" as const },
  { id: "pref-2", text: "✅ Click-outside closes PreferencesPanel", priority: "P1" as const },
  { id: "ai-1", text: "✅ BatchCompletionScreen with replayable avatar animation", priority: "P1" as const },
  { id: "ai-2", text: "✅ Batch processing flow with progress bar", priority: "P1" as const },
  { id: "ai-3", text: "✅ EnhanceModal stub (sparkle badge, prompt input)", priority: "P2" as const },
  { id: "export-1", text: "✅ Export individual sprites (useSpriteLibrary.exportAsset)", priority: "P1" as const },
  { id: "export-2", text: "✅ ZIP bundle export (JSZip in imageExport.ts)", priority: "P1" as const },
  { id: "export-3", text: "✅ JSON coordinates in ExportPackModal", priority: "P1" as const },
  { id: "export-4", text: "✅ Re-pack sheet from selection", priority: "P1" as const },
  { id: "persist-1", text: "✅ localStorage persistence (useLocalStorage hook)", priority: "P1" as const },
  { id: "persist-2", text: "✅ Supabase connected via Lovable Cloud", priority: "P1" as const },
  { id: "persist-3", text: "✅ Session recovery on refresh", priority: "P1" as const },
  { id: "map-1", text: "✅ FlowchartPanel with pipeline visualization", priority: "P2" as const },
  { id: "v2-tags", text: "✅ Tag system (useTags, TagManager, TagPickerPopover)", priority: "P1" as const },
  { id: "v2-themes", text: "✅ 10 theme presets (useTheme hook)", priority: "P1" as const },
  { id: "v2-zoom", text: "✅ Zoom controls (CollapsibleZoomPanel)", priority: "P1" as const },
  { id: "v2-crop", text: "✅ Crop tool (CropTool + useCropTool)", priority: "P1" as const },
  { id: "v2-freeform", text: "✅ Freeform slicing (FreeformSlicing + useFreeformSlicing)", priority: "P1" as const },
  { id: "v2-bgremoval", text: "✅ Background removal tool (BackgroundRemovalTool)", priority: "P1" as const },
  { id: "v2-keyboard", text: "✅ Keyboard shortcuts (useKeyboardShortcuts hook)", priority: "P1" as const },
  { id: "v2-projects", text: "✅ Projects system (useProjects, ProjectsBar, ProjectView)", priority: "P1" as const },
  { id: "v2-dirhandle", text: "✅ Directory handle persistence (useDirectoryHandle + IndexedDB)", priority: "P1" as const },
  { id: "v2-errorlog", text: "✅ Error log with AI analyzer (ErrorLogPanel + edge function)", priority: "P1" as const },
];

// NOT YET IMPLEMENTED - V3 Roadmap
const categories: Category[] = [
  {
    title: "🔴 Slicing Gaps (Not Implemented)",
    items: [
      { id: "slice-3", text: "Manual slice boundary adjustment (drag edges to resize individual cells)", priority: "P2" },
      { id: "slice-smart", text: "Smart edge detection for irregular sprites (auto-detect boundaries)", priority: "P3" },
    ]
  },
  {
    title: "🔴 Library Gaps (Not Implemented)",
    items: [
      { id: "lib-7", text: "Bulk delete (multi-select → delete in one action)", priority: "P2" },
      { id: "lib-8", text: "Bulk tagging (apply tags to multiple sprites at once)", priority: "P2" },
      { id: "lib-drag", text: "Drag-to-reorder sprites in library grid", priority: "P3" },
      { id: "lib-duplicates", text: "Duplicate detection (visual hash comparison)", priority: "P3" },
    ]
  },
  {
    title: "🔴 AI Features (Not Implemented)",
    items: [
      { id: "ai-flux", text: "Connect EnhanceModal to real Flux AI image generation", priority: "P2" },
      { id: "ai-upscale", text: "AI upscaling for low-res sprites", priority: "P3" },
      { id: "ai-auto-slice", text: "AI-powered auto-detection of sprite boundaries", priority: "P3" },
    ]
  },
  {
    title: "🔴 Export Gaps (Not Implemented)",
    items: [
      { id: "export-unity", text: "Unity sprite sheet format export", priority: "P3" },
      { id: "export-godot", text: "Godot sprite sheet format export", priority: "P3" },
      { id: "export-trim", text: "Trim whitespace option for exports", priority: "P2" },
      { id: "export-binpack", text: "Optimal bin-packing algorithm for re-pack", priority: "P3" },
    ]
  },
  {
    title: "🔴 Cloud Features (Not Implemented)",
    items: [
      { id: "cloud-sync", text: "Supabase cloud sync for library (save sprites to DB)", priority: "P2" },
      { id: "cloud-share", text: "Shareable links for sprite packs", priority: "P3" },
      { id: "cloud-backup", text: "Automatic backup/versioning", priority: "P3" },
    ]
  },
  {
    title: "🟡 V3 MVP: Animation Timeline",
    items: [
      { id: "v3-timeline", text: "Timeline node for stitching sprites into animation sequences", priority: "V2" },
      { id: "v3-tweening", text: "Tweening engine for smooth sprite transitions", priority: "V2" },
      { id: "v3-loading", text: "Loading screen generator from sprite sequences", priority: "V2" },
      { id: "v3-preview", text: "Real-time animation preview player", priority: "V2" },
      { id: "v3-export-gif", text: "Export animations as GIF/WebM/sprite sheets", priority: "V2" },
    ]
  },
];

export default function TestingChecklist() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>('testing-checklist-checked', {});
  const [itemNotes, setItemNotes] = useLocalStorage<Record<string, string>>('testing-checklist-item-notes', {});
  const [aiNotes, setAiNotes] = useLocalStorage<AINote[]>('testing-ai-notes', []);
  const [newNote, setNewNote] = useState('');
  const [copied, setCopied] = useState(false);

  // Plan Options state
  const [planResponses, setPlanResponses] = useLocalStorage<Record<string, PlanResponse>>('plan-responses', {});
  const [planPriorities, setPlanPriorities] = useLocalStorage<Record<string, PlanPriority>>('plan-priorities', {});
  const [planNotes, setPlanNotes] = useLocalStorage<Record<string, string>>('plan-notes', {});

  // Error Log state
  const [errorLog, setErrorLog] = useLocalStorage<ErrorLogEntry[]>('error-log-entries', []);
  const [aiSuggestions, setAiSuggestions] = useLocalStorage<AISuggestion[]>('ai-suggestions', []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeFilters, setActiveFilters] = useState<('complete' | 'partial' | 'stub' | 'bug')[]>([]);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalPlanItems = planCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const answeredPlanItems = Object.keys(planResponses).length;

  // Capture console errors
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      addErrorLog('error', message);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      addErrorLog('warn', message);
      originalWarn.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      addErrorLog('error', event.message, event.error?.stack);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addErrorLog('error', `Unhandled Promise: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const addErrorLog = useCallback((type: ErrorLogEntry['type'], message: string, stack?: string) => {
    const entry: ErrorLogEntry = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message: message.slice(0, 500),
      timestamp: Date.now(),
      stack,
    };
    setErrorLog(prev => [entry, ...prev].slice(0, 100));
  }, [setErrorLog]);

  const analyzeError = async (entry: ErrorLogEntry) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-error', {
        body: { error: entry.message, context: entry.stack || 'No stack trace' }
      });

      if (error) throw error;

      const suggestion: AISuggestion = {
        id: `sug-${Date.now()}`,
        errorId: entry.id,
        errorMessage: entry.message.slice(0, 100),
        diagnosis: data.suggestion || 'Unable to analyze',
        timestamp: Date.now(),
      };
      setAiSuggestions(prev => [suggestion, ...prev].slice(0, 50));
    } catch (err) {
      console.log('AI analysis failed:', err);
      const fallback: AISuggestion = {
        id: `sug-${Date.now()}`,
        errorId: entry.id,
        errorMessage: entry.message.slice(0, 100),
        diagnosis: 'AI analysis unavailable. Check the error message and stack trace manually.',
        timestamp: Date.now(),
      };
      setAiSuggestions(prev => [fallback, ...prev].slice(0, 50));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAITest = async () => {
    setIsRunningTest(true);
    addErrorLog('info', '🤖 AI Test started - checking UI elements...');

    // Simulate checking for common UI issues
    await new Promise(r => setTimeout(r, 500));
    
    const checks = [
      { selector: '[data-testid="upload-zone"]', name: 'Upload zone', found: !!document.querySelector('.border-dashed') },
      { selector: 'button', name: 'Buttons', found: document.querySelectorAll('button').length > 0 },
      { selector: '[role="dialog"]', name: 'Modal system', found: true },
      { selector: '.grid', name: 'Grid layouts', found: document.querySelectorAll('.grid').length > 0 },
    ];

    for (const check of checks) {
      await new Promise(r => setTimeout(r, 300));
      if (check.found) {
        addErrorLog('info', `✅ ${check.name}: Found`);
      } else {
        addErrorLog('warn', `⚠️ ${check.name}: Not found or hidden`);
      }
    }

    await new Promise(r => setTimeout(r, 500));
    addErrorLog('info', '🤖 AI Test complete. Review results above.');
    setIsRunningTest(false);
  };

  const clearErrorLog = () => setErrorLog([]);
  const clearSuggestions = () => setAiSuggestions([]);

  const handleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleItemNote = (id: string, note: string) => {
    setItemNotes(prev => ({ ...prev, [id]: note }));
  };

  const handlePlanResponse = (id: string, value: PlanResponse) => {
    setPlanResponses(prev => ({ ...prev, [id]: value }));
  };

  const handlePlanPriority = (id: string, value: PlanPriority) => {
    setPlanPriorities(prev => {
      if (prev[id] === value) {
        const newPriorities = { ...prev };
        delete newPriorities[id];
        return newPriorities;
      }
      return { ...prev, [id]: value };
    });
  };

  const handlePlanNote = (id: string, note: string) => {
    setPlanNotes(prev => ({ ...prev, [id]: note }));
  };

  const addAINote = () => {
    if (!newNote.trim()) return;
    const note: AINote = {
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      createdAt: Date.now(),
      resolved: false,
    };
    setAiNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const toggleNoteResolved = (id: string) => {
    setAiNotes(prev => prev.map(n => n.id === id ? { ...n, resolved: !n.resolved } : n));
  };

  const deleteNote = (id: string) => {
    setAiNotes(prev => prev.filter(n => n.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-rose-400';
      case 'P2': return 'text-orange-400';
      case 'P3': return 'text-sky-400';
      case 'V2': return 'text-zinc-500';
      default: return 'text-muted-foreground';
    }
  };

  const getResponseStyle = (id: string, value: PlanResponse) => {
    const isSelected = planResponses[id] === value;
    const base = "px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer";
    if (!isSelected) return `${base} bg-muted text-muted-foreground hover:bg-muted/80`;
    if (value === 'yes') return `${base} bg-emerald-600 text-white`;
    if (value === 'no') return `${base} bg-red-600 text-white`;
    if (value === 'maybe') return `${base} bg-amber-600 text-white`;
    if (value === 'later') return `${base} bg-zinc-500 text-white`;
    return base;
  };

  const getPlanPriorityStyle = (id: string, value: PlanPriority) => {
    const isSelected = planPriorities[id] === value;
    const base = "w-6 h-6 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center";
    if (!isSelected) return `${base} bg-muted text-muted-foreground hover:bg-muted/80`;
    if (value === 1) return `${base} bg-rose-500 text-white`;
    if (value === 2) return `${base} bg-orange-500 text-white`;
    if (value === 3) return `${base} bg-sky-500 text-white`;
    return base;
  };

  const priorityLabel = (p: PlanPriority) => {
    if (p === 1) return 'P1-Must';
    if (p === 2) return 'P2-Should';
    if (p === 3) return 'P3-Nice';
    return '';
  };

  const getLogColor = (type: ErrorLogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-zinc-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusEmoji = (status: 'complete' | 'partial' | 'stub' | 'bug') => {
    switch (status) {
      case 'complete': return '✅';
      case 'partial': return '🔨';
      case 'stub': return '📋';
      case 'bug': return '🐛';
    }
  };

  // Mobile considerations data - comprehensive tracking (do NOT implement yet)
  const mobileIssues: MobileIssue[] = [
    // Library
    { section: 'Library', issue: 'Thumbnail grid needs responsive columns', priority: 'P2', status: 'tracked' },
    { section: 'Library', issue: 'Drag-to-project not touch-friendly', priority: 'P3', status: 'tracked' },
    { section: 'Library', issue: 'Filter chips overflow on small screens', priority: 'P2', status: 'tracked' },
    
    // Splicing Mat
    { section: 'Splicing Mat', issue: 'Canvas gestures need touch support (pinch zoom, two-finger pan)', priority: 'P1', status: 'tracked' },
    { section: 'Splicing Mat', issue: 'Icon bar too small for touch targets (44px min)', priority: 'P1', status: 'tracked' },
    { section: 'Splicing Mat', issue: 'Elastic Grid fence handles too small', priority: 'P2', status: 'tracked' },
    { section: 'Splicing Mat', issue: 'Grid Settings wheel-scroll won\'t work on touch', priority: 'P2', status: 'tracked' },
    
    // Mending Loom
    { section: 'Mending Loom', issue: 'Timeline too cramped, needs horizontal scroll', priority: 'P1', status: 'tracked' },
    { section: 'Mending Loom', issue: 'Keyframe drag needs touch events', priority: 'P1', status: 'tracked' },
    { section: 'Mending Loom', issue: 'Preview panel aspect ratio breaks on portrait', priority: 'P2', status: 'tracked' },
    { section: 'Mending Loom', issue: 'Playback controls need larger touch targets', priority: 'P2', status: 'tracked' },
    
    // Animation Loom
    { section: 'Animation Loom', issue: 'Thread rows too thin for touch', priority: 'P2', status: 'tracked' },
    { section: 'Animation Loom', issue: 'FPS slider needs touch-friendly alternative', priority: 'P3', status: 'tracked' },
    
    // General
    { section: 'General', issue: 'Keyboard shortcuts need on-screen alternatives', priority: 'P1', status: 'tracked' },
    { section: 'General', issue: 'Popovers need bottom-sheet alternative on mobile', priority: 'P2', status: 'tracked' },
    { section: 'General', issue: 'Panel dividers need swipe gestures', priority: 'P2', status: 'tracked' },
    { section: 'General', issue: 'Tab toggle needs swipeable tabs', priority: 'P3', status: 'tracked' },
  ];

  // AI integrations data
  const aiFeatures: AIFeature[] = [
    {
      id: 'ai-1',
      feature: 'Generate Pose',
      location: 'Library header',
      purpose: 'Create a single missing sprite pose from text description',
      withoutAI: 'Button disabled, user must create pose manually in external app',
      fallback: 'None — requires AI',
      apiUsed: 'Gemini / Nano Banana',
    },
    {
      id: 'ai-2',
      feature: 'Generate Sheet',
      location: 'Library header',
      purpose: 'Create entire sprite sheet from character + action description',
      withoutAI: 'Button disabled, user must import existing sheets',
      fallback: 'None — requires AI',
      apiUsed: 'Gemini / Nano Banana',
    },
    {
      id: 'ai-3',
      feature: 'AI Artifact Detector',
      location: 'Splicing Mat icon bar',
      purpose: 'Scan selected cells for visual artifacts and offer to clean them',
      withoutAI: 'Button disabled, user must spot artifacts manually',
      fallback: 'None — requires AI',
      apiUsed: 'Gemini Vision',
    },
    {
      id: 'ai-4',
      feature: 'AI Background Removal',
      location: 'Background panel',
      purpose: 'Intelligently detect and remove complex backgrounds',
      withoutAI: '"Remove Solid" still works (color-based removal)',
      fallback: 'Solid color removal only',
      apiUsed: 'Gemini / remove.bg API',
    },
    {
      id: 'ai-5',
      feature: 'Magic Wand (Smart Detect)',
      location: 'Slicer tools',
      purpose: 'Auto-detect sprite boundaries on irregular sheets',
      withoutAI: 'Falls back to color-based edge detection (less accurate)',
      fallback: 'Color-based detection',
      apiUsed: 'Gemini Vision',
    },
    {
      id: 'ai-6',
      feature: 'Motion Blur',
      location: 'Mending Loom',
      purpose: 'Generate blurred in-between frames for fast motion',
      withoutAI: 'Falls back to CSS blur + opacity blend (less realistic)',
      fallback: 'Math-based blur',
      apiUsed: 'Gemini / Nano Banana',
    },
    {
      id: 'ai-7',
      feature: 'Loop Smoothing',
      location: 'Export options',
      purpose: 'Generate transition frames between last and first frame',
      withoutAI: 'Disabled — user must manually create loop frames',
      fallback: 'None — requires AI',
      apiUsed: 'Nano Banana',
    },
    {
      id: 'ai-8',
      feature: 'AI Library Analyzer',
      location: 'Library (future)',
      purpose: 'Suggest best keyframes, detect duplicates, recommend sequence order',
      withoutAI: 'Disabled — user must organize manually',
      fallback: 'Manual sorting only',
      apiUsed: 'Gemini Vision',
    },
  ];

  const generateBuildReport = () => {
    const timestamp = new Date().toISOString();
    const report = `
# Sprite Slicer Studio — Build Report
Generated: ${timestamp}
Version: 4.1

## Plan Options Summary
✅ Yes: ${Object.values(planResponses).filter(r => r === 'yes').length}
❌ No: ${Object.values(planResponses).filter(r => r === 'no').length}
🤔 Maybe: ${Object.values(planResponses).filter(r => r === 'maybe').length}
⏳ Later: ${Object.values(planResponses).filter(r => r === 'later').length}

## Plan Details
${planCategories.map(cat => `### ${cat.title}\n${cat.items.map(item => {
  const response = planResponses[item.id] || 'unanswered';
  const priority = planPriorities[item.id];
  const note = planNotes[item.id];
  return `- [${response.toUpperCase()}] ${item.num}. ${item.text}${priority ? ` (P${priority})` : ''}${note ? `\n  Note: ${note}` : ''}`;
}).join('\n')}`).join('\n\n')}

## Build Log
${buildLog.map(cat => `### ${cat.category}\n${cat.items.map(item => `- [${item.status.toUpperCase()}] ${item.name}: ${item.desc}`).join('\n')}`).join('\n\n')}

## Checklist (${checkedCount}/${totalItems})
${categories.map(cat => `### ${cat.title}\n${cat.items.map(item => `- [${checkedItems[item.id] ? 'x' : ' '}] ${item.text} (${item.priority})`).join('\n')}`).join('\n\n')}

## Errors (${errorLog.filter(e => e.type === 'error').length})
${errorLog.filter(e => e.type === 'error').slice(0, 10).map(err => `- ${err.message.slice(0, 100)}`).join('\n')}

## Notes (${aiNotes.filter(n => !n.resolved).length} unresolved)
${aiNotes.map(note => `- [${note.resolved ? 'RESOLVED' : 'OPEN'}] ${note.content}`).join('\n')}

## Mobile Considerations (${mobileIssues.filter(i => i.priority === 'P1').length} P1 issues)
${mobileIssues.map(issue => `- [${issue.section}] ${issue.issue} (${issue.priority})`).join('\n')}

## AI Dependencies
${aiFeatures.map(f => `- ${f.feature}: ${f.fallback} (${f.apiUsed})`).join('\n')}
`.trim();

    navigator.clipboard.writeText(report);
  };

  const generateExport = (format: 'md' | 'txt') => {
    const timestamp = new Date().toISOString().split('T')[0];
    let output = format === 'md' 
      ? `# Sprite Slicer Testing & Planning Report\n**Date:** ${timestamp}\n\n---\n\n`
      : `SPRITE SLICER TESTING & PLANNING REPORT\nDate: ${timestamp}\n\n`;

    const yesCount = Object.values(planResponses).filter(r => r === 'yes').length;
    const noCount = Object.values(planResponses).filter(r => r === 'no').length;
    const maybeCount = Object.values(planResponses).filter(r => r === 'maybe').length;
    const laterCount = Object.values(planResponses).filter(r => r === 'later').length;

    output += format === 'md' ? `## Plan Options Summary\n\n` : `PLAN OPTIONS SUMMARY\n${'='.repeat(40)}\n`;
    output += `✅ Yes: ${yesCount} | ❌ No: ${noCount} | 🤔 Maybe: ${maybeCount} | ⏳ Later: ${laterCount}\n\n`;

    planCategories.forEach(category => {
      output += format === 'md' ? `### ${category.title}\n\n` : `${category.title.toUpperCase()}\n${'-'.repeat(40)}\n`;
      category.items.forEach(item => {
        const response = planResponses[item.id] || 'unanswered';
        const priority = planPriorities[item.id];
        const note = planNotes[item.id];
        const emoji = { yes: '✅', no: '❌', maybe: '🤔', later: '⏳', unanswered: '⬜' }[response];
        output += `${item.num}. ${item.text}\n`;
        output += `   Response: ${emoji} ${response.toUpperCase()}`;
        if (priority) output += ` | Priority: ${priorityLabel(priority)}`;
        output += '\n';
        if (note) output += `   Note: ${note}\n`;
        output += '\n';
      });
    });

    output += format === 'md' ? `---\n\n## Testing Checklist\n**Progress:** ${checkedCount}/${totalItems}\n\n` 
      : `\nTESTING CHECKLIST (${checkedCount}/${totalItems})\n${'='.repeat(40)}\n`;

    categories.forEach(category => {
      output += format === 'md' ? `### ${category.title}\n\n` : `${category.title.toUpperCase()}\n${'-'.repeat(40)}\n`;
      category.items.forEach(item => {
        const checked = checkedItems[item.id];
        const note = itemNotes[item.id];
        const checkbox = format === 'md' ? (checked ? '[x]' : '[ ]') : (checked ? '[✓]' : '[ ]');
        output += `${checkbox} ${item.text} (${item.priority})`;
        if (note) output += `\n   Note: ${note}`;
        output += '\n';
      });
      output += '\n';
    });

    if (aiNotes.length > 0) {
      output += format === 'md' ? `---\n\n## AI Agent Notes\n\n` : `\nAI AGENT NOTES\n${'='.repeat(40)}\n`;
      aiNotes.forEach(note => {
        const status = note.resolved ? '✅ RESOLVED' : '⚠️ OPEN';
        const date = new Date(note.createdAt).toLocaleDateString();
        output += `- [${status}] (${date}): ${note.content}\n`;
      });
    }

    output += format === 'md' ? `\n---\n\n## Action Items\n\n` : `\nACTION ITEMS\n${'='.repeat(40)}\n`;
    output += format === 'md' ? `### Approved (Yes + P1)\n` : `APPROVED (Yes + P1)\n`;
    planCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (planResponses[item.id] === 'yes' && planPriorities[item.id] === 1) {
          output += `- [ ] #${item.num}: ${item.text}\n`;
        }
      });
    });
    output += format === 'md' ? `\n### Should Do (Yes + P2)\n` : `\nSHOULD DO (Yes + P2)\n`;
    planCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (planResponses[item.id] === 'yes' && planPriorities[item.id] === 2) {
          output += `- [ ] #${item.num}: ${item.text}\n`;
        }
      });
    });
    output += format === 'md' ? `\n### Defer to V2 (Later)\n` : `\nDEFER TO V2 (Later)\n`;
    planCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (planResponses[item.id] === 'later') {
          output += `- [ ] #${item.num}: ${item.text}\n`;
        }
      });
    });

    return output;
  };

  const handleCopy = async () => {
    const content = generateExport('md');
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const content = generateExport(format);
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprite-slicer-report-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const unresolvedNotes = aiNotes.filter(n => !n.resolved).length;
  const errorCount = errorLog.filter(e => e.type === 'error').length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-4 right-4 z-50 gap-2 shadow-lg bg-background/95 backdrop-blur"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Testing</span>
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {checkedCount}/{totalItems}
          </span>
          {errorCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {errorCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4" aria-describedby="testing-dialog-description">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Testing & Planning</span>
            <div className="flex gap-2 mr-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { generateBuildReport(); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                title="Copy full build report to clipboard"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy Build Report'}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDownload('md')} title="Download as Markdown file">
                <Download className="w-4 h-4" />
                <span className="ml-1 text-xs">.md</span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload('txt')}>
                    <Download className="w-4 h-4" />
                    <span className="ml-1 text-xs">.txt</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8} className="z-[200]">
                  Download as plain text file
                </TooltipContent>
              </Tooltip>
            </div>
          </DialogTitle>
          <p id="testing-dialog-description" className="sr-only">Testing and planning dialog with checklist, build log, plan options, error log, and notes tabs</p>
        </DialogHeader>

        <Tabs defaultValue="plan" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-6 shrink-0 bg-secondary/50">
            <TabsTrigger 
              value="plan" 
              className="gap-1.5 text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Plan
            </TabsTrigger>
            <TabsTrigger 
              value="buildlog" 
              className="gap-1.5 text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
            >
              <FileText className="w-3.5 h-3.5" />
              Build Log
            </TabsTrigger>
            <TabsTrigger 
              value="checklist" 
              className="gap-1.5 text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Checklist
            </TabsTrigger>
            <TabsTrigger 
              value="errors" 
              className="gap-1.5 text-xs relative data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Errors
              {errorCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">{errorCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="gap-1.5 text-xs relative data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
            >
              <Paperclip className="w-3.5 h-3.5" />
              Notes
              {unresolvedNotes > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1 rounded-full">
                  {unresolvedNotes}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="dependencies" 
              className="gap-1.5 text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
            >
              <Cpu className="w-3.5 h-3.5" />
              Deps
            </TabsTrigger>
          </TabsList>

          {/* Plan Options Tab - Split Screen */}
          <TabsContent value="plan" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <SplitPane
              top={
                <div className="h-full flex flex-col">
                  <div className="text-xs text-muted-foreground mb-3 flex items-center gap-4 shrink-0 px-1">
                    <span>Response: <span className="text-emerald-400">Yes</span> / <span className="text-red-400">No</span> / <span className="text-amber-400">Maybe</span> / <span className="text-zinc-400">Later</span></span>
                    <span>Priority: <span className="text-rose-400">1</span>=Must <span className="text-orange-400">2</span>=Should <span className="text-sky-400">3</span>=Nice</span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-6 pb-4 pr-4">
                      {planCategories.map(category => (
                        <div key={category.title} className="bg-muted/30 rounded-lg p-3">
                          <h3 className="font-semibold text-sm border-b border-border pb-2 mb-3 text-cyan-400">{category.title}</h3>
                          <div className="space-y-4">
                            {category.items.map(item => (
                              <div key={item.id} className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-sm leading-relaxed flex-1">
                                    <span className="text-muted-foreground font-mono mr-2">{item.num}.</span>
                                    {item.text}
                                  </span>
                                  <div className="flex gap-2 shrink-0 items-center">
                                    <div className="flex gap-1">
                                      {(['yes', 'no', 'maybe', 'later'] as PlanResponse[]).map(val => (
                                        <button
                                          key={val}
                                          onClick={() => handlePlanResponse(item.id, val)}
                                          className={getResponseStyle(item.id, val)}
                                        >
                                          {val.charAt(0).toUpperCase() + val.slice(1)}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="flex gap-1 border-l border-border pl-2">
                                      {([1, 2, 3] as PlanPriority[]).map(p => (
                                        <button
                                          key={p}
                                          onClick={() => handlePlanPriority(item.id, p)}
                                          className={getPlanPriorityStyle(item.id, p)}
                                        >
                                          {p}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {planResponses[item.id] && (
                                  <input
                                    type="text"
                                    placeholder="Add a note (optional)..."
                                    value={planNotes[item.id] || ''}
                                    onChange={(e) => handlePlanNote(item.id, e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded px-2 py-1 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              }
              bottom={
                <div className="h-full flex flex-col bg-secondary/20 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Additional Notes & Export</h4>
                  <Textarea 
                    placeholder="Add additional planning notes here..."
                    className="flex-1 min-h-[60px] text-xs resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload('md')} className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Export Plan
                    </Button>
                  </div>
                </div>
              }
              defaultTopHeight={65}
              minTopHeight={50}
            />
          </TabsContent>

          {/* Build Log Tab - Split with Pipeline */}
          <TabsContent value="buildlog" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <SplitPane
              top={
                <div className="h-full flex flex-col">
                  <div className="text-xs text-muted-foreground mb-2 shrink-0 flex items-center gap-2">
                    <span className="text-cyan-400 font-semibold">Pipeline Visualization</span>
                    <span className="text-muted-foreground">— Click nodes to navigate</span>
                  </div>
                  <div className="flex-1 bg-muted/20 rounded-lg p-4 overflow-auto">
                    <PipelineVisualization 
                      onNodeClick={(nodeId) => {
                        console.log('Navigate to:', nodeId);
                      }}
                    />
                  </div>
                </div>
              }
              bottom={
                <div className="h-full flex flex-col">
                  <div className="text-xs text-muted-foreground mb-2 shrink-0 flex flex-wrap items-center gap-1">
                    <span className="mr-1">Filter:</span>
                    {(['complete', 'partial', 'stub', 'bug'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setActiveFilters(prev => 
                          prev.includes(status) 
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        )}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors",
                          activeFilters.includes(status) 
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent border-border hover:bg-accent"
                        )}
                      >
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          status === 'complete' && "bg-green-500",
                          status === 'partial' && "bg-yellow-500",
                          status === 'stub' && "bg-gray-500",
                          status === 'bug' && "bg-red-500",
                        )} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                    {activeFilters.length > 0 && (
                      <button 
                        onClick={() => setActiveFilters([])}
                        className="text-xs text-muted-foreground hover:text-foreground ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pb-4 pr-4">
                      {buildLog.map(cat => {
                        const filteredItems = activeFilters.length === 0 
                          ? cat.items 
                          : cat.items.filter(item => activeFilters.includes(item.status));
                        
                        if (filteredItems.length === 0) return null;
                        
                        return (
                          <CollapsibleSection key={cat.category} title={cat.category} defaultOpen>
                            <div className="space-y-1 py-2">
                              {filteredItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                                    item.status === 'complete' && 'bg-success/20 text-success',
                                    item.status === 'partial' && 'bg-warning/20 text-warning',
                                    item.status === 'stub' && 'bg-muted text-muted-foreground',
                                    item.status === 'bug' && 'bg-red-500/20 text-red-400',
                                  )}>
                                    {getStatusEmoji(item.status)}
                                  </span>
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-muted-foreground">— {item.desc}</span>
                                </div>
                              ))}
                            </div>
                          </CollapsibleSection>
                        );
                      })}
                      {activeFilters.length > 0 && buildLog.every(cat => 
                        cat.items.filter(item => activeFilters.includes(item.status)).length === 0
                      ) && (
                        <div className="text-center text-muted-foreground py-8">
                          No items match selected filters
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              }
              defaultTopHeight={40}
              minTopHeight={30}
              maxTopHeight={60}
            />
          </TabsContent>

          {/* Feature Checklist Tab - Split with Archive */}
          <TabsContent value="checklist" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <SplitPane
              top={
                <div className="h-full flex flex-col">
                  <div className="text-xs text-muted-foreground mb-3 shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">P1</span> Must Have
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">P2</span> Should Have
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">P3</span> Nice to Have
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-zinc-500/20 text-zinc-400">V2</span> Stub Only
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-6 pb-4 pr-4">
                      {categories.map(category => (
                        <div key={category.title} className="space-y-2">
                          <h3 className="font-semibold text-sm border-b border-border pb-1 text-cyan-400">{category.title}</h3>
                          {category.items.filter(item => !checkedItems[item.id]).map(item => (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={item.id}
                                  checked={checkedItems[item.id] || false}
                                  onCheckedChange={() => handleCheck(item.id)}
                                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                                />
                                <label
                                  htmlFor={item.id}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {item.text}
                                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                    item.priority === 'P1' ? 'bg-rose-500/20 text-rose-400' :
                                    item.priority === 'P2' ? 'bg-orange-500/20 text-orange-400' :
                                    item.priority === 'P3' ? 'bg-sky-500/20 text-sky-400' :
                                    'bg-zinc-500/20 text-zinc-400'
                                  }`}>
                                    {item.priority}
                                  </span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              }
              bottom={
                <div className="h-full flex flex-col bg-success/5 rounded-lg p-3 border border-success/20">
                  <h4 className="text-xs font-semibold text-success mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    Completed Items Archive ({Object.values(checkedItems).filter(Boolean).length})
                  </h4>
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-2">
                      {categories.flatMap(cat => cat.items).filter(item => checkedItems[item.id]).map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-success shrink-0" />
                          <span className="line-through">{item.text}</span>
                          {itemNotes[item.id] && (
                            <span className="text-[10px] italic ml-auto">"{itemNotes[item.id]}"</span>
                          )}
                        </div>
                      ))}
                      {Object.values(checkedItems).filter(Boolean).length === 0 && (
                        <p className="text-xs text-muted-foreground/60 text-center py-4">
                          Completed items will appear here
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              }
              defaultTopHeight={60}
              minTopHeight={50}
            />
          </TabsContent>

          {/* Error Log + AI Debugger Tab - Draggable Split */}
          <TabsContent value="errors" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex gap-2 mb-2 shrink-0">
              <Button size="sm" variant="outline" onClick={runAITest} disabled={isRunningTest} className="text-xs border-cyan-500/30 hover:bg-cyan-500/10">
                {isRunningTest ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                Run AI Test
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSuggestions} className="text-xs">Clear Suggestions</Button>
            </div>

            <SplitPane
              top={
                <div className="h-full border border-cyan-500/30 rounded-lg flex flex-col bg-cyan-500/5">
                  <div className="px-2 py-1.5 bg-cyan-500/10 border-b border-cyan-500/30 text-xs font-medium flex items-center gap-2 text-cyan-400">
                    <Bot className="w-3 h-3" />
                    AI Suggestions
                    {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin" />}
                  </div>
                  <ScrollArea className="flex-1 p-2">
                    {aiSuggestions.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Click an error below to get AI analysis
                      </div>
                    ) : (
                      <div className="space-y-2 pb-4">
                        {aiSuggestions.map(sug => (
                          <div key={sug.id} className="bg-muted/30 rounded p-2 text-xs border border-border/50">
                            <div className="text-red-400 font-mono truncate mb-1">{sug.errorMessage}</div>
                            <div className="text-foreground">{sug.diagnosis}</div>
                            <div className="text-muted-foreground text-[10px] mt-1">
                              {new Date(sug.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              }
              bottom={
                <div className="h-full border border-border rounded-lg flex flex-col">
                  <div className="px-2 py-1.5 bg-muted/50 border-b border-border text-xs font-medium flex items-center justify-between">
                    <span>Console Log ({errorLog.length})</span>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-red-400">{errorLog.filter(e => e.type === 'error').length} errors</span>
                        <span className="text-yellow-400">{errorLog.filter(e => e.type === 'warn').length} warns</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={clearErrorLog} className="text-[10px] h-5 px-1.5">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear Log
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-2">
                    {errorLog.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        No logs captured yet
                      </div>
                    ) : (
                      <div className="space-y-1 pb-4">
                        {errorLog.map(entry => (
                          <div 
                            key={entry.id} 
                            className={`text-[10px] leading-tight cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5 ${getLogColor(entry.type)}`}
                            onClick={() => entry.type === 'error' && analyzeError(entry)}
                            title={entry.type === 'error' ? 'Click to analyze with AI' : ''}
                          >
                            <span className="text-muted-foreground">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                            {' '}
                            <span className={`uppercase font-semibold px-1 rounded ${
                              entry.type === 'error' ? 'bg-red-500/20' : 
                              entry.type === 'warn' ? 'bg-yellow-500/20' : 
                              'bg-blue-500/20'
                            }`}>[{entry.type}]</span>
                            {' '}
                            {entry.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              }
              defaultTopHeight={45}
              minTopHeight={30}
            />
          </TabsContent>

          {/* AI Notes Tab - Split with Attachments */}
          <TabsContent value="notes" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <SplitPane
              top={
                <div className="h-full flex flex-col">
                  <div className="flex gap-2 mb-3 shrink-0">
                    <Textarea
                      placeholder="Add a note about what's not working or needs attention..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] border-cyan-500/30 focus:border-cyan-500"
                    />
                    <Button onClick={addAINote} disabled={!newNote.trim()} className="shrink-0 bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pb-4 pr-4">
                      {aiNotes.filter(n => !n.resolved).length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No active notes. Add issues above.</p>
                        </div>
                      ) : (
                        aiNotes.filter(n => !n.resolved).map(note => (
                          <div
                            key={note.id}
                            className="p-3 rounded-lg border bg-destructive/10 border-destructive/30"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{note.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(note.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleNoteResolved(note.id)}
                                  className="text-green-500 hover:bg-green-500/10"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNote(note.id)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              }
              bottom={
                <div className="h-full flex flex-col bg-muted/20 rounded-lg p-3 border border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="w-3 h-3" />
                    Resolved Notes ({aiNotes.filter(n => n.resolved).length})
                  </h4>
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-2">
                      {aiNotes.filter(n => n.resolved).map(note => (
                        <div
                          key={note.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded bg-success/5 border border-success/20"
                        >
                          <Check className="w-3 h-3 text-success shrink-0" />
                          <span className="line-through flex-1">{note.content}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {aiNotes.filter(n => n.resolved).length === 0 && (
                        <p className="text-xs text-muted-foreground/60 text-center py-4">
                          Resolved notes will appear here
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              }
              defaultTopHeight={60}
              minTopHeight={50}
            />
          </TabsContent>

          {/* Dependencies Tab - Mobile + AI */}
          <TabsContent value="dependencies" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-2">
                {/* Mobile Section - Table View */}
                <CollapsibleSection title={`📱 Mobile Considerations (${mobileIssues.filter(i => i.priority === 'P1').length} P1 issues)`} defaultOpen>
                  <div className="py-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="p-2 font-medium text-muted-foreground">Section</th>
                          <th className="p-2 font-medium text-muted-foreground">Issue</th>
                          <th className="p-2 font-medium text-muted-foreground">Priority</th>
                          <th className="p-2 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mobileIssues.map((item, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-2 font-medium whitespace-nowrap">{item.section}</td>
                            <td className="p-2">{item.issue}</td>
                            <td className="p-2">
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                item.priority === 'P1' && "bg-red-500/20 text-red-400",
                                item.priority === 'P2' && "bg-yellow-500/20 text-yellow-400",
                                item.priority === 'P3' && "bg-blue-500/20 text-blue-400"
                              )}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="p-2 text-muted-foreground capitalize">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleSection>
                
                {/* AI Section - Table View */}
                <CollapsibleSection title={`🤖 AI Integrations — What Breaks Without AI?`} defaultOpen>
                  <div className="py-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="p-2 font-medium text-muted-foreground">Feature</th>
                          <th className="p-2 font-medium text-muted-foreground">Purpose</th>
                          <th className="p-2 font-medium text-muted-foreground">Without AI</th>
                          <th className="p-2 font-medium text-muted-foreground">Fallback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiFeatures.map((item) => (
                          <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-2 font-medium whitespace-nowrap">{item.feature}</td>
                            <td className="p-2 text-muted-foreground">{item.purpose}</td>
                            <td className="p-2">{item.withoutAI}</td>
                            <td className="p-2">
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                item.fallback === 'None — requires AI' 
                                  ? "bg-red-500/20 text-red-400" 
                                  : "bg-green-500/20 text-green-400"
                              )}>
                                {item.fallback}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleSection>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {checkedCount === totalItems && answeredPlanItems === totalPlanItems && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-500 font-medium">🎉 All items reviewed! Export your results above.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
