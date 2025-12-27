import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { SplitPane } from '@/components/SplitPane';
import { cn } from '@/lib/utils';
import { categories, completedV2Items } from '../data';
import { getPriorityColor } from '../utils';

interface ChecklistTabProps {
  checkedItems: Record<string, boolean>;
  itemNotes: Record<string, string>;
  onCheck: (id: string) => void;
  onItemNote: (id: string, note: string) => void;
}

export function ChecklistTab({
  checkedItems,
  itemNotes,
  onCheck,
  onItemNote,
}: ChecklistTabProps) {
  return (
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
                      <div className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                        <Checkbox
                          id={item.id}
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={() => onCheck(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.id} className="text-sm cursor-pointer flex items-center gap-2">
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", getPriorityColor(item.priority), "bg-current/10")}>
                              {item.priority}
                            </span>
                            {item.text}
                          </label>
                          <input
                            type="text"
                            placeholder="Add note..."
                            value={itemNotes[item.id] || ''}
                            onChange={(e) => onItemNote(item.id, e.target.value)}
                            className="mt-1 w-full bg-muted/50 border border-border rounded px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {category.items.filter(item => !checkedItems[item.id]).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">All items completed ✓</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      }
      bottom={
        <div className="h-full flex flex-col bg-muted/20 rounded-lg p-3 border border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            ✅ Completed Items ({completedV2Items.length} V2 items pre-checked)
          </h4>
          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-2">
              {completedV2Items.map(item => (
                <div key={item.id} className="text-xs text-muted-foreground line-through p-1">
                  {item.text}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      }
      defaultTopHeight={60}
      minTopHeight={50}
    />
  );
}
