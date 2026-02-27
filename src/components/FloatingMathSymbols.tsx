import { useEffect, useState } from 'react';

interface FloatingSymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
}

const mathSymbols = ['√', 'Σ', '∫', 'φ', 'π', 'Δ', '∂', '∞', 'λ', 'μ', 'σ', 'ε', 'ρ', 'θ', 'ω'];

export const FloatingMathSymbols = () => {
  const [symbols, setSymbols] = useState<FloatingSymbol[]>([]);

  useEffect(() => {
    const generated: FloatingSymbol[] = [];
    for (let i = 0; i < 20; i++) {
      generated.push({
        id: i,
        symbol: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 16 + 12,
        opacity: Math.random() * 0.08 + 0.02,
        speed: Math.random() * 40 + 30,
        delay: Math.random() * -20,
      });
    }
    setSymbols(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {symbols.map((s) => (
        <div
          key={s.id}
          className="absolute font-mono text-muted-foreground animate-float-symbol"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.speed}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.symbol}
        </div>
      ))}
    </div>
  );
};

export default FloatingMathSymbols;
