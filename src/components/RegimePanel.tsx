import { classifyRegime, classifyVolatility, HurstWithValidation } from '@/lib/geometry';
import { ATRValidationResult } from '@/lib/dataValidation';
import { formatATRDisplay, classifyATR, ATRDisplayResult } from '@/lib/atrFormatting';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RegimePanelProps {
  hurst: number;
  atr: number;           // Raw ATR decimal (e.g., 0.00084)
  atrPercent: number;    // ATR as % of price
  ltp: number;           // Current price for pip conversion
  symbol?: string;       // Symbol for instrument detection
  // Enhanced validation props (optional for backward compatibility)
  hurstValidation?: HurstWithValidation;
  atrValidation?: ATRValidationResult;
  auditMode?: boolean;
}

export function RegimePanel({
  hurst,
  atr,
  atrPercent,
  ltp,
  symbol,
  hurstValidation,
  atrValidation,
  auditMode = false
}: RegimePanelProps) {
  const regime = classifyRegime(hurst);
  const volatility = classifyVolatility(atrPercent);

  // A1 FIX: Convert ATR decimal to pips for display
  const atrDisplay: ATRDisplayResult = formatATRDisplay(atr, ltp, symbol);
  const atrClass = classifyATR(atrDisplay.percentValue);

  // Use validation results if available
  const hurstValid = hurstValidation?.isValid ?? true;
  const hurstConfidence = hurstValidation?.confidence ?? 'Medium';
  const atrValid = atrValidation?.isValid ?? atrDisplay.isValid;

  return (
    <div className="glass-panel p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        Market Regime
        {(!hurstValid || !atrValid) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  {!hurstValid && hurstValidation && (
                    <span className="block">Hurst: {hurstValidation.error ?? 'Invalid'}</span>
                  )}
                  {!atrValid && (
                    <span className="block">ATR: {atrDisplay.validationError ?? atrValidation?.validationMessage ?? 'Invalid'}</span>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Hurst Exponent */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <span>Hurst Exponent</span>
            {hurstValid ? (
              <CheckCircle2 className="w-3 h-3 text-primary" />
            ) : (
              <AlertCircle className="w-3 h-3 text-destructive" />
            )}
            {hurstConfidence !== 'Invalid' && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${hurstConfidence === 'High' ? 'bg-primary/20 text-primary' :
                  hurstConfidence === 'Medium' ? 'bg-accent/50 text-foreground' :
                    'bg-muted text-muted-foreground'
                }`}>
                {hurstConfidence}
              </span>
            )}
          </div>
          <div className="font-mono text-3xl font-bold">
            {hurst.toFixed(3)}
          </div>
          <div className={`text-sm font-medium ${regime.class}`}>
            {hurstValid ? regime.regime : 'Indeterminate'}
          </div>

          {/* Visual indicator - 5-tier markers */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[hsl(45_50%_55%)] via-muted-foreground to-[hsl(168_40%_50%)] opacity-30"
              style={{ width: '100%' }}
            />
            {/* Tier boundary markers */}
            <div className="absolute top-0 h-full w-px bg-border/50" style={{ left: '40%' }} />
            <div className="absolute top-0 h-full w-px bg-border/50" style={{ left: '45%' }} />
            <div className="absolute top-0 h-full w-px bg-border/50" style={{ left: '55%' }} />
            <div className="absolute top-0 h-full w-px bg-border/50" style={{ left: '60%' }} />
            <div
              className="absolute top-0 h-full w-1.5 bg-foreground rounded-full"
              style={{ left: `${hurst * 100}%`, transform: 'translateX(-50%)' }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>Strong MR</span>
            <span>Random</span>
            <span>Strong TR</span>
          </div>

          {/* Strategy recommendation */}
          {hurstValid && (
            <p className="text-[10px] text-muted-foreground/80 italic mt-1">
              {regime.recommendation}
            </p>
          )}

          {/* R² display in audit mode */}
          {auditMode && hurstValidation && (
            <div className="text-[9px] font-mono text-muted-foreground bg-muted/50 p-2 rounded">
              R² = {hurstValidation.rSquared.toFixed(3)}
              {hurstValidation.rSquared < 0.85 && ' (< 0.85 threshold)'}
            </div>
          )}
        </div>

        {/* Volatility - A1 FIX: Display ATR in PIPS (primary) + % (secondary) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <span>ATR (Pips)</span>
            {atrValid ? (
              <CheckCircle2 className="w-3 h-3 text-primary" />
            ) : (
              <AlertCircle className="w-3 h-3 text-destructive" />
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">ATR (14-period Wilder)</p>
                    <p>Primary: {atrDisplay.pipsFormatted}</p>
                    <p>Secondary: {atrDisplay.percentFormatted}</p>
                    <p className="text-muted-foreground">Raw: {atrDisplay.absoluteFormatted}</p>
                    <p className="text-muted-foreground">Multiplier: ×{atrDisplay.pipMultiplier}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* PRIMARY DISPLAY: Pips value (large) */}
          <div className="font-mono text-3xl font-bold">
            {atrValid ? atrDisplay.pipsValue.toFixed(1) : '—'}
          </div>

          {/* SECONDARY DISPLAY: Percentage + Classification */}
          <div className={`text-sm font-medium ${atrClass.severity === 'high' ? 'text-destructive' :
              atrClass.severity === 'low' ? 'text-primary' :
                'text-muted-foreground'
            }`}>
            {atrValid ? `${atrClass.label} (${atrDisplay.percentFormatted})` : 'Invalid'}
          </div>

          {/* Visual indicator */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[hsl(var(--fib-cyan))] via-[hsl(var(--neutral))] to-[hsl(var(--trend-down))] opacity-30"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-0 h-full w-1 bg-foreground rounded-full"
              style={{ left: `${Math.min(atrDisplay.percentValue / 5 * 100, 100)}%`, transform: 'translateX(-50%)' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>

          {/* ATR description */}
          {atrValid && (
            <p className="text-[10px] text-muted-foreground/80 italic mt-1">
              {atrClass.description}
            </p>
          )}

          {/* ATR details in audit mode */}
          {auditMode && (
            <div className="text-[9px] font-mono text-muted-foreground bg-muted/50 p-2 rounded space-y-1">
              <div>Pips: {atrDisplay.pipsValue.toFixed(1)}</div>
              <div>Percent: {atrDisplay.percentValue.toFixed(3)}%</div>
              <div>Raw: {atrDisplay.absoluteFormatted}</div>
              <div>Type: {atrDisplay.instrumentType}</div>
              {!atrValid && (
                <div className="text-destructive">{atrDisplay.validationError}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
