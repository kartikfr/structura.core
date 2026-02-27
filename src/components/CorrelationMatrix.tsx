import { useMemo } from 'react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface CorrelationMatrixProps {
  closes: number[];
  hurst: number;
  atr: number;
  atrPercent: number;
  ltp: number;
}

interface CorrelationCell {
  row: string;
  col: string;
  value: number;
  strength: 'strong-positive' | 'moderate-positive' | 'weak' | 'moderate-negative' | 'strong-negative';
}

// Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

// Calculate rolling returns
function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

// Calculate rolling volatility (std dev of returns)
function calculateRollingVolatility(prices: number[], window: number = 5): number[] {
  const returns = calculateReturns(prices);
  const volatility: number[] = [];

  for (let i = window - 1; i < returns.length; i++) {
    const windowReturns = returns.slice(i - window + 1, i + 1);
    const mean = windowReturns.reduce((a, b) => a + b, 0) / window;
    const variance = windowReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / window;
    volatility.push(Math.sqrt(variance));
  }

  return volatility;
}

// Calculate rolling momentum (rate of change)
function calculateMomentum(prices: number[], period: number = 5): number[] {
  const momentum: number[] = [];
  for (let i = period; i < prices.length; i++) {
    momentum.push((prices[i] - prices[i - period]) / prices[i - period]);
  }
  return momentum;
}

// Calculate mean reversion indicator (distance from SMA)
function calculateMeanReversion(prices: number[], period: number = 10): number[] {
  const reversion: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sma = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    reversion.push((prices[i] - sma) / sma);
  }
  return reversion;
}

function getStrength(value: number): CorrelationCell['strength'] {
  if (value >= 0.7) return 'strong-positive';
  if (value >= 0.3) return 'moderate-positive';
  if (value <= -0.7) return 'strong-negative';
  if (value <= -0.3) return 'moderate-negative';
  return 'weak';
}

const correlationFormulas = {
  pearson: {
    name: 'Pearson Correlation (r)',
    formula: 'r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]',
    interpretation: 'Measures linear relationship between two variables. Range: -1 (perfect negative) to +1 (perfect positive)',
    limitation: 'Only captures linear relationships; sensitive to outliers'
  },
  returns: {
    name: 'Price Returns',
    formula: 'Rₜ = (Pₜ - Pₜ₋₁) / Pₜ₋₁',
    interpretation: 'Percentage change between consecutive prices',
    limitation: 'Assumes continuous compounding'
  },
  volatility: {
    name: 'Rolling Volatility',
    formula: 'σ = √[Σ(Rᵢ - R̄)² / n]',
    interpretation: 'Standard deviation of returns over rolling window',
    limitation: 'Lookback-dependent; lags actual volatility changes'
  },
  momentum: {
    name: 'Momentum (ROC)',
    formula: 'ROC = (Pₜ - Pₜ₋ₙ) / Pₜ₋ₙ',
    interpretation: 'Rate of change over n periods',
    limitation: 'Fixed lookback may miss regime changes'
  },
  meanReversion: {
    name: 'Mean Reversion Score',
    formula: 'MR = (P - SMAₙ) / SMAₙ',
    interpretation: 'Distance from simple moving average, normalized',
    limitation: 'SMA period affects sensitivity'
  }
};

export function CorrelationMatrix({ closes, hurst, atr, atrPercent, ltp }: CorrelationMatrixProps) {
  const correlations = useMemo(() => {
    if (closes.length < 15) return null;

    const returns = calculateReturns(closes);
    const volatility = calculateRollingVolatility(closes);
    const momentum = calculateMomentum(closes);
    const meanReversion = calculateMeanReversion(closes);

    // Align arrays to same length
    const minLen = Math.min(returns.length, volatility.length, momentum.length, meanReversion.length);
    const alignedReturns = returns.slice(-minLen);
    const alignedVolatility = volatility.slice(-minLen);
    const alignedMomentum = momentum.slice(-minLen);
    const alignedMeanReversion = meanReversion.slice(-minLen);
    const alignedPrices = closes.slice(-minLen);

    const metrics = ['Price', 'Returns', 'Volatility', 'Momentum', 'Mean Rev'];
    const data = [alignedPrices, alignedReturns, alignedVolatility, alignedMomentum, alignedMeanReversion];

    const matrix: CorrelationCell[][] = [];

    for (let i = 0; i < metrics.length; i++) {
      const row: CorrelationCell[] = [];
      for (let j = 0; j < metrics.length; j++) {
        const value = i === j ? 1 : calculateCorrelation(data[i], data[j]);
        row.push({
          row: metrics[i],
          col: metrics[j],
          value,
          strength: getStrength(value)
        });
      }
      matrix.push(row);
    }

    return { matrix, metrics };
  }, [closes]);

  if (!correlations) {
    return (
      <div className="glass-panel p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Correlation Matrix
        </h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Insufficient data for correlation analysis (minimum 15 bars required)
        </div>
      </div>
    );
  }

  const getHeatmapColor = (value: number, isDiagonal: boolean) => {
    if (isDiagonal) return 'bg-muted/30';

    if (value >= 0.7) return 'bg-gradient-to-br from-[hsl(var(--trend-up))] to-[hsl(var(--trend-up)/0.7)]';
    if (value >= 0.3) return 'bg-gradient-to-br from-[hsl(var(--trend-up)/0.6)] to-[hsl(var(--trend-up)/0.3)]';
    if (value <= -0.7) return 'bg-gradient-to-br from-[hsl(var(--trend-down))] to-[hsl(var(--trend-down)/0.7)]';
    if (value <= -0.3) return 'bg-gradient-to-br from-[hsl(var(--trend-down)/0.6)] to-[hsl(var(--trend-down)/0.3)]';
    return 'bg-gradient-to-br from-[hsl(var(--neutral)/0.4)] to-[hsl(var(--neutral)/0.2)]';
  };

  const getTextColor = (value: number, isDiagonal: boolean) => {
    if (isDiagonal) return 'text-muted-foreground';
    if (Math.abs(value) >= 0.5) return 'text-white font-semibold';
    return 'text-foreground';
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[hsl(var(--trend-down))] via-[hsl(var(--neutral))] to-[hsl(var(--trend-up))]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Correlation Matrix
          </h3>
          <TooltipProvider>
            <UITooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm bg-popover border-border">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-foreground">{correlationFormulas.pearson.name}</p>
                  <p className="font-mono text-muted-foreground text-[10px]">{correlationFormulas.pearson.formula}</p>
                  <p className="text-foreground">{correlationFormulas.pearson.interpretation}</p>
                  <p className="text-muted-foreground italic text-[10px]">Limitation: {correlationFormulas.pearson.limitation}</p>
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>

        {/* Regime indicators */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Hurst:</span>
            <span className="font-mono text-foreground">{hurst.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">ATR%:</span>
            <span className="font-mono text-foreground">{atrPercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-1 mb-1">
            <div className="h-10" /> {/* Empty corner */}
            {correlations.metrics.map((metric) => (
              <TooltipProvider key={metric}>
                <UITooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="h-10 flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-help">
                      {metric}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover border-border">
                    <div className="space-y-1.5 text-xs">
                      {metric === 'Price' && <p>Raw closing prices over the analysis period</p>}
                      {metric === 'Returns' && (
                        <>
                          <p className="font-semibold">{correlationFormulas.returns.name}</p>
                          <p className="font-mono text-[10px]">{correlationFormulas.returns.formula}</p>
                        </>
                      )}
                      {metric === 'Volatility' && (
                        <>
                          <p className="font-semibold">{correlationFormulas.volatility.name}</p>
                          <p className="font-mono text-[10px]">{correlationFormulas.volatility.formula}</p>
                        </>
                      )}
                      {metric === 'Momentum' && (
                        <>
                          <p className="font-semibold">{correlationFormulas.momentum.name}</p>
                          <p className="font-mono text-[10px]">{correlationFormulas.momentum.formula}</p>
                        </>
                      )}
                      {metric === 'Mean Rev' && (
                        <>
                          <p className="font-semibold">{correlationFormulas.meanReversion.name}</p>
                          <p className="font-mono text-[10px]">{correlationFormulas.meanReversion.formula}</p>
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Matrix Rows */}
          {correlations.matrix.map((row, i) => (
            <div key={correlations.metrics[i]} className="grid grid-cols-6 gap-1 mb-1">
              {/* Row Label */}
              <div className="h-12 flex items-center justify-end pr-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {correlations.metrics[i]}
              </div>

              {/* Cells */}
              {row.map((cell, j) => {
                const isDiagonal = i === j;
                return (
                  <TooltipProvider key={`${i}-${j}`}>
                    <UITooltip delayDuration={150}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${getHeatmapColor(cell.value, isDiagonal)} ${getTextColor(cell.value, isDiagonal)}`}
                        >
                          <span className="font-mono text-sm">
                            {isDiagonal ? '1.00' : cell.value.toFixed(2)}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border-border">
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold">
                            {cell.row} ↔ {cell.col}
                          </p>
                          <p className="font-mono">r = {cell.value.toFixed(4)}</p>
                          {!isDiagonal && (
                            <p className={`capitalize ${cell.strength.includes('positive') ? 'text-[hsl(var(--trend-up))]' :
                                cell.strength.includes('negative') ? 'text-[hsl(var(--trend-down))]' :
                                  'text-[hsl(var(--neutral))]'
                              }`}>
                              {cell.strength.replace('-', ' ')} correlation
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Color Scale */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Correlation:</span>
            <div className="flex items-center gap-0.5">
              <div className="w-6 h-3 rounded-l bg-[hsl(var(--trend-down))]" />
              <div className="w-6 h-3 bg-[hsl(var(--trend-down)/0.5)]" />
              <div className="w-6 h-3 bg-[hsl(var(--neutral)/0.3)]" />
              <div className="w-6 h-3 bg-[hsl(var(--trend-up)/0.5)]" />
              <div className="w-6 h-3 rounded-r bg-[hsl(var(--trend-up))]" />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
              <span>-1</span>
              <span className="mx-2">0</span>
              <span>+1</span>
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="flex gap-4 text-[10px] text-muted-foreground">
            <span>|r| &gt; 0.7 = Strong</span>
            <span>|r| 0.3-0.7 = Moderate</span>
            <span>|r| &lt; 0.3 = Weak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
