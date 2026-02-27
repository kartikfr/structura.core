import { Info, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MarketEfficiencyResult,
  AutocorrelationNoiseResult,
  MartingaleDifferenceResult,
  LongMemoryResult,
  econometricsFormulas
} from '@/lib/advancedEconometrics';
import { formatPrecision } from '@/lib/metricClassification';
import { Progress } from '@/components/ui/progress';

interface MarketEfficiencyPanelProps {
  marketEfficiency: MarketEfficiencyResult;
  autocorrelationNoise: AutocorrelationNoiseResult;
  martingaleDifference: MartingaleDifferenceResult;
  longMemory: LongMemoryResult;
  overallEfficiency: 'Efficient' | 'Normal' | 'Inefficient';
  auditMode?: boolean;
}

function EfficiencyIcon({ isEfficient }: { isEfficient: boolean }) {
  return isEfficient
    ? <CheckCircle className="w-4 h-4 text-primary" />
    : <XCircle className="w-4 h-4 text-destructive" />;
}

export function MarketEfficiencyPanel({
  marketEfficiency,
  autocorrelationNoise,
  martingaleDifference,
  longMemory,
  overallEfficiency,
  auditMode = false
}: MarketEfficiencyPanelProps) {
  const efficiencyColor = overallEfficiency === 'Efficient'
    ? 'bg-primary/20 text-primary'
    : overallEfficiency === 'Normal'
      ? 'bg-muted text-muted-foreground'
      : 'bg-destructive/20 text-destructive';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Market Efficiency
          </h2>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${efficiencyColor}`}>
          {overallEfficiency}
        </span>
      </div>

      <div className="space-y-4">
        {/* MEC */}
        <div className="py-2 border-b border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">Hasbrouck MEC</span>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-popover border-border">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">{econometricsFormulas.marketEfficiency.name}</p>
                    <p className="font-mono text-muted-foreground text-[10px]">{econometricsFormulas.marketEfficiency.formula}</p>
                    <p className="text-foreground">{econometricsFormulas.marketEfficiency.interpretation}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-foreground">
              {formatPrecision(marketEfficiency.mec * 100, 1)}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${marketEfficiency.classification === 'Efficient'
                ? 'bg-primary/20 text-primary'
                : marketEfficiency.classification === 'Normal'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-yellow-500/20 text-yellow-600'
              }`}>
              {marketEfficiency.classification}
            </span>
          </div>
        </div>

        {/* Autocorrelation Noise */}
        <div className="py-2 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Return Autocorrelation</span>
            <span className="font-mono text-sm text-foreground">
              ρ₁ = {formatPrecision(autocorrelationNoise.rho1, 3)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {autocorrelationNoise.hasBidAskBounce && (
                <span className="text-xs text-yellow-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Bid-Ask Bounce
                </span>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground`}>
              {autocorrelationNoise.classification}
            </span>
          </div>
          {auditMode && (
            <p className="mt-2 text-[10px] font-mono text-muted-foreground">
              NSR = {formatPrecision(autocorrelationNoise.noiseSignalRatio, 3)}
            </p>
          )}
        </div>

        {/* Martingale Difference Test */}
        <div className="py-2 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Martingale Test</span>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-popover border-border">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">{econometricsFormulas.martingaleDifference.name}</p>
                    <p className="font-mono text-muted-foreground text-[10px]">{econometricsFormulas.martingaleDifference.formula}</p>
                    <p className="text-foreground">{econometricsFormulas.martingaleDifference.interpretation}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EfficiencyIcon isEfficient={martingaleDifference.isEfficient} />
              <span className="font-mono text-sm text-foreground">
                p = {formatPrecision(martingaleDifference.pValue, 3)}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${martingaleDifference.classification === 'Efficient'
                ? 'bg-primary/20 text-primary'
                : martingaleDifference.classification === 'Weak-form'
                  ? 'bg-yellow-500/20 text-yellow-600'
                  : 'bg-destructive/20 text-destructive'
              }`}>
              {martingaleDifference.classification}
            </span>
          </div>
        </div>

        {/* Long Memory */}
        <div className="py-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Volatility Persistence</span>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-popover border-border">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground">{econometricsFormulas.longMemory.name}</p>
                    <p className="font-mono text-muted-foreground text-[10px]">{econometricsFormulas.longMemory.formula}</p>
                    <p className="text-foreground">{econometricsFormulas.longMemory.interpretation}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Persistence Parameter</span>
              <span className="font-mono text-sm text-foreground">
                d = {formatPrecision(longMemory.persistenceParameter, 2)}
              </span>
            </div>
            <Progress
              value={longMemory.persistenceParameter * 100}
              className="h-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Half-life: {longMemory.halfLife} bars
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${longMemory.classification === 'Short-memory'
                ? 'bg-primary/20 text-primary'
                : longMemory.classification === 'Intermediate'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-yellow-500/20 text-yellow-600'
              }`}>
              {longMemory.classification}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
