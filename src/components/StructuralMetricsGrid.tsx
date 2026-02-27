import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Check, Activity, BarChart3 } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string;
  formula?: string;
  class?: 'A' | 'B' | 'C';
}

interface StructuralMetricsGridProps {
  metrics: MetricItem[];
}

function ClassIcon({ metricClass }: { metricClass?: 'A' | 'B' | 'C' }) {
  if (!metricClass) return null;

  const icons = {
    A: <Check className="w-3 h-3 text-primary" />,
    B: <Activity className="w-3 h-3 text-accent" />,
    C: <BarChart3 className="w-3 h-3 text-destructive" />
  };

  return icons[metricClass];
}

export const StructuralMetricsGrid = ({ metrics }: StructuralMetricsGridProps) => {
  return (
    <div className="structura-panel">
      <div className="p-4 border-b border-border">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Structural Metrics
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50 ml-2">
          (Non-Optimizable)
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {metrics.map((metric, i) => (
          <TooltipProvider key={i}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="bg-card p-4 cursor-default hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ClassIcon metricClass={metric.class} />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      {metric.label}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-foreground">
                    {metric.value}
                  </div>
                </div>
              </TooltipTrigger>
              {metric.formula && (
                <TooltipContent side="top" className="bg-popover border-border max-w-xs">
                  <div className="space-y-1">
                    {metric.class && (
                      <p className="text-[9px] text-muted-foreground uppercase">
                        Class {metric.class}: {metric.class === 'A' ? 'Direct OHLC' : metric.class === 'B' ? 'Statistical Transform' : 'Volume Metric'}
                      </p>
                    )}
                    <code className="font-mono text-[10px] text-foreground">
                      {metric.formula}
                    </code>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default StructuralMetricsGrid;
