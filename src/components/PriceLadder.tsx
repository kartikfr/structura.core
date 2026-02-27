import { useMemo } from 'react';
import { GannLevel, ConfluenceZone } from '@/lib/geometry';
import { formatInstrumentPrice, getInstrumentPricePrecision } from '@/lib/priceFormatting';

interface PriceLadderProps {
  ltp: number;
  symbol?: string;
  gannLevels: GannLevel[];
  fibLevels: { level: number; ratio: number; type: 'retracement' | 'extension' }[];
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[];
  confluenceZones: ConfluenceZone[];
  poc?: number;
  valueArea?: { vah: number; val: number };
}

interface LevelEntry {
  price: number;
  source: 'sqrt' | 'fib' | 'log' | 'ltp' | 'poc';
  label: string;
  isConfluence: boolean;
  confluenceStrength?: number;
}

export function PriceLadder({
  ltp,
  symbol,
  gannLevels,
  fibLevels,
  logLevels,
  confluenceZones,
  poc,
  valueArea
}: PriceLadderProps) {
  const pricePrecision = useMemo(
    () => getInstrumentPricePrecision({ price: ltp, symbol }),
    [ltp, symbol]
  );

  // Combine all levels into sorted list
  const allLevels = useMemo(() => {
    const levels: LevelEntry[] = [];

    // Add sqrt (formerly gann) levels
    gannLevels.forEach(l => {
      const zone = confluenceZones.find(z => Math.abs(z.centerPrice - l.level) < l.level * 0.001);
      levels.push({
        price: l.level,
        source: 'sqrt',
        label: l.label,
        isConfluence: (zone?.strength || 0) >= 2,
        confluenceStrength: zone?.strength
      });
    });

    // Add fibonacci levels
    fibLevels.forEach(l => {
      const zone = confluenceZones.find(z => Math.abs(z.centerPrice - l.level) < l.level * 0.001);
      levels.push({
        price: l.level,
        source: 'fib',
        label: `${(l.ratio * 100).toFixed(1)}% ${l.type}`,
        isConfluence: (zone?.strength || 0) >= 2,
        confluenceStrength: zone?.strength
      });
    });

    // Add log levels
    logLevels.forEach(l => {
      const zone = confluenceZones.find(z => Math.abs(z.centerPrice - l.level) < l.level * 0.001);
      levels.push({
        price: l.level,
        source: 'log',
        label: `${l.percent}% ${l.direction}`,
        isConfluence: (zone?.strength || 0) >= 2,
        confluenceStrength: zone?.strength
      });
    });

    // Add LTP marker
    levels.push({
      price: ltp,
      source: 'ltp',
      label: 'LTP',
      isConfluence: false
    });

    // Add POC if available
    if (poc && poc > 0) {
      levels.push({
        price: poc,
        source: 'poc',
        label: 'POC',
        isConfluence: false
      });
    }

    // Sort by price descending
    return levels.sort((a, b) => b.price - a.price);
  }, [ltp, gannLevels, fibLevels, logLevels, confluenceZones, poc]);

  // Get price range for positioning
  const priceRange = useMemo(() => {
    const prices = allLevels.map(l => l.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allLevels]);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'sqrt': return 'hsl(var(--gann-gold))';
      case 'fib': return 'hsl(var(--fib-cyan))';
      case 'log': return 'hsl(var(--log-violet))';
      case 'ltp': return 'hsl(var(--primary))';
      case 'poc': return 'hsl(var(--confluence))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getSourceBg = (source: string) => {
    switch (source) {
      case 'sqrt': return 'hsl(var(--gann-gold) / 0.15)';
      case 'fib': return 'hsl(var(--fib-cyan) / 0.15)';
      case 'log': return 'hsl(var(--log-violet) / 0.15)';
      case 'ltp': return 'hsl(var(--primary) / 0.25)';
      case 'poc': return 'hsl(var(--confluence) / 0.2)';
      default: return 'hsl(var(--muted) / 0.5)';
    }
  };

  // Check if price is in value area
  const isInValueArea = (price: number) => {
    if (!valueArea) return false;
    return price >= valueArea.val && price <= valueArea.vah;
  };

  return (
    <div className="glass-panel p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Price Ladder — All Geometry Levels
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSourceColor('sqrt') }} />
          <span className="text-muted-foreground">SRL</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSourceColor('fib') }} />
          <span className="text-muted-foreground">Fibonacci</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSourceColor('log') }} />
          <span className="text-muted-foreground">Log</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSourceColor('poc') }} />
          <span className="text-muted-foreground">POC</span>
        </div>
        {valueArea && (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-4 h-2.5 rounded bg-[hsl(var(--accent)/0.3)]" />
            <span className="text-muted-foreground">Value Area</span>
          </div>
        )}
      </div>

      {/* Price Ladder */}
      <div className="relative max-h-[400px] overflow-y-auto space-y-0.5">
        {allLevels.map((level, i) => {
          const isLTP = level.source === 'ltp';
          const inVA = isInValueArea(level.price);

          return (
            <div
              key={`${level.source}-${level.price}-${i}`}
              className={`flex items-center gap-2 py-1.5 px-2 rounded transition-colors ${isLTP
                  ? 'bg-primary/20 border border-primary/40'
                  : level.isConfluence
                    ? 'bg-[hsl(var(--confluence)/0.1)] border-l-2 border-[hsl(var(--confluence))]'
                    : inVA
                      ? 'bg-[hsl(var(--accent)/0.1)]'
                      : 'hover:bg-muted/30'
                }`}
            >
              {/* Source indicator */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getSourceColor(level.source) }}
              />

              {/* Price */}
              <span className={`font-mono text-sm flex-1 ${isLTP ? 'font-bold text-primary' : 'text-foreground'}`}>
                {formatInstrumentPrice(level.price, { precision: pricePrecision })}
              </span>

              {/* Label */}
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: getSourceBg(level.source),
                  color: getSourceColor(level.source)
                }}
              >
                {level.label}
              </span>

              {/* Confluence badge */}
              {level.isConfluence && level.confluenceStrength && (
                <span className="confluence-badge text-[10px]">
                  {level.confluenceStrength}x
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
        <span>{allLevels.length} total levels</span>
        <span>{allLevels.filter(l => l.isConfluence).length} confluence zones</span>
      </div>
    </div>
  );
}
