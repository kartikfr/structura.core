import { XCircle } from 'lucide-react';
import { DataIntegrityStatus } from '@/lib/metricClassification';

interface DataIntegrityWarningProps {
  status: DataIntegrityStatus;
}

export function DataIntegrityWarning({ status }: DataIntegrityWarningProps) {
  if (status.isComplete) return null;

  return (
    <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6 text-center">
      <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />

      <h3 className="text-lg font-semibold text-destructive mb-2">
        STRUCTURAL ANALYSIS INCOMPLETE
      </h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-foreground mb-1">Reason:</p>
          <ul className="text-muted-foreground">
            {status.missingFields.map((field, i) => (
              <li key={i}>{field}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground mb-1">Affected Layers:</p>
          <ul className="text-muted-foreground">
            {status.affectedLayers.map((layer, i) => (
              <li key={i}>{layer}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground font-mono">
        This message cannot be dismissed. Provide complete data to proceed.
      </p>
    </div>
  );
}

export default DataIntegrityWarning;
