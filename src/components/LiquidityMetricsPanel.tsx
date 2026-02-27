import { Info, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  RollSpreadResult,
  CorwinSchultzResult,
  AmihudIlliquidityResult,
  econometricsFormulas
} from '@/lib/advancedEconometrics';
import { formatPrecision } from '@/lib/metricClassification';

interface LiquidityMetricsPanelProps {
  rollSpread: RollSpreadResult;
  corwinSchultzSpread: CorwinSchultzResult;
  amihudIlliquidity: AmihudIlliquidityResult;
  overallLiquidity: 'High' | 'Normal' | 'Low';
  auditMode?: boolean;
}

function MetricRow({
  label,
  value,
  classification,
  formulaKey,
  isValid = true,
  invalidReason
}: {
  label: string;
  value: string;
  classification: string;
  formulaKey: keyof typeof econometricsFormulas;
  isValid?: boolean;
  invalidReason?: string;
}) {
  const formula = econometricsFormulas[formulaKey];

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
                <p className="font-mono text-muted-foreground text-[10px]">{formula.formula}</p>
                <p className="text-foreground">{formula.interpretation}</p>
                <p className="text-muted-foreground italic">Ref: {formula.reference}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {!isValid && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{invalidReason || 'Metric conditions not met'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-mono text-sm ${isValid ? 'text-foreground' : 'text-muted-foreground/50'}`}>
          {value}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${classification.includes('High') || classification.includes('Liquid') || classification === 'Tight'
            ? 'bg-primary/20 text-primary'
            : classification === 'Normal'
              ? 'bg-muted text-muted-foreground'
              : 'bg-yellow-500/20 text-yellow-600'
          }`}>
          {classification}
        </span>
      </div>
    </div>
  );
}

export function LiquidityMetricsPanel({
  rollSpread,
  corwinSchultzSpread,
  amihudIlliquidity,
  overallLiquidity,
  auditMode = false
}: LiquidityMetricsPanelProps) {
  const liquidityColor = overallLiquidity === 'High'
    ? 'bg-primary/20 text-primary'
    : overallLiquidity === 'Normal'
      ? 'bg-muted text-muted-foreground'
      : 'bg-yellow-500/20 text-yellow-600';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Liquidity Proxies
          </h2>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${liquidityColor}`}>
          {overallLiquidity} Liquidity
        </span>
      </div>

      <div className="space-y-0">
        <MetricRow
          label="Roll Spread"
          value={rollSpread.isValid ? formatPrecision(rollSpread.effectiveSpread, 4) : 'N/A'}
          classification={rollSpread.classification}
          formulaKey="rollSpread"
          isValid={rollSpread.isValid}
          invalidReason="Positive autocovariance - market too liquid to measure"
        />

        <MetricRow
          label="Corwin-Schultz"
          value={corwinSchultzSpread.isValid
            ? `${formatPrecision(corwinSchultzSpread.bidAskSpread * 100, 2)}%`
            : 'N/A'}
          classification={corwinSchultzSpread.classification}
          formulaKey="corwinSchultz"
          isValid={corwinSchultzSpread.isValid}
        />

        <MetricRow
          label="Amihud ILLIQ"
          value={amihudIlliquidity.volumeNormalized
            ? formatPrecision(amihudIlliquidity.illiquidityRatio * 1e9, 2)
            : 'N/A'}
          classification={amihudIlliquidity.classification}
          formulaKey="amihud"
          isValid={amihudIlliquidity.volumeNormalized}
          invalidReason="Volume data required"
        />
      </div>

      {auditMode && (
        <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <span className="text-muted-foreground">Roll Autocov:</span>
              <span className="ml-1 text-foreground">{formatPrecision(rollSpread.autocovariance, 6)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Volume:</span>
              <span className="ml-1 text-foreground">{formatPrecision(amihudIlliquidity.averageVolume, 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
