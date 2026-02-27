import { useEffect, useState } from 'react';

interface Instrument {
  symbol: string;
  name: string;
  price: number;
  change: number;
  category: 'fx' | 'commodity' | 'index';
}

const initialInstruments: Instrument[] = [
  { symbol: 'EUR/USD', name: 'Euro', price: 1.0847, change: 0.12, category: 'fx' },
  { symbol: 'GBP/USD', name: 'Sterling', price: 1.2634, change: -0.08, category: 'fx' },
  { symbol: 'USD/JPY', name: 'Yen', price: 149.82, change: 0.23, category: 'fx' },
  { symbol: 'XAU/USD', name: 'Gold', price: 2048.35, change: 0.45, category: 'commodity' },
  { symbol: 'XAG/USD', name: 'Silver', price: 24.12, change: -0.32, category: 'commodity' },
  { symbol: 'CL', name: 'Crude Oil', price: 78.45, change: 1.12, category: 'commodity' },
  { symbol: 'ES', name: 'S&P 500', price: 5024.50, change: 0.34, category: 'index' },
  { symbol: 'NQ', name: 'Nasdaq', price: 17842.25, change: 0.56, category: 'index' },
];

export const TradingInstruments = () => {
  const [instruments, setInstruments] = useState(initialInstruments);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * initialInstruments.length);
      setFlashIndex(idx);

      setInstruments(prev => prev.map((inst, i) => {
        if (i !== idx) return inst;
        const delta = (Math.random() - 0.5) * 0.1;
        return {
          ...inst,
          price: parseFloat((inst.price * (1 + delta / 100)).toFixed(
            inst.category === 'fx' ? 4 : 2
          )),
          change: parseFloat((inst.change + (Math.random() - 0.5) * 0.1).toFixed(2)),
        };
      }));

      setTimeout(() => setFlashIndex(null), 300);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'fx': return 'FX';
      case 'commodity': return 'CMDTY';
      case 'index': return 'IDX';
      default: return '';
    }
  };

  return (
    <div className="structura-panel overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Global Instruments · Live Feed
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-[9px] text-primary">CONNECTED</span>
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {instruments.map((inst, i) => (
          <div
            key={inst.symbol}
            className={`px-4 py-2.5 flex items-center justify-between transition-colors ${flashIndex === i ? 'bg-primary/10' : ''
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[8px] text-muted-foreground w-8">
                {getCategoryLabel(inst.category)}
              </span>
              <div>
                <p className="font-mono text-xs text-foreground">{inst.symbol}</p>
                <p className="font-mono text-[9px] text-muted-foreground">{inst.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-mono text-sm ${flashIndex === i ? 'text-primary' : 'text-foreground'}`}>
                {inst.category === 'fx' ? inst.price.toFixed(4) : inst.price.toFixed(2)}
              </p>
              <p className={`font-mono text-[9px] ${inst.change >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                {inst.change >= 0 ? '+' : ''}{inst.change.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradingInstruments;
