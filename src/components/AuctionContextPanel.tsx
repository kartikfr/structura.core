import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Info, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AuctionEngineResult, auctionFormulas } from '@/lib/auctionEngine';

interface AuctionContextPanelProps {
  auction: AuctionEngineResult;
  ltp: number;
}

function FormulaTooltip({
  formulaKey
}: {
  formulaKey: keyof typeof auctionFormulas
}) {
  const formula = auctionFormulas[formulaKey];

  return (
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
  );
}

function MetricRow({
  label,
  value,
  subValue,
  formulaKey,
  highlight
}: {
  label: string;
  value: string;
  subValue?: string;
  formulaKey: keyof typeof auctionFormulas;
  highlight?: 'up' | 'down' | 'neutral';
}) {
  const highlightClass = highlight === 'up'
    ? 'text-[hsl(var(--trend-up))]'
    : highlight === 'down'
      ? 'text-[hsl(var(--trend-down))]'
      : 'text-foreground';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <FormulaTooltip formulaKey={formulaKey} />
      </div>
      <div className="text-right">
        <span className={`font-mono text-sm ${highlightClass}`}>{value}</span>
        {subValue && (
          <span className="text-xs text-muted-foreground ml-2">{subValue}</span>
        )}
      </div>
    </div>
  );
}

export function AuctionContextPanel({ auction, ltp }: AuctionContextPanelProps) {
  const {
    sessionOpen,
    priceVsOpen,
    vwap,
    range,
    poc,
    valueArea,
    volumeConcentration,
    compression,
    effortResult
  } = auction;

  // Determine price direction
  const priceDirection = priceVsOpen > 0.5 ? 'up' : priceVsOpen < -0.5 ? 'down' : 'neutral';
  const vwapDirection = vwap.deviation > 0.5 ? 'up' : vwap.deviation < -0.5 ? 'down' : 'neutral';

  // Price in value area check
  const inValueArea = ltp >= valueArea.val && ltp <= valueArea.vah;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Auction Context (Session-Anchored)
        </h2>
      </div>

      {/* Institutional Disclaimer */}
      <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-muted/30 border border-border/50">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Volume context is derived from tick volume distribution across OHLCV bars.
          This is a mathematical proxy, not actual transaction data.
          All metrics reset at session open. No predictions or recommendations implied.
        </p>
      </div>

      {/* Session Open Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
          Session Anchor
          <span className="text-[10px] font-mono text-muted-foreground/70">
            ({auction.session.sessionDate})
          </span>
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <MetricRow
            label="Session Open"
            value={sessionOpen.toFixed(2)}
            formulaKey="priceVsOpen"
          />
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted-foreground">Price vs Open</span>
            <div className="flex items-center gap-2">
              {priceDirection === 'up' ? (
                <TrendingUp className="w-4 h-4 text-[hsl(var(--trend-up))]" />
              ) : priceDirection === 'down' ? (
                <TrendingDown className="w-4 h-4 text-[hsl(var(--trend-down))]" />
              ) : (
                <Minus className="w-4 h-4 text-[hsl(var(--neutral))]" />
              )}
              <span className={`font-mono text-sm ${priceDirection === 'up' ? 'text-[hsl(var(--trend-up))]' :
                  priceDirection === 'down' ? 'text-[hsl(var(--trend-down))]' : 'text-foreground'
                }`}>
                {priceVsOpen >= 0 ? '+' : ''}{priceVsOpen.toFixed(2)} ATR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VWAP Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Volume-Weighted Context
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <MetricRow
            label="Session VWAP"
            value={vwap.price.toFixed(2)}
            subValue={vwap.classification}
            formulaKey="vwap"
          />
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted-foreground">VWAP Distance</span>
            <span className={`font-mono text-sm ${vwapDirection === 'up' ? 'text-[hsl(var(--trend-up))]' :
                vwapDirection === 'down' ? 'text-[hsl(var(--trend-down))]' : 'text-foreground'
              }`}>
              {vwap.deviation >= 0 ? '+' : ''}{vwap.deviation.toFixed(2)} ATR
            </span>
          </div>
          <div className="pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground font-mono">
              Formula: {vwap.formula}
            </p>
          </div>
        </div>
      </div>

      {/* POC & Value Area Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Volume Profile
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <MetricRow
            label="POC (Point of Control)"
            value={poc.price.toFixed(2)}
            subValue={`${poc.percentage.toFixed(1)}% of volume`}
            formulaKey="poc"
          />
          <div className="py-2.5 border-b border-border/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Value Area ({valueArea.targetPercent}%)</span>
                <FormulaTooltip formulaKey="valueArea" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${inValueArea
                  ? 'bg-[hsl(var(--trend-up)/0.15)] text-[hsl(var(--trend-up))]'
                  : 'bg-[hsl(var(--trend-down)/0.15)] text-[hsl(var(--trend-down))]'
                }`}>
                {inValueArea ? 'In VA' : 'Outside VA'}
              </span>
            </div>
            <div className="font-mono text-sm text-foreground">
              {valueArea.val.toFixed(2)} — {valueArea.vah.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Width: {valueArea.width.toFixed(2)} pts
            </div>
          </div>
          <MetricRow
            label="Volume Concentration"
            value={`${(volumeConcentration * 100).toFixed(1)}%`}
            subValue="top 3 bins"
            formulaKey="volumeConcentration"
          />
        </div>
      </div>

      {/* Range Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Session Range
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Session Range</span>
            <span className="font-mono text-sm text-foreground">
              {range.sessionLow.toFixed(2)} — {range.sessionHigh.toFixed(2)}
            </span>
          </div>
          <div className="py-2.5 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Range Position</span>
                <FormulaTooltip formulaKey="rangePosition" />
              </div>
              <span className="font-mono text-sm text-foreground">
                {(range.rangePosition * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--trend-down))] via-[hsl(var(--neutral))] to-[hsl(var(--trend-up))] rounded-full"
                style={{ width: '100%' }}
              />
            </div>
            <div
              className="w-2 h-2 bg-primary rounded-full -mt-2 border border-background"
              style={{ marginLeft: `calc(${Math.min(100, Math.max(0, range.rangePosition * 100))}% - 4px)` }}
            />
          </div>
          <MetricRow
            label="Initial Balance"
            value={range.initialBalance.width.toFixed(2)}
            subValue={`${range.initialBalance.barsUsed} bars`}
            formulaKey="initialBalance"
          />
        </div>
      </div>

      {/* Compression & Effort */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Structure Metrics
        </h3>
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="py-2.5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Compression</span>
                <FormulaTooltip formulaKey="compression" />
              </div>
              <div className="text-right">
                <span className="font-mono text-sm text-foreground">
                  {compression.percentOfAverage.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-2">of avg</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">{compression.unit}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${compression.trend === 'contracting'
                  ? 'bg-blue-500/20 text-blue-400'
                  : compression.trend === 'expanding'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                {compression.trend}
              </span>
            </div>
          </div>
          <MetricRow
            label="Effort vs Result"
            value={effortResult.ratio.toFixed(2)}
            subValue={effortResult.classification}
            formulaKey="effortResult"
          />
        </div>
      </div>
    </div>
  );
}