import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Info, AlertTriangle } from 'lucide-react';
import {
  MarketStructureContextResult,
  structureFormulas
} from '@/lib/marketStructureContext';

interface MarketStructureContextProps {
  context: MarketStructureContextResult;
}

function ContextRow({
  label,
  value,
  detail,
  formulaKey
}: {
  label: string;
  value: string;
  detail: string;
  formulaKey: keyof typeof structureFormulas;
}) {
  const formula = structureFormulas[formulaKey];

  return (
    <div className="flex items-start justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-sm bg-popover border-border">
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">{formula.name}</p>
                <p className="font-mono text-muted-foreground text-[10px]">{formula.formula}</p>
                <p className="text-foreground">{formula.interpretation}</p>
                <p className="text-muted-foreground italic">Limitation: {formula.limitation}</p>
                <div className="pt-1 border-t border-border">
                  <p className="text-foreground"><span className="font-medium">Use Case:</span> {formula.useCase}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

export function MarketStructureContext({ context }: MarketStructureContextProps) {
  const { rangeMetrics, volumeMetrics, testMetrics, compressionMetrics, effortResultMetrics } = context;

  // Format boundary proximity
  const boundaryText = `${rangeMetrics.boundaryProximity.distance.toFixed(1)} ATR to ${rangeMetrics.boundaryProximity.boundary}`;

  // Format volume bias
  const volumeBiasText = volumeMetrics.biasLabel === 'neutral'
    ? 'Neutral distribution'
    : `Higher at ${volumeMetrics.biasLabel} (${volumeMetrics.supportBias.toFixed(2)}:1)`;

  // Format test metrics
  const testText = testMetrics
    ? `${testMetrics.barsSince} bars ago, ${testMetrics.depth.toFixed(1)} ATR depth`
    : 'None detected';
  const testDetail = testMetrics
    ? `${testMetrics.boundary} test — ${testMetrics.recovery} recovery`
    : 'No recent boundary approach';

  // Format compression trend
  const compressionTrendText = compressionMetrics.trend === 'contracting'
    ? `↓ from ${compressionMetrics.previousRatio}%`
    : compressionMetrics.trend === 'expanding'
      ? `↑ from ${compressionMetrics.previousRatio}%`
      : 'stable';

  // Format effort/result
  const effortLabel = effortResultMetrics.interpretation === 'high-effort-small-move'
    ? 'High effort, small result'
    : effortResultMetrics.interpretation === 'low-effort-large-move'
      ? 'Low effort, large result'
      : 'Proportional';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Market Structure Context
        </h2>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-muted/30 border border-border/50">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          These mathematical observations provide context derived from OHLCV data.
          They do NOT constitute predictive claims, directives, or recommendations.
          No stages, events, or outcomes are implied. The operator supplies all judgment.
        </p>
      </div>

      {/* Range Analysis Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Range Analysis
        </h3>
        <div className="bg-muted/20 rounded-lg p-3 space-y-1">
          <ContextRow
            label="Range Width"
            value={`${rangeMetrics.width.toFixed(2)} pts`}
            detail={`${rangeMetrics.widthATR.toFixed(1)}× ATR`}
            formulaKey="rangeAnalysis"
          />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Position</span>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, rangeMetrics.position))}%` }}
                />
              </div>
              <span className="font-mono text-sm text-foreground w-14 text-right">
                {rangeMetrics.position.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border/30">
            <span className="text-sm text-muted-foreground">Boundary</span>
            <span className="font-mono text-sm text-foreground">{boundaryText}</span>
          </div>
        </div>
      </div>

      {/* Volume Context Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Volume Context
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <ContextRow
            label="Current Level"
            value={`${volumeMetrics.currentVsAverage}% of avg`}
            detail={volumeBiasText}
            formulaKey="volumeContext"
          />
        </div>
      </div>

      {/* Recent Action Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Recent Action
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <ContextRow
            label="Boundary Test"
            value={testText}
            detail={testDetail}
            formulaKey="testMetrics"
          />
        </div>
      </div>

      {/* Compression Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Compression
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <ContextRow
            label="Range Ratio"
            value={`${compressionMetrics.ratio}% of avg`}
            detail={`Trend: ${compressionTrendText}`}
            formulaKey="compression"
          />
        </div>
      </div>

      {/* Effort/Result Section */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Effort vs Result
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <ContextRow
            label="Ratio"
            value={effortResultMetrics.ratio.toFixed(2)}
            detail={effortLabel}
            formulaKey="effortResult"
          />
        </div>
      </div>
    </div>
  );
}
