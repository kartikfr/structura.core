import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VolatilityEstimatorsResult, econometricsFormulas } from '@/lib/advancedEconometrics';
import { formatPrecision } from '@/lib/metricClassification';

interface VolatilityEstimatorsPanelProps {
  estimators: VolatilityEstimatorsResult;
  auditMode?: boolean;
}

function EstimatorRow({
  label,
  value,
  formulaKey,
  isPrimary = false
}: {
  label: string;
  value: number;
  formulaKey: keyof typeof econometricsFormulas;
  isPrimary?: boolean;
}) {
  const formula = econometricsFormulas[formulaKey];
  const annualized = value * Math.sqrt(252) * 100;

  return (
    <div className={`flex items-center justify-between py-2 border-b border-border/50 last:border-0 ${isPrimary ? 'bg-primary/5 -mx-2 px-2 rounded' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${isPrimary ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {label}
          {isPrimary && <span className="ml-1 text-[10px] text-primary">(Primary)</span>}
        </span>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs bg-popover border-border">
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-foreground">{formula.name}</p>
                <p className="font-mono text-muted-foreground text-[10px]">{formula.formula}</p>
                <p className="text-foreground">{formula.interpretation}</p>
                <p className="text-muted-foreground italic">Ref: {formula.reference}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">
          {formatPrecision(annualized, 2)}% ann.
        </span>
        <span className={`font-mono text-sm ${isPrimary ? 'text-primary font-semibold' : 'text-foreground'}`}>
          {formatPrecision(value, 4)}
        </span>
      </div>
    </div>
  );
}

export function VolatilityEstimatorsPanel({ estimators, auditMode = false }: VolatilityEstimatorsPanelProps) {
  const validationColor = Math.abs(estimators.validationRatio - 1) < 0.2
    ? 'text-primary'
    : Math.abs(estimators.validationRatio - 1) < 0.4
      ? 'text-yellow-500'
      : 'text-destructive';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Volatility Estimators
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            {estimators.classification}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded bg-muted ${validationColor}`}>
            Ratio: {formatPrecision(estimators.validationRatio, 2)}
          </span>
        </div>
      </div>

      <div className="space-y-0">
        <EstimatorRow
          label="Yang-Zhang"
          value={estimators.yangZhang}
          formulaKey="yangZhang"
          isPrimary
        />
        <EstimatorRow
          label="Garman-Klass"
          value={estimators.garmanKlass}
          formulaKey="garmanKlass"
        />
        <EstimatorRow
          label="Rogers-Satchell"
          value={estimators.rogersSatchell}
          formulaKey="rogersSatchell"
        />
        <EstimatorRow
          label="Parkinson"
          value={estimators.parkinson}
          formulaKey="parkinson"
        />
      </div>

      {auditMode && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] font-mono text-muted-foreground">
            Validation: YZ/GK ratio should be ≈1.0 for consistent data.
            High deviation indicates potential data quality issues or non-standard price dynamics.
          </p>
        </div>
      )}
    </div>
  );
}
