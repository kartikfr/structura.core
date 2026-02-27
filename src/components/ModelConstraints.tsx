import { Lock } from 'lucide-react';

export const ModelConstraints = () => {
  const constraints = [
    { label: 'Data Inputs', value: 'OHLCV only' },
    { label: 'Optimization', value: 'None' },
    { label: 'Parameter Fitting', value: 'None' },
    { label: 'Lookback Windows', value: 'Fixed' },
    { label: 'Recalibration', value: 'Never' },
    { label: 'Probabilities', value: 'Not Used' },
  ];

  return (
    <div className="constraint-block p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Model Constraints
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50 ml-auto">
          Read-Only
        </span>
      </div>

      <div className="space-y-2">
        {constraints.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
            <span className="font-mono text-[11px] text-muted-foreground">{item.label}</span>
            <span className="font-mono text-[11px] text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelConstraints;
