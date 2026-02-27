import { getSrlNormalizationInfo, formatInstrumentPrice, getInstrumentMeta } from '@/lib/priceFormatting';
import { calculateGannLevels, GannLevel } from '@/lib/geometry';
import { Badge } from '@/components/ui/badge';

interface SrlDebugPanelProps {
  ltp: number;
  anchor: number;
  symbol?: string;
  gannLevels: GannLevel[];
}

export function SrlDebugPanel({ ltp, anchor, symbol, gannLevels }: SrlDebugPanelProps) {
  const meta = getInstrumentMeta({ price: ltp, symbol });
  const srlInfo = getSrlNormalizationInfo(anchor);

  // Get first 3 levels for display
  const previewLevels = gannLevels.slice(0, 3);

  return (
    <div className="glass-panel p-4 border-2 border-dashed border-primary/30 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 font-mono text-[9px]">
          AUDIT MODE
        </Badge>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
          SRL Normalization Debug
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Raw Inputs */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Raw Inputs</div>
          <div className="font-mono text-xs space-y-0.5">
            <div>LTP: <span className="text-foreground">{ltp}</span></div>
            <div>Anchor: <span className="text-foreground">{anchor}</span></div>
            <div>Symbol: <span className="text-foreground">{symbol || 'Unknown'}</span></div>
          </div>
        </div>

        {/* Instrument Detection */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Detection</div>
          <div className="font-mono text-xs space-y-0.5">
            <div>Type: <span className="text-foreground">{meta.type}</span></div>
            <div>Precision: <span className="text-foreground">{meta.displayPrecision}dp</span></div>
            <div>Int-Space: <span className={srlInfo.needsNormalization ? 'text-primary' : 'text-muted-foreground'}>
              {srlInfo.needsNormalization ? 'YES' : 'NO'}
            </span></div>
          </div>
        </div>

        {/* Normalization Math */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Normalization</div>
          <div className="font-mono text-xs space-y-0.5">
            <div>Decimals: <span className="text-foreground">{srlInfo.decimals}</span></div>
            <div>Scale: <span className="text-foreground">{srlInfo.scaleFactor.toLocaleString()}</span></div>
            <div>P_int: <span className="text-foreground">{srlInfo.anchorInt.toLocaleString()}</span></div>
            <div>√P_int: <span className="text-foreground">{srlInfo.sqrtAnchor.toFixed(4)}</span></div>
          </div>
        </div>

        {/* First 3 SRL Levels */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SRL Levels (First 3)</div>
          <div className="font-mono text-xs space-y-0.5">
            {previewLevels.map((level, i) => (
              <div key={i}>
                <span className="text-muted-foreground">n={level.step > 0 ? '+' : ''}{level.step}: </span>
                <span className="text-foreground">{formatInstrumentPrice(level.level, { symbol, precision: meta.displayPrecision })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formula Display */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground font-mono">
          {srlInfo.needsNormalization ? (
            <>
              <span className="text-primary">Integer-Space Active:</span>{' '}
              P_int = {anchor} × {srlInfo.scaleFactor} = {srlInfo.anchorInt} → √{srlInfo.anchorInt} = {srlInfo.sqrtAnchor.toFixed(4)} → (√P ± n)² / {srlInfo.scaleFactor}
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Direct Mode:</span>{' '}
              √{anchor.toFixed(2)} = {Math.sqrt(anchor).toFixed(4)} → (√P ± n)²
            </>
          )}
        </div>
      </div>
    </div>
  );
}
