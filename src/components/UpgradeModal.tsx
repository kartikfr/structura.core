import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysesUsed: number;
}

export const UpgradeModal = ({ open, onOpenChange, analysesUsed }: UpgradeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="structura-panel border-border sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-14 h-14 border border-border flex items-center justify-center mx-auto mb-4 bg-muted/30">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <DialogTitle className="font-mono text-lg text-foreground">
            Session Limit Reached
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            {analysesUsed} sessions completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="constraint-block p-5 text-center">
            <span className="font-mono text-2xl font-bold text-foreground">$99</span>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              Permanent Access
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              'Unlimited measurement sessions',
              'Full Structural Intelligence Layer',
              'PDF export with all metrics',
              'No subscriptions, no renewals',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 border border-primary/40 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/crypto-payment" className="w-full">
            <Button className="w-full btn-structura-solid h-11 font-mono text-xs">
              Pay with Crypto
            </Button>
          </Link>
          <Link to="/pricing" className="w-full">
            <Button variant="outline" className="w-full h-10 font-mono text-xs">
              View Pricing Details
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-mono text-[10px] text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
