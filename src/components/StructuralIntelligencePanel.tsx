import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Info, AlertTriangle } from 'lucide-react';
import {
  StructuralIntelligenceResult,
  structuralIntelligenceFormulas
} from '@/lib/structuralIntelligence';

interface StructuralIntelligencePanelProps {
  intelligence: StructuralIntelligenceResult;
}

function FormulaTooltip({ formulaKey }: { formulaKey: keyof typeof structuralIntelligenceFormulas }) {
  const formula = structuralIntelligenceFormulas[formulaKey];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm bg-popover border-border">
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-foreground">{formula.name}</p>
            <p className="font-mono text-muted-foreground text-[10px] break-all">{formula.formula}</p>
            <p className="text-foreground">{formula.interpretation}</p>
            <p className="text-muted-foreground italic">Limitation: {formula.limitation}</p>
            <div className="pt-1 border-t border-border">
              <p className="text-foreground"><span className="font-medium">Use Case:</span> {formula.useCase}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MetricCard({
  label,
  value,
  classification,
  formulaKey,
  children
}: {
  label: string;
  value: string;
  classification: string;
  formulaKey: keyof typeof structuralIntelligenceFormulas;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-muted/20 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <FormulaTooltip formulaKey={formulaKey} />
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {classification}
        </span>
      </div>
      <div className="font-mono text-lg text-foreground">{value}</div>
      {children}
    </div>
  );
}

export function StructuralIntelligencePanel({ intelligence }: StructuralIntelligencePanelProps) {
  const {
    hurstSpectrum,
    hurstStability,
    anchorDominance,
    latticeCompression,
    latticeParticipation,
    structuralResonance,
    structuralIntegrity
  } = intelligence;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Structural Intelligence Layer
        </h2>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-muted/30 border border-border/50">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          These metrics measure structural integrity from OHLCV data using DFA-based analysis.
          They do NOT predict, direct, or recommend. All formulas are auditable and non-tunable.
        </p>
      </div>

      {/* Scale Decomposition */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Scale Decomposition Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MetricCard
            label="DFA Hurst"
            value={hurstSpectrum.overallHurst.toFixed(3)}
            classification={hurstSpectrum.classification}
            formulaKey="hurstSpectrum"
          >
            <div className="mt-2 flex gap-1">
              {hurstSpectrum.scales.map((scale, i) => (
                <div key={scale} className="flex-1 text-center">
                  <div className="text-[9px] text-muted-foreground">{scale}</div>
                  <div className="text-[10px] font-mono text-foreground">
                    {hurstSpectrum.hurstValues[i]?.toFixed(2) ?? '-'}
                  </div>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard
            label="Spectrum Stability"
            value={hurstStability.hss.toFixed(3)}
            classification={hurstStability.classification}
            formulaKey="hurstStability"
          >
            <div className="mt-2">
              <div className="text-[10px] text-muted-foreground">
                σ(H) = {hurstStability.sigma.toFixed(4)}
              </div>
            </div>
          </MetricCard>
        </div>
      </div>

      {/* Anchor-Relative Structure */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Anchor-Relative Structure
        </h3>
        <MetricCard
          label="Anchor Dominance (ASD)"
          value={anchorDominance.asd.toFixed(3)}
          classification={anchorDominance.dominantSide}
          formulaKey="anchorDominance"
        >
          <div className="mt-2 flex justify-between text-[10px]">
            <span className="text-muted-foreground">
              H↑ = {anchorDominance.hurstAbove.toFixed(3)}
            </span>
            <span className="text-muted-foreground">
              H↓ = {anchorDominance.hurstBelow.toFixed(3)}
            </span>
          </div>
        </MetricCard>
      </div>

      {/* Logarithmic Lattice Dynamics */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Logarithmic Lattice Dynamics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MetricCard
            label="Compression Ratio"
            value={latticeCompression.lcr.toFixed(3)}
            classification={latticeCompression.classification}
            formulaKey="latticeCompression"
          >
            <div className="mt-2 text-[10px] text-muted-foreground">
              Spacing: {latticeCompression.currentSpacing.toFixed(2)} / {latticeCompression.medianSpacing.toFixed(2)}
            </div>
          </MetricCard>

          <MetricCard
            label="Participation Entropy"
            value={latticeParticipation.lpi.toFixed(3)}
            classification={latticeParticipation.classification}
            formulaKey="latticeParticipation"
          >
            <div className="mt-2">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: `${latticeParticipation.normalizedLpi * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {(latticeParticipation.normalizedLpi * 100).toFixed(1)}% of max entropy
              </div>
            </div>
          </MetricCard>
        </div>
      </div>

      {/* Structural Integrity & Resonance */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Structural Integrity & Resonance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MetricCard
            label="Integrity Index (SII)"
            value={structuralIntegrity.sii.toFixed(3)}
            classification={structuralIntegrity.classification}
            formulaKey="structuralIntegrity"
          >
            <div className="mt-2 grid grid-cols-3 gap-1 text-[9px]">
              <div className="text-center">
                <div className="text-muted-foreground">H-Bal</div>
                <div className="font-mono text-foreground">
                  {structuralIntegrity.components.hurstBalance.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">ATR-Stab</div>
                <div className="font-mono text-foreground">
                  {structuralIntegrity.components.atrStability.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Geo-Align</div>
                <div className="font-mono text-foreground">
                  {structuralIntegrity.components.geometryAlignment.toFixed(2)}
                </div>
              </div>
            </div>
          </MetricCard>

          <MetricCard
            label="Resonance Power"
            value={structuralResonance.power.toFixed(3)}
            classification={structuralResonance.classification}
            formulaKey="structuralResonance"
          >
            <div className="mt-2 text-[10px] text-muted-foreground">
              Dominant scale: {structuralResonance.dominantScale} bars
            </div>
          </MetricCard>
        </div>
      </div>
    </div>
  );
}
