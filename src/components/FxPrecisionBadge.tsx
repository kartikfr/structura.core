import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Zap } from 'lucide-react';
import { getInstrumentMeta, getSrlNormalizationInfo, InstrumentType } from '@/lib/priceFormatting';

interface FxPrecisionBadgeProps {
  symbol?: string;
  anchor: number;
  ltp: number;
}

function getTypeLabel(type: InstrumentType): string {
  switch (type) {
    case 'fx': return 'FX';
    case 'commodity': return 'Commodity';
    case 'index': return 'Index';
    default: return 'Unknown';
  }
}

function getTypeBadgeClass(type: InstrumentType): string {
  switch (type) {
    case 'fx': return 'bg-[hsl(var(--fib-cyan)/0.2)] text-[hsl(var(--fib-cyan))] border-[hsl(var(--fib-cyan)/0.4)]';
    case 'commodity': return 'bg-[hsl(var(--gann-gold)/0.2)] text-[hsl(var(--gann-gold))] border-[hsl(var(--gann-gold)/0.4)]';
    case 'index': return 'bg-[hsl(var(--log-violet)/0.2)] text-[hsl(var(--log-violet))] border-[hsl(var(--log-violet)/0.4)]';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function FxPrecisionBadge({ symbol, anchor, ltp }: FxPrecisionBadgeProps) {
  const meta = getInstrumentMeta({ price: ltp, symbol });
  const srlInfo = getSrlNormalizationInfo(anchor);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={`font-mono text-[9px] px-1.5 py-0.5 h-5 ${getTypeBadgeClass(meta.type)}`}
            >
              {getTypeLabel(meta.type)}
              {meta.srlUseIntegerSpace && (
                <Zap className="w-2.5 h-2.5 ml-0.5" />
              )}
            </Badge>
            <span className="font-mono text-[9px] text-muted-foreground">
              {meta.displayPrecision}dp
            </span>
            <Info className="w-3 h-3 text-muted-foreground/60" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs bg-popover border-border p-3">
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-foreground border-b border-border pb-1.5">
              Instrument Classification
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-mono text-foreground">{getTypeLabel(meta.type)}</span>

              <span className="text-muted-foreground">Display Precision:</span>
              <span className="font-mono text-foreground">{meta.displayPrecision} decimals</span>

              {meta.base && (
                <>
                  <span className="text-muted-foreground">Base:</span>
                  <span className="font-mono text-foreground">{meta.base}</span>
                </>
              )}

              {meta.quote && (
                <>
                  <span className="text-muted-foreground">Quote:</span>
                  <span className="font-mono text-foreground">{meta.quote}</span>
                </>
              )}
            </div>

            <div className="font-semibold text-foreground border-b border-border pb-1.5 pt-2">
              SRL Calculation Mode
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Integer-Space:</span>
              <span className={`font-mono ${srlInfo.needsNormalization ? 'text-primary' : 'text-muted-foreground'}`}>
                {srlInfo.needsNormalization ? 'Active' : 'Off'}
              </span>

              {srlInfo.needsNormalization && (
                <>
                  <span className="text-muted-foreground">Scale Factor:</span>
                  <span className="font-mono text-foreground">10^{srlInfo.decimals} = {srlInfo.scaleFactor.toLocaleString()}</span>

                  <span className="text-muted-foreground">Anchor (Int):</span>
                  <span className="font-mono text-foreground">{srlInfo.anchorInt.toLocaleString()}</span>

                  <span className="text-muted-foreground">√Anchor:</span>
                  <span className="font-mono text-foreground">{srlInfo.sqrtAnchor.toFixed(4)}</span>
                </>
              )}
            </div>

            <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
              {srlInfo.needsNormalization
                ? 'FX normalization scales price to integer space for geometrically valid SRL calculations.'
                : 'Direct SRL calculation (no integer-space normalization required).'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
