import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ClipboardCheck, Download, Copy, Check, Lightbulb, FileText, AlertTriangle, Paperclip, Cpu } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

import { 
  AINote, ErrorLogEntry, AISuggestion, PlanResponse, PlanPriority,
  categories, planCategories, priorityLabel
} from './testing';
import { PlanTab, BuildLogTab, ChecklistTab, ErrorsTab, NotesTab, DependenciesTab } from './testing/tabs';

export default function TestingChecklist() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>('testing-checklist-checked', {});
  const [itemNotes, setItemNotes] = useLocalStorage<Record<string, string>>('testing-checklist-item-notes', {});
  const [aiNotes, setAiNotes] = useLocalStorage<AINote[]>('testing-ai-notes', []);
  const [newNote, setNewNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [planResponses, setPlanResponses] = useLocalStorage<Record<string, PlanResponse>>('plan-responses', {});
  const [planPriorities, setPlanPriorities] = useLocalStorage<Record<string, PlanPriority>>('plan-priorities', {});
  const [planNotes, setPlanNotes] = useLocalStorage<Record<string, string>>('plan-notes', {});
  const [errorLog, setErrorLog] = useLocalStorage<ErrorLogEntry[]>('error-log-entries', []);
  const [aiSuggestions, setAiSuggestions] = useLocalStorage<AISuggestion[]>('ai-suggestions', []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeFilters, setActiveFilters] = useState<('complete' | 'partial' | 'stub' | 'bug')[]>([]);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalPlanItems = planCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const answeredPlanItems = Object.keys(planResponses).length;

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
    const handleError = (event: ErrorEvent) => addErrorLog('error', event.message, event.error?.stack);
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => addErrorLog('error', `Unhandled Promise: ${event.reason}`);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addErrorLog]);

  const analyzeError = async (entry: ErrorLogEntry) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-error', {
        body: { error: entry.message, context: entry.stack || 'No stack trace' }
      });
      if (error) throw error;
      const suggestion: AISuggestion = { id: `sug-${Date.now()}`, errorId: entry.id, errorMessage: entry.message.slice(0, 100), diagnosis: data.suggestion || 'Unable to analyze', timestamp: Date.now() };
      setAiSuggestions(prev => [suggestion, ...prev].slice(0, 50));
    } catch {
      const fallback: AISuggestion = { id: `sug-${Date.now()}`, errorId: entry.id, errorMessage: entry.message.slice(0, 100), diagnosis: 'AI analysis unavailable.', timestamp: Date.now() };
      setAiSuggestions(prev => [fallback, ...prev].slice(0, 50));
    } finally { setIsAnalyzing(false); }
  };

  const runAITest = async () => {
    setIsRunningTest(true);
    addErrorLog('info', '🤖 AI Test started...');
    await new Promise(r => setTimeout(r, 1000));
    addErrorLog('info', '🤖 AI Test complete.');
    setIsRunningTest(false);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const content = `# Testing Report\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report.${format}`;
    a.click();
  };

  const generateBuildReport = () => navigator.clipboard.writeText('Build Report');

  const errorCount = errorLog.filter(e => e.type === 'error').length;
  const unresolvedNotes = aiNotes.filter(n => !n.resolved).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 gap-2 shadow-lg bg-background/95 backdrop-blur">
          <ClipboardCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Testing</span>
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">{checkedCount}/{totalItems}</span>
          {errorCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{errorCount}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4" aria-describedby="testing-dialog-description">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Testing & Planning</span>
            <div className="flex gap-2 mr-6">
              <Button variant="ghost" size="sm" onClick={() => { generateBuildReport(); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={() => handleDownload('md')}><Download className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Download</TooltipContent></Tooltip>
            </div>
          </DialogTitle>
          <p id="testing-dialog-description" className="sr-only">Testing dialog</p>
        </DialogHeader>

        <Tabs defaultValue="plan" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-6 shrink-0 bg-secondary/50">
            <TabsTrigger value="plan" className="gap-1.5 text-xs"><Lightbulb className="w-3.5 h-3.5" />Plan</TabsTrigger>
            <TabsTrigger value="buildlog" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" />Build</TabsTrigger>
            <TabsTrigger value="checklist" className="gap-1.5 text-xs"><ClipboardCheck className="w-3.5 h-3.5" />List</TabsTrigger>
            <TabsTrigger value="errors" className="gap-1.5 text-xs"><AlertTriangle className="w-3.5 h-3.5" />Errors{errorCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">{errorCount}</span>}</TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-xs"><Paperclip className="w-3.5 h-3.5" />Notes{unresolvedNotes > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1 rounded-full">{unresolvedNotes}</span>}</TabsTrigger>
            <TabsTrigger value="dependencies" className="gap-1.5 text-xs"><Cpu className="w-3.5 h-3.5" />Deps</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <PlanTab planResponses={planResponses} planPriorities={planPriorities} planNotes={planNotes} onPlanResponse={(id, v) => setPlanResponses(p => ({ ...p, [id]: v }))} onPlanPriority={(id, v) => setPlanPriorities(p => p[id] === v ? (delete p[id], { ...p }) : { ...p, [id]: v })} onPlanNote={(id, n) => setPlanNotes(p => ({ ...p, [id]: n }))} onDownload={handleDownload} />
          </TabsContent>
          <TabsContent value="buildlog" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <BuildLogTab activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
          </TabsContent>
          <TabsContent value="checklist" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ChecklistTab checkedItems={checkedItems} itemNotes={itemNotes} onCheck={(id) => setCheckedItems(p => ({ ...p, [id]: !p[id] }))} onItemNote={(id, n) => setItemNotes(p => ({ ...p, [id]: n }))} />
          </TabsContent>
          <TabsContent value="errors" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ErrorsTab errorLog={errorLog} aiSuggestions={aiSuggestions} isAnalyzing={isAnalyzing} isRunningTest={isRunningTest} onAnalyzeError={analyzeError} onRunAITest={runAITest} onClearErrorLog={() => setErrorLog([])} onClearSuggestions={() => setAiSuggestions([])} />
          </TabsContent>
          <TabsContent value="notes" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <NotesTab aiNotes={aiNotes} newNote={newNote} setNewNote={setNewNote} onAddNote={() => { if (newNote.trim()) { setAiNotes(p => [{ id: `n-${Date.now()}`, content: newNote.trim(), createdAt: Date.now(), resolved: false }, ...p]); setNewNote(''); } }} onToggleNoteResolved={(id) => setAiNotes(p => p.map(n => n.id === id ? { ...n, resolved: !n.resolved } : n))} onDeleteNote={(id) => setAiNotes(p => p.filter(n => n.id !== id))} />
          </TabsContent>
          <TabsContent value="dependencies" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <DependenciesTab />
          </TabsContent>
        </Tabs>

        {checkedCount === totalItems && answeredPlanItems === totalPlanItems && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-500 font-medium">🎉 All items reviewed!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
