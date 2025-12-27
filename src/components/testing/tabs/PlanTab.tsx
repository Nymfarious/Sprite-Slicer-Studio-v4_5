import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import { SplitPane } from '@/components/SplitPane';
import { PlanResponse, PlanPriority } from '../types';
import { planCategories } from '../data';
import { getResponseStyle, getPlanPriorityStyle } from '../utils';

interface PlanTabProps {
  planResponses: Record<string, PlanResponse>;
  planPriorities: Record<string, PlanPriority>;
  planNotes: Record<string, string>;
  onPlanResponse: (id: string, value: PlanResponse) => void;
  onPlanPriority: (id: string, value: PlanPriority) => void;
  onPlanNote: (id: string, note: string) => void;
  onDownload: (format: 'md' | 'txt') => void;
}

export function PlanTab({
  planResponses,
  planPriorities,
  planNotes,
  onPlanResponse,
  onPlanPriority,
  onPlanNote,
  onDownload,
}: PlanTabProps) {
  return (
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
                                  onClick={() => onPlanResponse(item.id, val)}
                                  className={getResponseStyle(planResponses, item.id, val)}
                                >
                                  {val.charAt(0).toUpperCase() + val.slice(1)}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-1 border-l border-border pl-2">
                              {([1, 2, 3] as PlanPriority[]).map(p => (
                                <button
                                  key={p}
                                  onClick={() => onPlanPriority(item.id, p)}
                                  className={getPlanPriorityStyle(planPriorities, item.id, p)}
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
                            onChange={(e) => onPlanNote(item.id, e.target.value)}
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
            <Button size="sm" variant="outline" onClick={() => onDownload('md')} className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export Plan
            </Button>
          </div>
        </div>
      }
      defaultTopHeight={65}
      minTopHeight={50}
    />
  );
}
