import { AlertTriangle, XCircle } from 'lucide-react';
import { VolumeDataStatus } from '@/lib/metricClassification';

interface VolumeDataWarningProps {
  status: VolumeDataStatus;
  dismissable?: boolean;
  onDismiss?: () => void;
}

export function VolumeDataWarning({ status, dismissable = false, onDismiss }: VolumeDataWarningProps) {
  if (status.status === 'valid') return null;

  const isDisabled = status.status === 'disabled';

  return (
    <div className={`
      flex items-start gap-3 p-4 border rounded-lg
      ${isDisabled
        ? 'bg-destructive/10 border-destructive/50'
        : 'bg-yellow-500/10 border-yellow-500/50'}
    `}>
      {isDisabled ? (
        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
      )}

      <div className="flex-1 space-y-2">
        <p className={`text-sm font-semibold ${isDisabled ? 'text-destructive' : 'text-yellow-500'}`}>
          {status.message}
        </p>

        {isDisabled && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              The following metrics have been disabled:
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              <li>VWAP (Volume-Weighted Average Price)</li>
              <li>POC (Point of Control)</li>
              <li>Value Area (VAH/VAL)</li>
              <li>Volume Concentration</li>
              <li>Volume Profile</li>
              <li>Effort vs Result</li>
            </ul>
          </div>
        )}

        {!isDisabled && status.zeroVolumePercent > 0 && (
          <p className="text-xs text-muted-foreground">
            {status.zeroVolumeBarCount} of {status.totalBarCount} bars have zero volume.
            Volume-based metrics may be unreliable.
          </p>
        )}
      </div>

      {dismissable && onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default VolumeDataWarning;
