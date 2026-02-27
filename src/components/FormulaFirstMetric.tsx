import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { MetricClass, MetricDefinition, formatPrecision } from '@/lib/metricClassification';
import { MetricClassBadge } from './MetricClassBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface FormulaFirstMetricProps {
  definition: MetricDefinition;
  value: number;
  classification?: string;
  subValue?: string;
  disabled?: boolean;
  disabledReason?: string;
  forceExpanded?: boolean;
  auditDetails?: React.ReactNode;
}

export function FormulaFirstMetric({
  definition,
  value,
  classification,
  subValue,
  disabled = false,
  disabledReason,
  forceExpanded = false,
  auditDetails
}: FormulaFirstMetricProps) {
  const [expanded, setExpanded] = useState(false);
  const isExpanded = forceExpanded || expanded;

  if (disabled) {
    return (
      <div className="bg-muted/10 border border-border/50 rounded-lg p-3 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MetricClassBadge metricClass={definition.class} />
            <span className="text-sm text-muted-foreground">{definition.name}</span>
          </div>
          <span className="text-xs font-mono text-destructive">DISABLED</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {disabledReason || 'Volume data unavailable'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
      {/* Header: Class badge + name + hover formula */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MetricClassBadge metricClass={definition.class} />
          <span className="text-sm font-medium text-foreground">{definition.name}</span>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-popover border-border">
                <code className="text-[10px] font-mono text-muted-foreground">
                  {definition.formula}
                </code>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {classification && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {classification}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg text-foreground">
          {formatPrecision(value, definition.precision)}
        </span>
        {subValue && (
          <span className="text-xs text-muted-foreground">{subValue}</span>
        )}
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="uppercase tracking-wider">
          {isExpanded ? 'Hide' : 'Show'} Method
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-[10px]">
          <div>
            <span className="text-muted-foreground uppercase tracking-wider">Formula:</span>
            <code className="block font-mono text-foreground mt-0.5">{definition.formula}</code>
          </div>

          {definition.method && (
            <div>
              <span className="text-muted-foreground uppercase tracking-wider">Method:</span>
              <span className="block text-foreground mt-0.5">{definition.method}</span>
            </div>
          )}

          {definition.window && (
            <div>
              <span className="text-muted-foreground uppercase tracking-wider">Window:</span>
              <span className="block text-foreground mt-0.5">{definition.window}</span>
            </div>
          )}

          <div>
            <span className="text-muted-foreground uppercase tracking-wider">Inputs:</span>
            <span className="block text-foreground mt-0.5">{definition.inputs.join(', ')}</span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase tracking-wider">Interpretation:</span>
            <span className="block text-foreground mt-0.5">{definition.interpretation}</span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase tracking-wider">Limitation:</span>
            <span className="block text-muted-foreground italic mt-0.5">{definition.limitation}</span>
          </div>

          {auditDetails && (
            <div>
              <span className="text-muted-foreground uppercase tracking-wider">Audit Inputs:</span>
              <div className="mt-1">{auditDetails}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormulaFirstMetric;