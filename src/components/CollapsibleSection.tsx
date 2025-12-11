import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({ title, defaultOpen = false, children, className }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-accent rounded transition-colors">
        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
        <span className="font-medium text-sm">{title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
