import { useMemo } from 'react';
import { EasingType } from '@/types/animation';
import { easings } from '@/lib/tweening';
import { cn } from '@/lib/utils';

interface EasingCurvePreviewProps {
  easing: EasingType;
  width?: number;
  height?: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function EasingCurvePreview({
  easing,
  width = 80,
  height = 50,
  className,
  showLabel = false,
  animated = false,
}: EasingCurvePreviewProps) {
  const easingFn = easings[easing];

  const pathData = useMemo(() => {
    const points: string[] = [];
    const padding = 6;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Generate path points
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const value = easingFn(t);
      const x = padding + t * graphWidth;
      const y = height - padding - value * graphHeight;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    return points.join(' ');
  }, [easing, width, height, easingFn]);

  const dotPosition = useMemo(() => {
    const padding = 6;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Position at t=0.5 for static preview
    const t = 0.5;
    const value = easingFn(t);
    return {
      x: padding + t * graphWidth,
      y: height - padding - value * graphHeight,
    };
  }, [easing, width, height, easingFn]);

  const easingLabels: Record<EasingType, string> = {
    'linear': 'Linear',
    'ease-in': 'Ease In',
    'ease-out': 'Ease Out',
    'ease-in-out': 'Ease In-Out',
    'bounce': 'Bounce',
    'elastic': 'Elastic',
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg
        width={width}
        height={height}
        className="bg-muted/50 rounded border border-border/50"
      >
        {/* Grid lines */}
        <line
          x1={6}
          y1={height - 6}
          x2={width - 6}
          y2={height - 6}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />
        <line
          x1={6}
          y1={6}
          x2={6}
          y2={height - 6}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />
        
        {/* Linear reference line */}
        <line
          x1={6}
          y1={height - 6}
          x2={width - 6}
          y2={6}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          strokeOpacity={0.2}
          strokeDasharray="2 2"
        />

        {/* Easing curve */}
        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "animate-[draw_1s_ease-in-out]" : ""}
        />

        {/* Highlight dot */}
        <circle
          cx={dotPosition.x}
          cy={dotPosition.y}
          r={3}
          fill="hsl(var(--primary))"
          className={animated ? "animate-pulse" : ""}
        />
      </svg>
      
      {showLabel && (
        <span className="text-[10px] text-muted-foreground font-medium">
          {easingLabels[easing]}
        </span>
      )}
    </div>
  );
}

// Grid of all easing previews for selection
export function EasingGrid({
  selected,
  onSelect,
  compact = false,
}: {
  selected: EasingType;
  onSelect: (easing: EasingType) => void;
  compact?: boolean;
}) {
  const easingTypes: EasingType[] = [
    'linear',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'bounce',
    'elastic',
  ];

  return (
    <div className={cn(
      "grid gap-2",
      compact ? "grid-cols-3" : "grid-cols-2"
    )}>
      {easingTypes.map((easing) => (
        <button
          key={easing}
          onClick={() => onSelect(easing)}
          className={cn(
            "p-1 rounded-md border-2 transition-colors hover:bg-accent/50",
            selected === easing
              ? "border-primary bg-primary/10"
              : "border-transparent"
          )}
        >
          <EasingCurvePreview
            easing={easing}
            width={compact ? 60 : 80}
            height={compact ? 40 : 50}
            showLabel
          />
        </button>
      ))}
    </div>
  );
}
