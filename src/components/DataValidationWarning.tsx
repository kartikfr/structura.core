import { AlertTriangle, XCircle, Clock, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  barsValidated: number;
  timestampRange: { start: string; end: string };
}

interface DataValidationWarningProps {
  validation: ValidationResult;
}

export function DataValidationWarning({ validation }: DataValidationWarningProps) {
  // Don't render if valid and no warnings
  if (validation.valid && validation.warnings.length === 0) return null;

  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  return (
    <div className="space-y-3">
      {/* Critical Errors - Block Analysis */}
      {hasErrors && (
        <Alert variant="destructive" className="border-2">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-semibold flex items-center gap-2">
            DATA VALIDATION FAILED
            <Badge variant="destructive" className="text-[10px] uppercase">
              Analysis Blocked
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-3 space-y-3">
            <p className="text-sm text-destructive-foreground/80">
              Critical data integrity issues detected. Analysis cannot proceed until resolved.
            </p>
            <ul className="space-y-2">
              {validation.errors.map((error, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-destructive/20 mt-3">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {validation.barsValidated} bars checked
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {validation.timestampRange.start} → {validation.timestampRange.end}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings - Allow Analysis with Caution */}
      {hasWarnings && !hasErrors && (
        <Alert className="border-2 border-accent/50 bg-accent/10">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <AlertTitle className="text-base font-semibold text-accent flex items-center gap-2">
            DATA QUALITY WARNINGS
            <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px] uppercase">
              Proceed with Caution
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              Potential data quality issues detected. Results may be affected.
            </p>
            <ul className="space-y-2">
              {validation.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-0.5">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-accent/20 mt-3">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {validation.barsValidated} bars validated
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {validation.timestampRange.start} → {validation.timestampRange.end}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default DataValidationWarning;