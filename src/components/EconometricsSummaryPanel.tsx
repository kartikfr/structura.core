import { BarChart3, Droplets, Activity, Brain } from 'lucide-react';
import { AdvancedEconometricsResult } from '@/lib/advancedEconometrics';
import { formatPrecision } from '@/lib/metricClassification';

interface EconometricsSummaryPanelProps {
  econometrics: AdvancedEconometricsResult;
}

export function EconometricsSummaryPanel({ econometrics }: EconometricsSummaryPanelProps) {
  const { summary, volatilityEstimators, volatilityRegime, jumpDetection, martingaleDifference } = econometrics;

  const getSummaryColor = (value: string) => {
    if (value === 'High' || value === 'Efficient' || value === 'Stable') {
      return 'text-primary bg-primary/10 border-primary/30';
    } else if (value === 'Normal' || value === 'Transitioning') {
      return 'text-foreground bg-muted border-border';
    } else {
      return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Econometrics Summary
        </h2>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={`p-3 rounded border ${getSummaryColor(summary.overallLiquidity)}`}>
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Liquidity</span>
          </div>
          <p className="font-mono text-sm font-semibold">{summary.overallLiquidity}</p>
        </div>

        <div className={`p-3 rounded border ${getSummaryColor(summary.overallEfficiency)}`}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Efficiency</span>
          </div>
          <p className="font-mono text-sm font-semibold">{summary.overallEfficiency}</p>
        </div>

        <div className={`p-3 rounded border ${getSummaryColor(summary.regimeStability)}`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Stability</span>
          </div>
          <p className="font-mono text-sm font-semibold">{summary.regimeStability}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Yang-Zhang Vol
          </p>
          <p className="font-mono text-lg text-foreground">
            {formatPrecision(volatilityEstimators.yangZhang * Math.sqrt(252) * 100, 1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">annualized</p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Regime
          </p>
          <p className={`font-mono text-lg ${volatilityRegime.currentRegime === 'Low-Vol' ? 'text-primary' : 'text-destructive'
            }`}>
            {volatilityRegime.currentRegime}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatPrecision(volatilityRegime.regimeProbability * 100, 0)}% conf.
          </p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Jump Ratio
          </p>
          <p className={`font-mono text-lg ${jumpDetection.hasSignificantJump ? 'text-yellow-500' : 'text-foreground'
            }`}>
            {formatPrecision(jumpDetection.jumpRatio * 100, 1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">{jumpDetection.classification}</p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Martingale p
          </p>
          <p className={`font-mono text-lg ${martingaleDifference.isEfficient ? 'text-primary' : 'text-destructive'
            }`}>
            {formatPrecision(martingaleDifference.pValue, 3)}
          </p>
          <p className="text-[10px] text-muted-foreground">{martingaleDifference.classification}</p>
        </div>
      </div>
    </div>
  );
}
