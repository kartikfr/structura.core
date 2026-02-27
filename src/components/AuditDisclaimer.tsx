import { AlertTriangle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface AuditDisclaimerProps {
  variant?: 'header' | 'panel' | 'compact';
}

export function AuditDisclaimer({ variant = 'panel' }: AuditDisclaimerProps) {
  const disclaimerText = `STRUCTURA CORE is a deterministic market structure analysis tool.
It does not predict price, generate trades, or estimate probabilities.
All outputs are descriptive and derived from OHLCV data only.
Where data is insufficient, the system refuses to speculate.`;

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded">
              <Info className="w-3 h-3" />
              <span className="uppercase tracking-wider">Non-Predictive</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm bg-popover border-border">
            <p className="text-xs whitespace-pre-line">{disclaimerText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'header') {
    return (
      <div className="bg-muted/30 border-b border-border px-4 py-2">
        <div className="container flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">STRUCTURA CORE</span> is a deterministic market structure analysis tool.
            It does not predict price, generate trades, or estimate probabilities.
            All outputs are descriptive and derived from OHLCV data only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/20 border border-border rounded-lg">
      <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Non-Predictive Analysis Tool
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {disclaimerText}
        </p>
      </div>
    </div>
  );
}

export default AuditDisclaimer;
