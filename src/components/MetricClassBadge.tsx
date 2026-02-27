import { Check, Activity, BarChart3 } from 'lucide-react';
import { MetricClass, classLabels } from '@/lib/metricClassification';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface MetricClassBadgeProps {
  metricClass: MetricClass;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function MetricClassBadge({ metricClass, size = 'sm', showLabel = false }: MetricClassBadgeProps) {
  const label = classLabels[metricClass];

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const badgeSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  // Use semantic design tokens (institutional palette) instead of hardcoded colors
  const colorClasses: Record<MetricClass, string> = {
    A: 'bg-primary/15 text-primary border-primary/30',
    B: 'bg-accent/15 text-accent border-accent/30',
    C: 'bg-destructive/15 text-destructive border-destructive/30'
  };

  const Icon = metricClass === 'A'
    ? Check
    : metricClass === 'B'
      ? Activity
      : BarChart3;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className={`
            inline-flex items-center gap-1.5 
            ${showLabel ? 'px-2 py-0.5 rounded' : `${badgeSize} rounded-sm justify-center`}
            border ${colorClasses[metricClass]}
          `}>
            <Icon className={iconSize} />
            {showLabel && (
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Class {metricClass}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-popover border-border">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Class {metricClass}: {label.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {label.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default MetricClassBadge;
