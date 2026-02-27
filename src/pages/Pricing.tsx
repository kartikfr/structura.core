import { Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { StructuraLogo } from '@/components/StructuraLogo';

const included = [
  'Unlimited OHLCV data sessions',
  'Deterministic mathematical measurement',
  'Square-Root Lattice structure',
  'Fibonacci & Logarithmic geometry',
  'DFA-based Hurst Spectrum',
  'Structural Integrity Index',
  'Lattice Participation Entropy',
  'PDF export with full documentation',
  'Institutional-grade methodology',
  'Lifetime system updates',
];

const constraints = [
  { label: 'Data Inputs', value: 'OHLCV only' },
  { label: 'Optimization', value: 'None' },
  { label: 'Parameter Fitting', value: 'None' },
  { label: 'Recalibration', value: 'Never' },
];

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-primary/20 bg-card/95 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <StructuraLogo size="sm" animated={false} />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                <span className="font-mono text-sm font-semibold text-primary ml-1">· Core</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">by SwadeshLABS</p>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Access
            </span>
            <h1 className="text-2xl md:text-3xl font-mono font-bold text-foreground mt-2 mb-3">
              Permanent Access
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              One-time payment. Unlimited sessions. No subscriptions.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="structura-panel">
            <div className="p-8 md:p-10 border-b border-border">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl md:text-5xl font-mono font-bold text-foreground">$99</span>
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">USD</span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Permanent Access — One-Time
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Link to="/crypto-payment" className="btn-structura-solid text-xs text-center">
                    Pay with Crypto
                  </Link>
                  <Link to="/signup" className="btn-structura-outline text-xs text-center">
                    Sign Up First
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 border-b border-border">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-5">
                Included
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {included.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 border border-primary/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <span className="font-mono text-[11px] text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model constraints */}
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Model Constraints
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {constraints.map((item, index) => (
                  <div key={index}>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="font-mono text-xs text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-10 text-center">
            <p className="font-mono text-[9px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              This system measures market structure. It does not provide predictive claims,
              directives, or recommendations. All operator decisions remain with the operator.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 mt-auto">
        <div className="container mx-auto flex items-center justify-between">
          <p className="font-mono text-[9px] text-muted-foreground">
            © 2026 SwadeshLABS — STRUCTURA · Core
          </p>
          <Link to="/" className="font-mono text-[9px] text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
