import { metricDefinitions, formatPrecision } from '@/lib/metricClassification';
import { FormulaFirstMetric } from '@/components/FormulaFirstMetric';
import { TimeDomainMetricStatus } from '@/lib/timeDomainMetrics';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TimeDomainMetricsPanelProps {
  temporalSymmetry: TimeDomainMetricStatus<number>;
  barNormalizedRange: TimeDomainMetricStatus<number>;
  temporalPriceCompressionRatio?: TimeDomainMetricStatus<number>;
  auditMode?: boolean;
}

/**
 * Helper to format metric value properly.
 * Critical Fix #3: Never show 0.000 placeholders.
 * If metric is disabled, show "—" or explicit disabled state.
 */
function formatMetricValue(status: TimeDomainMetricStatus<number>, precision: number = 2): string {
  if (status.status === 'disabled') {
    return '—';
  }

  const value = status.value;
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return '—';
  }

  // Never show 0.000 unless the value is actually zero
  // If value is very close to zero, still show it but formatted
  return formatPrecision(value, precision);
}

export function TimeDomainMetricsPanel({
  temporalSymmetry,
  barNormalizedRange,
  temporalPriceCompressionRatio,
  auditMode = false,
}: TimeDomainMetricsPanelProps) {
  const tsDef = metricDefinitions.temporalSymmetry;
  const bnrDef = metricDefinitions.barNormalizedRange;
  const tpcrDef = metricDefinitions.temporalPriceCompressionRatio;

  // Calculate how many metrics are active vs disabled
  const metrics = [temporalSymmetry, barNormalizedRange, temporalPriceCompressionRatio].filter(Boolean);
  const activeCount = metrics.filter(m => m?.status === 'active').length;
  const totalCount = metrics.length;
  const allActive = activeCount === totalCount;

  return (
    <section className="structura-panel p-4">
      <header className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Time-Domain Metrics (Phase-1)
            </h2>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            {allActive ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            )}
            <span className="text-[9px] font-mono text-muted-foreground">
              {activeCount}/{totalCount} active
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Definition-first metrics derived from OHLC + timestamps. Display precision is capped at 2 decimals.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <FormulaFirstMetric
          definition={tsDef}
          value={temporalSymmetry.value ?? 0}
          disabled={temporalSymmetry.status === 'disabled'}
          disabledReason={temporalSymmetry.reason}
          forceExpanded={auditMode}
          auditDetails={
            auditMode && temporalSymmetry.inputs ? (
              <pre className="whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">
                {JSON.stringify(temporalSymmetry.inputs, null, 2)}
              </pre>
            ) : undefined
          }
          subValue={
            temporalSymmetry.status === 'active'
              ? `0–1 domain • shown: ${formatMetricValue(temporalSymmetry, 2)}`
              : temporalSymmetry.reason || 'Disabled'
          }
        />

        <FormulaFirstMetric
          definition={bnrDef}
          value={barNormalizedRange.value ?? 0}
          disabled={barNormalizedRange.status === 'disabled'}
          disabledReason={barNormalizedRange.reason}
          forceExpanded={auditMode}
          auditDetails={
            auditMode && barNormalizedRange.inputs ? (
              <pre className="whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">
                {JSON.stringify(barNormalizedRange.inputs, null, 2)}
              </pre>
            ) : undefined
          }
          subValue={
            barNormalizedRange.status === 'active'
              ? `Value: ${formatMetricValue(barNormalizedRange, 5)}`
              : barNormalizedRange.reason || 'Disabled'
          }
        />

        {temporalPriceCompressionRatio && (
          <div className="md:col-span-2">
            <FormulaFirstMetric
              definition={tpcrDef}
              value={temporalPriceCompressionRatio.value ?? 0}
              disabled={temporalPriceCompressionRatio.status === 'disabled'}
              disabledReason={temporalPriceCompressionRatio.reason}
              forceExpanded={auditMode}
              auditDetails={
                auditMode && temporalPriceCompressionRatio.inputs ? (
                  <pre className="whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">
                    {JSON.stringify(temporalPriceCompressionRatio.inputs, null, 2)}
                  </pre>
                ) : undefined
              }
              subValue={
                temporalPriceCompressionRatio.status === 'active'
                  ? `Value: ${formatMetricValue(temporalPriceCompressionRatio, 5)}`
                  : temporalPriceCompressionRatio.reason || 'Disabled'
              }
            />
          </div>
        )}
      </div>

      {/* Audit Mode: Show validation summary */}
      {auditMode && (
        <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
          <p className="text-[10px] font-mono text-muted-foreground font-semibold">
            PHASE-1 VALIDATION SUMMARY
          </p>
          <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
            <div className={`p-2 rounded ${temporalSymmetry.status === 'active' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <span className="text-muted-foreground">Temporal Symmetry:</span>
              <span className={`ml-1 ${temporalSymmetry.status === 'active' ? 'text-primary' : 'text-destructive'}`}>
                {temporalSymmetry.status === 'active' ? 'VALID' : 'DISABLED'}
              </span>
            </div>
            <div className={`p-2 rounded ${barNormalizedRange.status === 'active' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <span className="text-muted-foreground">Bar Range:</span>
              <span className={`ml-1 ${barNormalizedRange.status === 'active' ? 'text-primary' : 'text-destructive'}`}>
                {barNormalizedRange.status === 'active' ? 'VALID' : 'DISABLED'}
              </span>
            </div>
            <div className={`p-2 rounded ${temporalPriceCompressionRatio?.status === 'active' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <span className="text-muted-foreground">Compression:</span>
              <span className={`ml-1 ${temporalPriceCompressionRatio?.status === 'active' ? 'text-primary' : 'text-destructive'}`}>
                {temporalPriceCompressionRatio?.status === 'active' ? 'VALID' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TimeDomainMetricsPanel;