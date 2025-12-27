import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SplitPane } from '@/components/SplitPane';
import { PipelineVisualization } from '@/components/PipelineVisualization';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { cn } from '@/lib/utils';
import { buildLog } from '../data';
import { getStatusEmoji } from '../utils';

interface BuildLogTabProps {
  activeFilters: ('complete' | 'partial' | 'stub' | 'bug')[];
  setActiveFilters: React.Dispatch<React.SetStateAction<('complete' | 'partial' | 'stub' | 'bug')[]>>;
}

export function BuildLogTab({ activeFilters, setActiveFilters }: BuildLogTabProps) {
  return (
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
  );
}
