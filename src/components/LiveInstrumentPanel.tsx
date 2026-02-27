import { useState, useEffect } from 'react';

interface Instrument {
  symbol: string;
  name: string;
  price: number;
  change: number;
  category: string;
}

const initialInstruments: Instrument[] = [
  { symbol: 'EUR/USD', name: 'Euro/Dollar', price: 1.0847, change: 0.12, category: 'FX' },
  { symbol: 'GBP/USD', name: 'Cable', price: 1.2634, change: -0.08, category: 'FX' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 149.82, change: 0.23, category: 'FX' },
  { symbol: 'AUD/USD', name: 'Aussie', price: 0.6542, change: 0.05, category: 'FX' },
  { symbol: 'XAU/USD', name: 'Gold', price: 2041.50, change: 0.40, category: 'Metal' },
  { symbol: 'XAG/USD', name: 'Silver', price: 22.85, change: -0.15, category: 'Metal' },
  { symbol: 'WTI', name: 'Crude Oil', price: 78.42, change: -0.82, category: 'Energy' },
  { symbol: 'BRENT', name: 'Brent Crude', price: 82.15, change: -0.65, category: 'Energy' },
];

export const LiveInstrumentPanel = () => {
  const [instruments, setInstruments] = useState(initialInstruments);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const updateIndex = Math.floor(Math.random() * instruments.length);
      setFlashIndex(updateIndex);

      setInstruments(prev => prev.map((inst, i) => {
        if (i === updateIndex) {
          const priceChange = (Math.random() - 0.5) * inst.price * 0.0002;
          return {
            ...inst,
            price: inst.price + priceChange,
            change: inst.change + (Math.random() - 0.5) * 0.02,
          };
        }
        return inst;
      }));

      setTimeout(() => setFlashIndex(null), 300);
    }, 1500);

    return () => clearInterval(interval);
  }, [instruments.length]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('JPY')) return price.toFixed(2);
    if (symbol.includes('/')) return price.toFixed(4);
    return price.toFixed(2);
  };

  return (
    <div className="structura-panel overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Live Structure Feed
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-[9px] text-primary">LIVE</span>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {instruments.map((inst, i) => (
          <div
            key={inst.symbol}
            className={`px-4 py-2.5 flex items-center justify-between transition-all duration-300 ${flashIndex === i ? 'bg-primary/10' : ''
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-muted-foreground/60 w-12">
                {inst.category}
              </span>
              <div>
                <span className="font-mono text-xs text-foreground">{inst.symbol}</span>
                <span className="font-mono text-[9px] text-muted-foreground ml-2 hidden sm:inline">
                  {inst.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`font-mono text-xs tabular-nums transition-colors duration-300 ${flashIndex === i ? 'text-primary' : 'text-foreground'
                }`}>
                {formatPrice(inst.price, inst.symbol)}
              </span>
              <span className={`font-mono text-[10px] tabular-nums w-14 text-right ${inst.change >= 0 ? 'text-primary/80' : 'text-destructive/60'
                }`}>
                {inst.change >= 0 ? '+' : ''}{inst.change.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveInstrumentPanel;
