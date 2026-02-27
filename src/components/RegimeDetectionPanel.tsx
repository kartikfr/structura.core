import { Info, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CUSUMResult,
  VolatilityRegimeResult,
  VolatilityAsymmetryResult,
  econometricsFormulas
} from '@/lib/advancedEconometrics';
import { formatPrecision } from '@/lib/metricClassification';
import { Progress } from '@/components/ui/progress';

interface RegimeDetectionPanelProps {
  cusum: CUSUMResult;
  volatilityRegime: VolatilityRegimeResult;
  volatilityAsymmetry: VolatilityAsymmetryResult;
  auditMode?: boolean;
}

export function RegimeDetectionPanel({
  cusum,
  volatilityRegime,
  volatilityAsymmetry,
  auditMode = false
}: RegimeDetectionPanelProps) {
  const regimeIcon = volatilityRegime.currentRegime === 'High-Vol'
    ? <TrendingUp className="w-4 h-4 text-destructive" />
    : <TrendingDown className="w-4 h-4 text-primary" />;

  const cusumColor = cusum.classification === 'Stable'
    ? 'text-primary'
    : cusum.classification === 'Transitioning'
      ? 'text-yellow-500'
      : 'text-destructive';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Regime Detection
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {regimeIcon}
          <span className={`text-xs px-2 py-0.5 rounded ${volatilityRegime.currentRegime === 'High-Vol'
              ? 'bg-destructive/20 text-destructive'
              : 'bg-primary/20 text-primary'
            }`}>
            {volatilityRegime.currentRegime}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Regime */}
        <div className="p-3 bg-muted/30 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Regime Probability</span>
            <span className="font-mono text-sm text-foreground">
              {formatPrecision(volatilityRegime.regimeProbability * 100, 1)}%
            </span>
          </div>
          <Progress
            value={volatilityRegime.regimeProbability * 100}
            className="h-2"
          />
        </div>

        {/* Volatility Means */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-primary/30 rounded">
            <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Low-Vol Mean</p>
            <p className="font-mono text-sm text-foreground">
              {formatPrecision(volatilityRegime.lowVolMean * Math.sqrt(252) * 100, 2)}%
            </p>
          </div>
          <div className="p-3 border border-destructive/30 rounded">
            <p className="text-[10px] text-destructive uppercase tracking-wider mb-1">High-Vol Mean</p>
            <p className="font-mono text-sm text-foreground">
              {formatPrecision(volatilityRegime.highVolMean * Math.sqrt(252) * 100, 2)}%
            </p>
          </div>
        </div>

        {/* CUSUM Test */}
        <div className="py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">CUSUM Test</span>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-popover border-border">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">{econometricsFormulas.cusum.name}</p>
                    <p className="font-mono text-muted-foreground text-[10px]">{econometricsFormulas.cusum.formula}</p>
                    <p className="text-foreground">{econometricsFormulas.cusum.interpretation}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${cusumColor}`}>
                Max: {formatPrecision(Math.abs(cusum.maxCusum), 2)}
              </span>
              <span className="text-xs text-muted-foreground">
                / Critical: {formatPrecision(cusum.criticalValue, 2)}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${cusum.classification === 'Stable'
                ? 'bg-primary/20 text-primary'
                : cusum.classification === 'Transitioning'
                  ? 'bg-yellow-500/20 text-yellow-600'
                  : 'bg-destructive/20 text-destructive'
              }`}>
              {cusum.classification}
            </span>
          </div>
          {cusum.hasStructuralBreak && cusum.breakIndex && (
            <p className="mt-2 text-xs text-destructive">
              Structural break detected at bar #{cusum.breakIndex}
            </p>
          )}
        </div>

        {/* Volatility Asymmetry */}
        <div className="py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Volatility Asymmetry</span>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-popover border-border">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">{econometricsFormulas.volatilityAsymmetry.name}</p>
                    <p className="font-mono text-muted-foreground text-[10px]">{econometricsFormulas.volatilityAsymmetry.formula}</p>
                    <p className="text-foreground">{econometricsFormulas.volatilityAsymmetry.interpretation}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-foreground">
                Γ = {formatPrecision(volatilityAsymmetry.gamma, 2)}
              </span>
              {volatilityAsymmetry.hasLeverageEffect && (
                <span className="text-xs text-yellow-500">Leverage Effect</span>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground`}>
              {volatilityAsymmetry.classification}
            </span>
          </div>
        </div>

        {/* Audit Mode Details */}
        {auditMode && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-[10px] font-mono text-muted-foreground mb-2">
              Regime transitions: {volatilityRegime.recentTransitions.length} recent
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-muted-foreground">Transition Rate:</span>
                <span className="ml-1 text-foreground">
                  {formatPrecision(volatilityRegime.transitionIntensity * 100, 1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">ρ⁺/ρ⁻:</span>
                <span className="ml-1 text-foreground">
                  {formatPrecision(volatilityAsymmetry.positiveCorrelation, 2)}/
                  {formatPrecision(volatilityAsymmetry.negativeCorrelation, 2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
