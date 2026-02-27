import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { ContextualMetricsResult, metricFormulas } from '@/lib/contextualMetrics';

interface ContextualMetricsProps {
  metrics: ContextualMetricsResult;
}

function MetricRow({
  label,
  value,
  classification,
  formulaKey
}: {
  label: string;
  value: string;
  classification: string;
  formulaKey: keyof typeof metricFormulas;
}) {
  const formula = metricFormulas[formulaKey];

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs bg-popover border-border">
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-foreground">{formula.name}</p>
                <p className="font-mono text-muted-foreground">{formula.formula}</p>
                <p className="text-foreground">{formula.interpretation}</p>
                <p className="text-muted-foreground italic">Limitation: {formula.limitation}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-foreground">{value}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {classification}
        </span>
      </div>
    </div>
  );
}

export function ContextualMetrics({ metrics }: ContextualMetricsProps) {
  // Format VWAP distance with sign
  const vwapSign = metrics.vwapDistance.value >= 0 ? '+' : '';
  const vwapFormatted = `${vwapSign}${metrics.vwapDistance.value.toFixed(1)} ATR`;

  // Format Z-Score with sign
  const zSign = metrics.zScoreStretch.value >= 0 ? '+' : '';
  const zFormatted = `${zSign}${metrics.zScoreStretch.value.toFixed(1)}`;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contextual Metrics
        </h2>
      </div>

      <div className="space-y-0">
        <MetricRow
          label="VWAP Distance"
          value={vwapFormatted}
          classification={metrics.vwapDistance.classification}
          formulaKey="vwapDistance"
        />

        <MetricRow
          label="Efficiency Ratio"
          value={metrics.efficiencyRatio.value.toFixed(2)}
          classification={metrics.efficiencyRatio.classification}
          formulaKey="efficiencyRatio"
        />

        <MetricRow
          label="Variance Ratio"
          value={metrics.varianceRatio.value.toFixed(2)}
          classification={metrics.varianceRatio.classification}
          formulaKey="varianceRatio"
        />

        <MetricRow
          label="Z-Score Stretch"
          value={zFormatted}
          classification={metrics.zScoreStretch.classification}
          formulaKey="zScoreStretch"
        />

        <MetricRow
          label="Session Context"
          value={metrics.sessionContext.session}
          classification={metrics.sessionContext.behavior}
          formulaKey="sessionContext"
        />

        <MetricRow
          label="Structure Density"
          value={`${metrics.structureDensity.count} zones`}
          classification={metrics.structureDensity.classification}
          formulaKey="structureDensity"
        />
      </div>
    </div>
  );
}
