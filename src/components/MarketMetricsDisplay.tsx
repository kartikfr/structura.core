import { useEffect, useState } from 'react';
import { Activity, TrendingUp, BarChart3, Layers, Zap, Target } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  unit?: string;
  icon: React.ElementType;
  status: 'stable' | 'elevated' | 'compressed';
}

export const MarketMetricsDisplay = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Structural Slope', value: '+0.127', icon: TrendingUp, status: 'stable' },
    { label: 'Geometry Density', value: '1.83', icon: Layers, status: 'elevated' },
    { label: 'Auction Participation', value: '1.41x', icon: Activity, status: 'stable' },
    { label: 'Range Position', value: '0.618', icon: Target, status: 'stable' },
    { label: 'Efficiency Ratio', value: '0.472', icon: Zap, status: 'compressed' },
    { label: 'Hurst Exponent', value: '0.534', icon: BarChart3, status: 'stable' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        value: m.label === 'Structural Slope'
          ? (parseFloat(m.value) + (Math.random() - 0.5) * 0.01).toFixed(3).replace(/^(?!-)/, '+')
          : m.label === 'Geometry Density'
            ? (1.5 + Math.random() * 0.5).toFixed(2)
            : m.label === 'Auction Participation'
              ? (1.2 + Math.random() * 0.4).toFixed(2) + 'x'
              : m.label === 'Range Position'
                ? (0.5 + Math.random() * 0.25).toFixed(3)
                : m.label === 'Efficiency Ratio'
                  ? (0.4 + Math.random() * 0.15).toFixed(3)
                  : (0.45 + Math.random() * 0.15).toFixed(3),
      })));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'elevated': return 'text-amber-400/70';
      case 'compressed': return 'text-primary/70';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="structura-panel p-2.5 sm:p-3 group hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <metric.icon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${getStatusColor(metric.status)}`} />
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground truncate">
              {metric.label.split(' ')[0]}
            </span>
          </div>
          <p className="font-mono text-base sm:text-lg text-foreground tracking-tight">
            {metric.value}
          </p>
          <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground mt-0.5 sm:mt-1 truncate">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MarketMetricsDisplay;
