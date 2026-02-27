import { ConfluenceZone, GannLevel } from '@/lib/geometry';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { geometryDescriptions } from '@/lib/conceptDescriptions';
import { formatInstrumentPrice, getInstrumentPricePrecision } from '@/lib/priceFormatting';

interface GeometryLevelsProps {
  gannLevels: GannLevel[];
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[];
  fibLevels: { level: number; ratio: number; type: 'retracement' | 'extension' }[];
  confluenceZones: ConfluenceZone[];
  ltp: number;
  symbol?: string;
}

function ConceptTooltip({ conceptKey }: { conceptKey: keyof typeof geometryDescriptions }) {
  const desc = geometryDescriptions[conceptKey];
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
            <p className="font-semibold text-foreground">{desc.name}</p>
            <p className="text-foreground">{desc.description}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{desc.formula}</p>
            <p className="text-muted-foreground italic">Limitation: {desc.limitation}</p>
            <div className="pt-1 border-t border-border">
              <p className="text-foreground text-[10px]"><span className="font-medium">Use Case:</span> {desc.useCase}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function GeometryLevels({
  gannLevels,
  logLevels,
  fibLevels,
  confluenceZones,
  ltp,
  symbol
}: GeometryLevelsProps) {
  const highConfluence = confluenceZones.filter(z => z.strength >= 2);

  const pricePrecision = getInstrumentPricePrecision({ price: ltp, symbol });

  const allPrices = confluenceZones.map(z => z.centerPrice);
  const supports = allPrices.filter(p => p < ltp).sort((a, b) => b - a);
  const resistances = allPrices.filter(p => p > ltp).sort((a, b) => a - b);

  const nearestSupport = supports[0];
  const nearestResistance = resistances[0];

  return (
    <div className="space-y-4">
      {/* Nearest Levels */}
      <div className="glass-panel p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Nearest Structure
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-[hsl(var(--trend-up)/0.1)] border border-[hsl(var(--trend-up)/0.3)]">
            <div className="text-xs text-muted-foreground mb-1">Support</div>
            <div className="font-mono text-xl text-[hsl(var(--trend-up))]">
              {nearestSupport ? formatInstrumentPrice(nearestSupport, { precision: pricePrecision }) : '—'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(var(--trend-down)/0.1)] border border-[hsl(var(--trend-down)/0.3)]">
            <div className="text-xs text-muted-foreground mb-1">Resistance</div>
            <div className="font-mono text-xl text-[hsl(var(--trend-down))]">
              {nearestResistance ? formatInstrumentPrice(nearestResistance, { precision: pricePrecision }) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* High Confluence Zones */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confluence Zones
            </h3>
            <ConceptTooltip conceptKey="confluence" />
          </div>
          <span className="confluence-badge">{highConfluence.length} High</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {highConfluence.slice(0, 8).map((zone, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border">
              <div className="font-mono text-sm">{formatInstrumentPrice(zone.centerPrice, { precision: pricePrecision })}</div>
              <div className="flex items-center gap-2">
                {zone.levels.some(l => l.source === 'gann') && (
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--gann-gold))]" title="SRL" />
                )}
                {zone.levels.some(l => l.source === 'fib') && (
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--fib-cyan))]" title="Fibonacci" />
                )}
                {zone.levels.some(l => l.source === 'log') && (
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--log-violet))]" title="Log" />
                )}
                <span className="text-xs text-muted-foreground">{zone.strength}x</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Level Lists */}
      <div className="grid grid-cols-3 gap-4">
        {/* Square-Root Lattice Levels */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--gann-gold))]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--gann-gold))]">
              SRL
            </h4>
            <ConceptTooltip conceptKey="gann" />
          </div>
          <div className="space-y-1">
            {gannLevels.map((l, i) => (
              <div key={i} className="level-sqrt pl-2 py-0.5">
                <div className="font-mono text-xs">{formatInstrumentPrice(l.level, { precision: pricePrecision })}</div>
                <div className="text-[10px] text-muted-foreground">{l.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fibonacci Levels */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--fib-cyan))]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--fib-cyan))]">
              Fibonacci
            </h4>
            <ConceptTooltip conceptKey="fibonacci" />
          </div>
          <div className="space-y-1">
            {fibLevels.map((l, i) => (
              <div key={i} className="level-fib pl-2 py-0.5">
                <div className="font-mono text-xs">{formatInstrumentPrice(l.level, { precision: pricePrecision })}</div>
                <div className="text-[10px] text-muted-foreground">
                  {(l.ratio * 100).toFixed(1)}% {l.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log Levels */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--log-violet))]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--log-violet))]">
              Log
            </h4>
            <ConceptTooltip conceptKey="log" />
          </div>
          <div className="space-y-1">
            {logLevels.map((l, i) => (
              <div key={i} className="level-log pl-2 py-0.5">
                <div className="font-mono text-xs">{formatInstrumentPrice(l.level, { precision: pricePrecision })}</div>
                <div className="text-[10px] text-muted-foreground">
                  {l.percent}% {l.direction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
