import { cn } from '@/lib/utils';

interface GridSettingsIconProps {
  className?: string;
}

export function GridSettingsIcon({ className }: GridSettingsIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={cn("h-4 w-4", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Uneven grid pattern */}
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="16" y2="21" />
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="3" y1="14" x2="21" y2="14" />
      {/* Extra divisions to look "complex" */}
      <line x1="12" y1="8" x2="12" y2="14" strokeDasharray="2 2" />
    </svg>
  );
}
