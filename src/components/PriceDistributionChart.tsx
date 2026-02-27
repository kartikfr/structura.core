import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PriceDistributionChartProps {
  closes: number[];
  ltp: number;
}

interface DistributionBin {
  binStart: number;
  binEnd: number;
  binCenter: number;
  count: number;
  frequency: number;
  isMean: boolean;
  isMedian: boolean;
  isWithinStd: boolean;
}

// Formula documentation for tooltips
const formulaDefinitions = {
  mean: {
    name: 'Arithmetic Mean (μ)',
    formula: 'μ = Σxᵢ / n',
    fullFormula: 'μ = (x₁ + x₂ + ... + xₙ) / n',
    interpretation: 'The average closing price. Center of mass for the distribution.',
    useCase: 'Benchmark for deviation metrics; VWAP anchor alternative',
    limitation: 'Sensitive to outliers; may not reflect modal price'
  },
  median: {
    name: 'Median (50th Percentile)',
    formula: 'If n odd: x₍ₙ₊₁₎/₂, If n even: (x₍ₙ/₂₎ + x₍ₙ/₂₊₁₎) / 2',
    fullFormula: 'Sort all values, take middle value(s)',
    interpretation: 'The middle price when sorted. 50% of closes above/below.',
    useCase: 'Robust central tendency in volatile markets',
    limitation: 'Less intuitive for averaging; ignores magnitude'
  },
  stdDev: {
    name: 'Standard Deviation (σ)',
    formula: 'σ = √[Σ(xᵢ - μ)² / n]',
    fullFormula: 'Population std dev: square root of average squared deviation from mean',
    interpretation: '~68% of closes within ±1σ (if normal). Measures dispersion.',
    useCase: 'Volatility proxy; Bollinger-like bands; Z-score denominator',
    limitation: 'Assumes roughly normal distribution'
  },
  skewness: {
    name: 'Skewness (γ₁)',
    formula: 'γ₁ = [Σ((xᵢ - μ)/σ)³] / n',
    fullFormula: 'Third standardized moment of the distribution',
    interpretation: '+ve: Right tail longer (rallies extend), -ve: Left tail longer (selloffs extend)',
    useCase: 'Directional bias detection; Risk asymmetry assessment',
    limitation: 'Sensitive to sample size; >30 bars recommended'
  },
  kurtosis: {
    name: 'Excess Kurtosis (γ₂)',
    formula: 'γ₂ = [Σ((xᵢ - μ)/σ)⁴] / n - 3',
    fullFormula: 'Fourth standardized moment minus 3 (normal = 0)',
    interpretation: '+ve: Fat tails (more extreme moves), -ve: Thin tails (clustered around mean)',
    useCase: 'Tail risk assessment; Black swan probability indicator',
    limitation: 'Requires large samples for stability; >50 bars ideal'
  },
  zScore: {
    name: 'Z-Score',
    formula: 'Z = (x - μ) / σ',
    fullFormula: 'Distance from mean in standard deviation units',
    interpretation: '±1σ = ~68%, ±2σ = ~95%, ±3σ = ~99.7% (if normal)',
    useCase: 'LTP stretch detection; Mean reversion context',
    limitation: 'Normal distribution assumption; fat tails violate probability estimates'
  },
  sturges: {
    name: "Sturges' Rule (Bin Count)",
    formula: 'k = ⌈log₂(n) + 1⌉',
    fullFormula: 'Optimal histogram bins based on sample size',
    interpretation: 'Balances detail vs noise in histogram visualization',
    useCase: 'Automatic bin sizing for price distributions',
    limitation: 'Assumes approximately normal data'
  }
};

function FormulaTooltip({ formulaKey }: { formulaKey: keyof typeof formulaDefinitions }) {
  const def = formulaDefinitions[formulaKey];

  return (
    <TooltipProvider>
      <UITooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <button className="ml-1 text-muted-foreground/50 hover:text-primary transition-colors inline-flex items-center">
            <Info className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm bg-popover border-border p-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="font-bold text-foreground">{def.name}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-2 font-mono text-[10px] text-primary">
              {def.formula}
            </div>
            <p className="text-foreground leading-relaxed">{def.interpretation}</p>
            <div className="pt-1 border-t border-border/50">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground/70">Use: </span>
                {def.useCase}
              </p>
            </div>
            <p className="text-muted-foreground/80 italic text-[10px]">
              ⚠️ {def.limitation}
            </p>
          </div>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}

export function PriceDistributionChart({ closes, ltp }: PriceDistributionChartProps) {
  const stats = useMemo(() => {
    if (closes.length < 3) return null;

    const n = closes.length;
    const sorted = [...closes].sort((a, b) => a - b);

    // Mean
    const mean = closes.reduce((a, b) => a + b, 0) / n;

    // Median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // Standard Deviation
    const variance = closes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Min and Max
    const min = sorted[0];
    const max = sorted[n - 1];

    // Skewness
    const skewness = stdDev > 0
      ? closes.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n
      : 0;

    // Kurtosis (excess)
    const kurtosis = stdDev > 0
      ? (closes.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n) - 3
      : 0;

    // Z-Score of LTP
    const zScore = stdDev > 0 ? (ltp - mean) / stdDev : 0;

    return { mean, median, stdDev, min, max, skewness, kurtosis, n, zScore };
  }, [closes, ltp]);

  const chartData = useMemo(() => {
    if (!stats || closes.length < 3) return [];

    // Create histogram bins (Sturges' rule: k = ceil(log2(n) + 1))
    const numBins = Math.min(25, Math.max(8, Math.ceil(Math.log2(closes.length) + 1)));
    const range = stats.max - stats.min;
    const binWidth = range / numBins;

    // Initialize bins
    const bins: DistributionBin[] = [];
    for (let i = 0; i < numBins; i++) {
      const binStart = stats.min + i * binWidth;
      const binEnd = binStart + binWidth;
      const binCenter = (binStart + binEnd) / 2;

      bins.push({
        binStart,
        binEnd,
        binCenter,
        count: 0,
        frequency: 0,
        isMean: binStart <= stats.mean && stats.mean < binEnd,
        isMedian: binStart <= stats.median && stats.median < binEnd,
        isWithinStd: binCenter >= (stats.mean - stats.stdDev) && binCenter <= (stats.mean + stats.stdDev),
      });
    }

    // Count prices in each bin
    closes.forEach(price => {
      const binIndex = Math.min(
        numBins - 1,
        Math.floor((price - stats.min) / binWidth)
      );
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex].count++;
      }
    });

    // Calculate frequencies
    const maxCount = Math.max(...bins.map(b => b.count));
    bins.forEach(bin => {
      bin.frequency = maxCount > 0 ? (bin.count / closes.length) * 100 : 0;
    });

    return bins;
  }, [closes, stats]);

  if (!stats || chartData.length === 0) {
    return (
      <div className="glass-panel p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Price Distribution Analysis
        </h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Insufficient data for distribution analysis (minimum 3 bars required)
        </div>
      </div>
    );
  }

  const formatPrice = (value: number) => value.toFixed(2);

  const getSkewnessIcon = () => {
    if (stats.skewness > 0.3) return <TrendingUp className="w-3 h-3 text-[hsl(var(--trend-up))]" />;
    if (stats.skewness < -0.3) return <TrendingDown className="w-3 h-3 text-[hsl(var(--trend-down))]" />;
    return <Minus className="w-3 h-3 text-[hsl(var(--neutral))]" />;
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Price Distribution Analysis
          </h3>
          <FormulaTooltip formulaKey="sturges" />
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          n = {stats.n} bars
        </div>
      </div>

      {/* Statistics Summary Cards with Interactive Tooltips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-transparent p-3 rounded-xl border border-[hsl(var(--primary)/0.3)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Mean (μ)
            <FormulaTooltip formulaKey="mean" />
          </div>
          <div className="font-mono text-lg font-bold text-[hsl(var(--primary))]">{formatPrice(stats.mean)}</div>
        </div>
        <div className="bg-gradient-to-br from-[hsl(var(--fib-cyan)/0.15)] to-transparent p-3 rounded-xl border border-[hsl(var(--fib-cyan)/0.3)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Median
            <FormulaTooltip formulaKey="median" />
          </div>
          <div className="font-mono text-lg font-bold text-[hsl(var(--fib-cyan))]">{formatPrice(stats.median)}</div>
        </div>
        <div className="bg-gradient-to-br from-[hsl(var(--log-violet)/0.15)] to-transparent p-3 rounded-xl border border-[hsl(var(--log-violet)/0.3)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Std Dev (σ)
            <FormulaTooltip formulaKey="stdDev" />
          </div>
          <div className="font-mono text-lg font-bold text-[hsl(var(--log-violet))]">{formatPrice(stats.stdDev)}</div>
        </div>
        <div className="bg-gradient-to-br from-[hsl(var(--gann-gold)/0.15)] to-transparent p-3 rounded-xl border border-[hsl(var(--gann-gold)/0.3)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            LTP Z-Score
            <FormulaTooltip formulaKey="zScore" />
          </div>
          <div className={`font-mono text-lg font-bold ${Math.abs(stats.zScore) > 2 ? 'text-[hsl(var(--trend-down))]' :
              Math.abs(stats.zScore) > 1 ? 'text-[hsl(var(--gann-gold))]' :
                'text-[hsl(var(--trend-up))]'
            }`}>
            {stats.zScore > 0 ? '+' : ''}{stats.zScore.toFixed(2)}σ
          </div>
        </div>
      </div>

      {/* Histogram Chart */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
            barCategoryGap="5%"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="barGradientStd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="barGradientMean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--gann-gold))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--gann-gold))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="binCenter"
              tickFormatter={formatPrice}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                padding: '12px',
              }}
              formatter={(value: number, _name: string, entry: { payload?: DistributionBin }) => {
                const bin = entry.payload;
                if (!bin) return [value.toFixed(1), 'Frequency'];
                return [
                  <div key="tooltip" className="space-y-1.5">
                    <div className="font-mono font-semibold">{formatPrice(bin.binStart)} – {formatPrice(bin.binEnd)}</div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Count:</span>
                      <span className="font-mono">{bin.count}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="font-mono">{value.toFixed(1)}%</span>
                    </div>
                    {bin.isMean && <div className="text-[hsl(var(--gann-gold))] font-semibold">✦ Contains Mean</div>}
                    {bin.isMedian && <div className="text-[hsl(var(--fib-cyan))] font-semibold">◆ Contains Median</div>}
                    {bin.isWithinStd && <div className="text-[hsl(var(--accent))] text-[10px]">Within ±1σ</div>}
                  </div>,
                  ''
                ];
              }}
            />

            {/* Mean reference line */}
            <ReferenceLine
              x={stats.mean}
              stroke="hsl(var(--gann-gold))"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'μ',
                position: 'top',
                fill: 'hsl(var(--gann-gold))',
                fontSize: 14,
                fontWeight: 'bold',
              }}
            />

            {/* Median reference line */}
            <ReferenceLine
              x={stats.median}
              stroke="hsl(var(--fib-cyan))"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: 'M',
                position: 'top',
                fill: 'hsl(var(--fib-cyan))',
                fontSize: 14,
                fontWeight: 'bold',
              }}
            />

            {/* LTP reference line */}
            <ReferenceLine
              x={ltp}
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              label={{
                value: 'LTP',
                position: 'top',
                fill: 'hsl(var(--primary))',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            />

            <Bar dataKey="frequency" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isMean
                      ? 'url(#barGradientMean)'
                      : entry.isWithinStd
                        ? 'url(#barGradientStd)'
                        : 'url(#barGradient)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Legend and Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gradient-to-b from-[hsl(var(--accent))] to-[hsl(var(--accent)/0.4)]" />
              <span className="text-muted-foreground">Within ±1σ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-[hsl(var(--gann-gold))]" style={{ borderStyle: 'dashed' }} />
              <span className="text-muted-foreground">Mean (μ)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-[hsl(var(--fib-cyan))]" style={{ borderStyle: 'dashed' }} />
              <span className="text-muted-foreground">Median</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-[hsl(var(--primary))]" />
              <span className="text-muted-foreground">LTP</span>
            </div>
          </div>

          {/* Distribution Shape with Tooltips */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
              <span className="text-muted-foreground">Skewness</span>
              <FormulaTooltip formulaKey="skewness" />
              {getSkewnessIcon()}
              <span className={`font-mono font-semibold ${stats.skewness > 0.5 ? 'text-[hsl(var(--trend-up))]' :
                  stats.skewness < -0.5 ? 'text-[hsl(var(--trend-down))]' :
                    'text-[hsl(var(--neutral))]'
                }`}>
                {stats.skewness > 0 ? '+' : ''}{stats.skewness.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
              <span className="text-muted-foreground">Kurtosis</span>
              <FormulaTooltip formulaKey="kurtosis" />
              <span className={`font-mono font-semibold ${stats.kurtosis > 1 ? 'text-[hsl(var(--trend-down))]' :
                  stats.kurtosis < -1 ? 'text-[hsl(var(--fib-cyan))]' :
                    'text-foreground'
                }`}>
                {stats.kurtosis.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
