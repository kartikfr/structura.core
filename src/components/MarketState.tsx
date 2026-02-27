import { formatInstrumentPrice } from '@/lib/priceFormatting';

interface MarketStateProps {
  state: string;
  stateClass: string;
  description: string;
  ltp: number;
  symbol?: string;
}

export function MarketState({ state, stateClass, description, ltp, symbol }: MarketStateProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Integrated State
        </h3>
        <div className="font-mono text-sm text-muted-foreground">
          LTP: <span className="text-foreground font-semibold">{formatInstrumentPrice(ltp, { symbol })}</span>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${stateClass}`}>
        <div className="text-2xl font-bold mb-2">{state}</div>
        <div className="text-sm opacity-80">{description}</div>
      </div>

      <div className="mt-4 p-3 rounded bg-muted/50 border border-border">
        <div className="text-xs text-muted-foreground italic">
          "This app is a lens, not a brain. It reveals structure; the trader supplies judgment."
        </div>
      </div>
    </div>
  );
}
