import { useState, useEffect } from 'react';

interface PriceItem {
  symbol: string;
  price: number;
  change: number;
  type: 'fx' | 'commodity' | 'index';
}

const instruments: PriceItem[] = [
  { symbol: 'EUR/USD', price: 1.0847, change: 0.0012, type: 'fx' },
  { symbol: 'GBP/USD', price: 1.2634, change: -0.0008, type: 'fx' },
  { symbol: 'USD/JPY', price: 149.82, change: 0.34, type: 'fx' },
  { symbol: 'XAU/USD', price: 2041.50, change: 8.20, type: 'commodity' },
  { symbol: 'WTI', price: 78.42, change: -0.65, type: 'commodity' },
  { symbol: 'ES', price: 4892.25, change: 12.50, type: 'index' },
  { symbol: 'NQ', price: 17245.00, change: 45.75, type: 'index' },
  { symbol: 'AUD/USD', price: 0.6542, change: 0.0005, type: 'fx' },
];

export const AnimatedPriceTicker = () => {
  const [prices, setPrices] = useState(instruments);
  const [activeIndex, setActiveIndex] = useState(0);

  // Simulate subtle price movements
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * (item.price * 0.0001),
        change: item.change + (Math.random() - 0.5) * 0.001,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Rotate active instrument
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % prices.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [prices.length]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('/')) {
      return price.toFixed(symbol.includes('JPY') ? 2 : 4);
    }
    return price.toFixed(2);
  };

  return (
    <div className="overflow-hidden">
      {/* Main ticker strip */}
      <div className="flex items-center gap-4 sm:gap-8 animate-scroll">
        {[...prices, ...prices].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 shrink-0 transition-all duration-500"
            style={{
              opacity: i % prices.length === activeIndex ? 1 : 0.5,
            }}
          >
            <span className="font-mono text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">
              {item.symbol}
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-foreground tabular-nums">
              {formatPrice(item.price, item.symbol)}
            </span>
            <span className={`font-mono text-[8px] sm:text-[10px] tabular-nums ${item.change >= 0 ? 'text-primary' : 'text-destructive/70'
              }`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(item.symbol.includes('JPY') ? 2 : 4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedPriceTicker;
