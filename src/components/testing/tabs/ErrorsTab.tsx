import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Play, Trash2 } from 'lucide-react';
import { SplitPane } from '@/components/SplitPane';
import { ErrorLogEntry, AISuggestion } from '../types';
import { getLogColor } from '../utils';

interface ErrorsTabProps {
  errorLog: ErrorLogEntry[];
  aiSuggestions: AISuggestion[];
  isAnalyzing: boolean;
  isRunningTest: boolean;
  onAnalyzeError: (entry: ErrorLogEntry) => void;
  onRunAITest: () => void;
  onClearErrorLog: () => void;
  onClearSuggestions: () => void;
}

export function ErrorsTab({
  errorLog,
  aiSuggestions,
  isAnalyzing,
  isRunningTest,
  onAnalyzeError,
  onRunAITest,
  onClearErrorLog,
  onClearSuggestions,
}: ErrorsTabProps) {
  return (
    <>
      <div className="flex gap-2 mb-2 shrink-0">
        <Button size="sm" variant="outline" onClick={onRunAITest} disabled={isRunningTest} className="text-xs border-cyan-500/30 hover:bg-cyan-500/10">
          {isRunningTest ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
          Run AI Test
        </Button>
        <Button size="sm" variant="ghost" onClick={onClearSuggestions} className="text-xs">Clear Suggestions</Button>
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
                <Button size="sm" variant="ghost" onClick={onClearErrorLog} className="text-[10px] h-5 px-1.5">
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
                      onClick={() => entry.type === 'error' && onAnalyzeError(entry)}
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
    </>
  );
}
