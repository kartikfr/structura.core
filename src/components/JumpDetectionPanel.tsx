import { Info, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { JumpDetectionResult, econometricsFormulas } from '@/lib/advancedEconometrics';
import { formatPrecision } from '@/lib/metricClassification';
import { Progress } from '@/components/ui/progress';

interface JumpDetectionPanelProps {
  jumpDetection: JumpDetectionResult;
  auditMode?: boolean;
}

export function JumpDetectionPanel({ jumpDetection, auditMode = false }: JumpDetectionPanelProps) {
  const formula = econometricsFormulas.bipowerVariation;

  const classificationColor = jumpDetection.classification === 'Continuous'
    ? 'bg-primary/20 text-primary'
    : jumpDetection.classification === 'Jump-present'
      ? 'bg-yellow-500/20 text-yellow-600'
      : 'bg-destructive/20 text-destructive';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${jumpDetection.hasSignificantJump ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Jump Detection
          </h2>
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
        <span className={`text-xs px-2 py-0.5 rounded ${classificationColor}`}>
          {jumpDetection.classification}
        </span>
      </div>

      <div className="space-y-4">
        {/* Jump Ratio Visualization */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Jump Ratio (RV-BV)/RV</span>
            <span className="font-mono text-sm text-foreground">
              {formatPrecision(jumpDetection.jumpRatio * 100, 1)}%
            </span>
          </div>
          <Progress
            value={Math.min(100, jumpDetection.jumpRatio * 100)}
            className="h-2"
          />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>0% (Continuous)</span>
            <span>100% (All Jumps)</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Realized Var</p>
            <p className="font-mono text-sm text-foreground">
              {formatPrecision(jumpDetection.realizedVariance, 4)}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bipower Var</p>
            <p className="font-mono text-sm text-foreground">
              {formatPrecision(jumpDetection.bipowerVariation, 4)}
            </p>
          </div>
        </div>

        {/* Jump Intensity */}
        <div className="flex items-center justify-between py-2 border-t border-border/50">
          <span className="text-sm text-muted-foreground">Jump Intensity</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground">
              {formatPrecision(jumpDetection.jumpIntensity * 100, 1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({jumpDetection.jumpBars.length} jumps)
            </span>
          </div>
        </div>

        {/* Jump Bars List (Audit Mode) */}
        {auditMode && jumpDetection.jumpBars.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-[10px] font-mono text-muted-foreground mb-2">
              Jump bars (3σ threshold):
            </p>
            <div className="flex flex-wrap gap-1">
              {jumpDetection.jumpBars.slice(0, 10).map(idx => (
                <span key={idx} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 text-[10px] font-mono rounded">
                  #{idx}
                </span>
              ))}
              {jumpDetection.jumpBars.length > 10 && (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-mono rounded">
                  +{jumpDetection.jumpBars.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
