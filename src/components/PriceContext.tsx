import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Info, AlertTriangle } from 'lucide-react';

interface PriceContextResult {
  sessionOpen: number;
  priceVsOpen: number;
  sessionStartIndex: number;
}

interface PriceContextProps {
  context: PriceContextResult;
  ltp: number;
}

const priceFormulas = {
  sessionOpen: {
    name: 'Session Open',
    formula: 'First bar open price of current session',
    interpretation: 'Reference anchor for intraday price movement',
    limitation: 'Requires timestamp data for accurate detection'
  },
  priceVsOpen: {
    name: 'Price vs Open',
    formula: '(LTP - Session_Open) / ATR',
    interpretation: 'Normalized distance from session opening price',
    limitation: 'Resets daily; session detection may be approximate'
  },
  range: {
    name: 'Session Range',
    formula: '(Session_High - Session_Low)',
    interpretation: 'Total price movement within the session',
    limitation: 'Only includes bars since session start'
  }
};

function MetricRow({
  label,
  value,
  classification,
  formulaKey
}: {
  label: string;
  value: string;
  classification?: string;
  formulaKey: keyof typeof priceFormulas;
}) {
  const formula = priceFormulas[formulaKey];

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
        {classification && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {classification}
          </span>
        )}
      </div>
    </div>
  );
}

export function PriceContext({ context, ltp }: PriceContextProps) {
  const openSign = context.priceVsOpen >= 0 ? '+' : '';

  // Classification for price vs open
  const absMove = Math.abs(context.priceVsOpen);
  const moveClassification = absMove < 0.5
    ? 'Near Open'
    : absMove < 1.5
      ? 'Moderate Move'
      : 'Extended';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Price Context (Session-Anchored)
        </h2>
      </div>

      <div className="space-y-0">
        <MetricRow
          label="Session Open"
          value={context.sessionOpen.toFixed(2)}
          formulaKey="sessionOpen"
        />

        <MetricRow
          label="Price vs Open"
          value={`${openSign}${context.priceVsOpen.toFixed(2)} ATR`}
          classification={moveClassification}
          formulaKey="priceVsOpen"
        />

        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Current LTP</span>
          <span className="font-mono text-sm font-semibold text-[hsl(var(--primary))]">
            {ltp.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Session Position</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${context.priceVsOpen > 0.5
              ? 'bg-[hsl(var(--trend-up)/0.15)] text-[hsl(var(--trend-up))]'
              : context.priceVsOpen < -0.5
                ? 'bg-[hsl(var(--trend-down)/0.15)] text-[hsl(var(--trend-down))]'
                : 'bg-[hsl(var(--neutral)/0.15)] text-[hsl(var(--neutral))]'
            }`}>
            {context.priceVsOpen > 0.5 ? 'Above Open' : context.priceVsOpen < -0.5 ? 'Below Open' : 'At Open'}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>
            Price context metrics are mathematical observations of price movement relative to session anchor.
            They describe structure, not direction.
          </p>
        </div>
      </div>
    </div>
  );
}
