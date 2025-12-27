import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { cn } from '@/lib/utils';
import { mobileIssues, aiFeatures } from '../data';

export function DependenciesTab() {
  return (
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
  );
}
