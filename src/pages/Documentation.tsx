import { Link } from 'react-router-dom';
import { StructuraLogo } from '@/components/StructuraLogo';
import { ArrowLeft, BookOpen, Database, Shield, Layers, Activity, Clock, GitBranch, Lock, FileText } from 'lucide-react';

const sections = [
  { id: 'purpose', label: '1. Purpose & Boundary' },
  { id: 'data-contract', label: '2. Data Requirements' },
  { id: 'metrics', label: '3. Core Metrics' },
  { id: 'econometrics', label: '4. Advanced Econometrics' },
  { id: 'geometry', label: '5. Geometry Engine' },
  { id: 'auction', label: '6. Auction Logic' },
  { id: 'temporal', label: '7. Temporal Integrity' },
  { id: 'reading', label: '8. Reading the Dashboard' },
  { id: 'guarantees', label: '9. Design Guarantees' },
  { id: 'versioning', label: '10. Versioning & Audit' },
];

export const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <StructuraLogo size="sm" animated={false} />
            <div className="hidden sm:block">
              <div className="flex items-center">
                <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                <span className="font-mono text-sm font-semibold text-primary ml-1">· Core</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">by SwadeshLABS</p>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar - Section Index */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Documentation</span>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block py-2 px-3 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-primary"
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono">
                  <FileText className="w-3 h-3" />
                  <span>v1.0.0 · January 2026</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="max-w-3xl">
            {/* Document Header */}
            <header className="mb-16 pb-8 border-b border-border">
              <div className="flex items-center gap-4 mb-6">
                <StructuraLogo size="lg" animated={false} />
                <div>
                  <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                    STRUCTURA <span className="text-primary">· Core</span>
                  </h1>
                  <p className="font-mono text-sm text-muted-foreground mt-1">Framework Documentation</p>
                </div>
              </div>
              <p className="font-serif text-lg text-foreground/80 leading-relaxed max-w-2xl">
                Technical specification for deterministic market structure analysis.
                This document defines inputs, computations, constraints, and guarantees.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> OHLCV Pure
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3 h-3" /> Deterministic
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Audit-Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> No Prediction
                </span>
              </div>
            </header>

            {/* Section 1: Purpose & Boundary */}
            <section id="purpose" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">1</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Purpose & Boundary</h2>
              </div>

              <div className="prose-institutional space-y-6">
                <div className="doc-callout border-l-4 border-primary bg-primary/5 p-6">
                  <p className="font-mono text-sm text-foreground leading-relaxed">
                    <strong>Structura Core</strong> is a deterministic market structure engine.
                    It does not predict price, generate directives, or optimize strategies.
                  </p>
                  <p className="font-mono text-sm text-foreground/80 mt-4 leading-relaxed">
                    Its sole function is to <em>measure</em> and <em>visualize</em> market structure
                    as it exists, using reproducible mathematical transforms applied to OHLCV data.
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    What Structura Refuses To Do
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'No predictive claims',
                      'No probabilities',
                      'No trade logic',
                      'No optimization',
                      'No backtest-derived parameters',
                      'No directive generation'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 py-2 px-3 bg-destructive/10 border border-destructive/20">
                        <span className="text-destructive font-mono text-lg">×</span>
                        <span className="font-mono text-xs text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="font-serif text-sm text-muted-foreground italic mt-6">
                  This boundary separates Structura from most market analysis tools.
                </p>
              </div>
            </section>

            {/* Section 2: Data Requirements */}
            <section id="data-contract" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">2</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Data Requirements</h2>
              </div>

              <div className="space-y-6">
                <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  Mandatory Inputs
                </h3>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {['Open', 'High', 'Low', 'Close', 'Volume', 'Timestamp'].map((field) => (
                    <div key={field} className="structura-panel p-3 text-center">
                      <span className="font-mono text-xs text-foreground font-medium">{field}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    Structural Rules
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Open price is a first-class variable',
                      'Missing Open = structural invalidation',
                      'Data must be time-ordered (ascending)',
                      'Minimum bar count disclosed per metric',
                      'No interpolation of missing values'
                    ].map((rule, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                        <span className="font-mono text-primary text-xs mt-0.5">→</span>
                        <span className="font-mono text-sm text-foreground">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="doc-callout border-l-4 border-accent bg-accent/10 p-6 mt-8">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-accent mb-2">Design Rationale</h4>
                  <p className="font-serif text-sm text-foreground/90 leading-relaxed">
                    Markets auction from the Open. Any structural system that ignores Open
                    introduces distortion into its foundational measurements. The Open price
                    establishes session context and defines the reference frame for all
                    subsequent price action.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Core Metrics */}
            <section id="metrics" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">3</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Core Metrics</h2>
              </div>

              <p className="font-serif text-sm text-muted-foreground mb-8 leading-relaxed">
                Each metric follows a strict template: definition, formula, properties, and explicit
                clarification of what it is <em>not</em>. No interpretation is provided.
              </p>

              {/* Metric: Structural Slope */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">∂P/∂t</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Structural Slope</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Measures the directional balance between price change and elapsed time.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      StructuralSlope = ΔPrice / ΔTime
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Unit-consistent', 'Scale-independent', 'Non-predictive'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not momentum', 'Not trend strength', 'Not signal direction'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: Geometry Density */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">ρ(P)</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Geometry Density</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Measures the concentration of geometric price levels (harmonic, logarithmic,
                      square-root lattice) near the current price.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      ρ(P) = Σ 1 / (|P - Lᵢ| + ε)
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                      Where ε = fixed tolerance floor (TickSize or ATR × 0.01) preventing singularity
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Anchor-dependent', 'ε-regularized (singularity-safe)', 'Deterministic tolerance floor', 'Multi-geometry'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not support/resistance', 'Not price target', 'Not probability zone'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: Efficiency Ratio */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">ER</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Efficiency Ratio</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Measures path efficiency — the ratio of net displacement to total distance traveled.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      ER = |ΔP| / Σ|Δpᵢ|
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Bounded [0, 1]', 'Scale-invariant', 'Path-dependent'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not trend quality', 'Not directional bias', 'Not volatility'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: Temporal Symmetry (Anchor-Based) */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">t</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Temporal Symmetry (Anchor-Based)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Ratio of bars before vs after the anchor price. Measures temporal balance only. Non-predictive.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      TemporalSymmetry = min(bars_before, bars_after) / max(bars_before, bars_after)
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                      Anchor index is located by containment: Low ≤ Anchor ≤ High.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Domain: [0, 1]', 'Anchor-dependent (explicit)', 'Deterministic', 'Descriptive only'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Hard Fail</h4>
                      <ul className="space-y-1">
                        {['Disabled if anchor cannot be located', 'Disabled if bars < minimum threshold (default 50)'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: Bar-Normalized Price Range */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">Δ/N</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Bar-Normalized Price Range</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Average range contribution per bar across the observed window (price units per bar). Descriptive only.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      BarNormalizedRange = (max(High) - min(Low)) / N
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Simple arithmetic', 'Time-contextualized range', 'Deterministic', 'Non-directional'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Hard Fail</h4>
                      <ul className="space-y-1">
                        {['Disabled if High/Low missing', 'Disabled if bars < minimum threshold (default 50)'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: Hurst Exponent */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">H</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Hurst Exponent</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Measures long-range dependence using Detrended Fluctuation Analysis (DFA).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      H estimated via DFA scaling exponent (α)
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                      Fixed-scale DFA with predetermined window sizes for determinism
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Bounded [0, 1]', 'H > 0.5 = persistent', 'H < 0.5 = anti-persistent', 'DFA-based (not R/S)'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not trend forecast', 'Not momentum score', 'Not mean-reversion timer'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: ATR */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">ATR</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Average True Range</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Measures average price range accounting for gaps — the foundational
                      volatility metric for structural context.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      TR = max(H-L, |H-Cₚ|, |L-Cₚ|) <br />
                      ATR = SMA(TR, 14)
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                      14 is treated as a structural normalization constant, not an optimized parameter.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Gap-aware', '14-period structural constant', 'Non-directional'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not risk metric', 'Not position sizing input', 'Not stop-loss calculator'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric: Auction Participation */}
              <div className="metric-block structura-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">LPI</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Auction Participation Index</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Shannon entropy of volume distribution across price bins — measures
                      participation dispersion without inferring intent.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      LPI = -Σ pᵢ log(pᵢ)
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Entropy-based', 'ATR-scaled bins', 'Distribution-agnostic'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not volume profile', 'Not POC detection', 'Not institutional flow', 'Not market balance', 'Not accumulation/distribution signal'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Advanced Econometrics */}
            <section id="econometrics" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">4</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Advanced Econometrics</h2>
              </div>

              <p className="font-serif text-sm text-muted-foreground mb-8 leading-relaxed">
                High-frequency-inspired volatility estimators and market microstructure metrics
                designed for FX/Commodities using only OHLCV data.
              </p>

              {/* Volatility Estimators */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">σ²</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Volatility Estimators</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Four complementary OHLC-based volatility estimators from high-frequency finance literature,
                      each with different sensitivity to drift, jumps, and microstructure noise.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Parkinson (Range-Based)</h5>
                      <div className="font-mono text-sm text-foreground">
                        σ²_P = (1/4ln2) × (1/n) × Σ[ln(H/L)]²
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Garman-Klass (OHLC)</h5>
                      <div className="font-mono text-sm text-foreground">
                        σ²_GK = ½[ln(H/L)]² - (2ln2-1)[ln(C/O)]²
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Rogers-Satchell (Drift-Adjusted)</h5>
                      <div className="font-mono text-sm text-foreground">
                        σ²_RS = ln(H/C)×ln(H/O) + ln(L/C)×ln(L/O)
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Yang-Zhang (Jump-Robust)</h5>
                      <div className="font-mono text-sm text-foreground">
                        σ²_YZ = σ²_o + k×σ²_c + (1-k)×σ²_RS
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Yang-Zhang as primary (jump-robust)', 'Cross-validation via divergence', 'Annualized scaling available', 'Deterministic calculation'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not implied volatility', 'Not GARCH forecast', 'Not risk prediction'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jump Detection */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">J</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Jump Detection (BNS Framework)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Barndorff-Nielsen & Shephard framework using bipower variation to separate
                      continuous volatility from discrete price jumps.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      BV = (π/2) × Σ|rᵢ||rᵢ₋₁|<br />
                      JumpRatio = (RV - BV) / RV
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                      Where RV = realized variance, BV = bipower variation. Jump detected when ratio exceeds threshold.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Discontinuity detection', 'Jump intensity measurement', 'Statistical significance testing', 'Session-aware'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not news detection', 'Not event prediction', 'Not gap trading signal'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liquidity Proxies */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">S</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Liquidity Proxies (Volume-Free)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Bid-ask spread estimators derived from price behavior alone, suitable for
                      OTC markets without true volume data.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Roll's Effective Spread</h5>
                      <div className="font-mono text-sm text-foreground">
                        S = 2 × √(-Cov(ΔPₜ, ΔPₜ₋₁))
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-2">
                        Valid only for negative covariance
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Corwin-Schultz Spread</h5>
                      <div className="font-mono text-sm text-foreground">
                        S = 2(e^α - 1)/(1 + e^α)
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-2">
                        Uses high-low ratios over two days
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Amihud Illiquidity Ratio</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      ILLIQ = |rₜ| / (Ṽₜ × Pₜ)
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                      Where Ṽₜ = normalized tick volume proxy
                    </p>
                  </div>
                </div>
              </div>

              {/* Regime Detection */}
              <div className="metric-block structura-panel p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">R</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Regime Detection</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Volatility regime classification using Markov-switching framework and
                      CUSUM-based structural break detection.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Formula</h4>
                    <div className="bg-muted/50 p-4 font-mono text-sm text-primary">
                      CUSUM = (1/σ√n) × Σ(|rᵢ| - |r̄|)
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="structura-panel p-4 text-center">
                      <span className="font-mono text-lg text-stable">Low Vol</span>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">Regime 1</p>
                    </div>
                    <div className="structura-panel p-4 text-center">
                      <span className="font-mono text-lg text-transition">Transition</span>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">Switching</p>
                    </div>
                    <div className="structura-panel p-4 text-center">
                      <span className="font-mono text-lg text-destructive">High Vol</span>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">Regime 2</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Efficiency */}
              <div className="metric-block structura-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl text-primary">η</span>
                  <h3 className="font-mono text-lg text-foreground font-semibold">Market Efficiency Metrics</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Definition</h4>
                    <p className="font-serif text-sm text-foreground">
                      Informational efficiency metrics measuring market microstructure noise and
                      deviation from martingale behavior.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Hasbrouck's MEC</h5>
                      <div className="font-mono text-sm text-foreground">
                        MEC = 1 - σ²_YZ / σ²_GK
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4">
                      <h5 className="font-mono text-xs text-primary mb-2">Noise-to-Signal Ratio</h5>
                      <div className="font-mono text-sm text-foreground">
                        NSR = -ρ₁ / (1 + ρ₁)
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Properties</h4>
                      <ul className="space-y-1">
                        {['Autocorrelation-based detection', 'Bid-ask bounce identification', 'Martingale difference test', 'Long memory detection'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">What it is NOT</h4>
                      <ul className="space-y-1">
                        {['Not arbitrage detection', 'Not alpha signal', 'Not trading opportunity'].map((prop, i) => (
                          <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-destructive">×</span>
                            {prop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Geometry Engine */}
            <section id="geometry" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">5</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Geometry Engine</h2>
              </div>

              <div className="space-y-6">
                <p className="font-serif text-sm text-foreground leading-relaxed">
                  The geometry engine computes price levels derived from mathematical relationships,
                  not historical optimization or pattern recognition.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="structura-panel p-5">
                    <div className="font-mono text-xl text-primary mb-2">√n</div>
                    <h4 className="font-mono text-sm text-foreground mb-2">Square-Root Lattice</h4>
                    <p className="font-mono text-xs text-muted-foreground">
                      L(n) = (√Anchor ± n)²
                    </p>
                  </div>
                  <div className="structura-panel p-5">
                    <div className="font-mono text-xl text-primary mb-2">φ</div>
                    <h4 className="font-mono text-sm text-foreground mb-2">Harmonic Ratios (φ-derived)</h4>
                    <p className="font-mono text-xs text-muted-foreground">
                      0.236, 0.382, 0.500, 0.618, 0.786, 1.000, 1.272, 1.618
                    </p>
                  </div>
                  <div className="structura-panel p-5">
                    <div className="font-mono text-xl text-primary mb-2">log</div>
                    <h4 className="font-mono text-sm text-foreground mb-2">Logarithmic Levels</h4>
                    <p className="font-mono text-xs text-muted-foreground">
                      L(n) = Anchor × (1 ± n%)
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                    Fundamental Principles
                  </h3>
                  {[
                    { label: 'Anchored', desc: 'Geometry is anchored, not optimized. Anchors are user-defined, structural, and static.' },
                    { label: 'Derived', desc: 'Levels are mathematically derived from the anchor, not curve-fit to historical data.' },
                    { label: 'Contextual', desc: 'Geometry provides contextual reference frames, not predictive support/resistance.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0">
                      <span className="font-mono text-xs text-primary font-semibold min-w-[80px]">{item.label}</span>
                      <span className="font-serif text-sm text-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="doc-callout border-l-4 border-destructive/50 bg-destructive/5 p-6 mt-8">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-destructive mb-2">Explicit Disclaimer</h4>
                  <p className="font-serif text-sm text-foreground/90 leading-relaxed">
                    Geometry in Structura is <strong>contextual reference</strong>, not support/resistance
                    forecasting. No claims are made about price behavior at geometric levels. Levels
                    describe mathematical relationships to the anchor — nothing more.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Auction Logic */}
            <section id="auction" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">6</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Auction & Volume Logic</h2>
              </div>

              <div className="space-y-6">
                <p className="font-serif text-sm text-foreground leading-relaxed">
                  The auction engine approximates volume-at-price distribution deterministically
                  from OHLCV data using proportional allocation within each bar's range.
                </p>

                <div className="structura-panel p-6">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    Why OHLCV Can Approximate Volume Distribution
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Each bar\'s volume is distributed proportionally across its price range',
                      'Bin size is volatility-aware (ATR-based) to maintain structural relevance',
                      'No assumptions about intra-bar price path or order flow',
                      'Entropy calculation measures dispersion, not intent'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="font-mono text-primary text-xs mt-0.5">→</span>
                        <span className="font-serif text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="doc-callout border-l-4 border-primary bg-primary/5 p-6">
                  <p className="font-serif text-sm text-foreground leading-relaxed italic">
                    "Structura does not assume intent. It measures participation density."
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="structura-panel p-5">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      What It Measures
                    </h4>
                    <ul className="space-y-2">
                      {['Volume concentration', 'Participation dispersion', 'Range-weighted distribution'].map((item, i) => (
                        <li key={i} className="font-mono text-xs text-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="structura-panel p-5">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      What It Does NOT Measure
                    </h4>
                    <ul className="space-y-2">
                      {['Directional order-flow pressure', 'Institutional activity', 'Order flow direction'].map((item, i) => (
                        <li key={i} className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                          <span className="text-destructive">×</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Temporal Integrity */}
            <section id="temporal" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">7</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Temporal Integrity</h2>
              </div>

              <div className="space-y-6">
                <p className="font-serif text-sm text-foreground leading-relaxed">
                  All computations respect the arrow of time. Historical outputs are immutable.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="structura-panel p-5 text-center">
                    <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h4 className="font-mono text-sm text-foreground mb-1">No Repainting</h4>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Past values never change retroactively
                    </p>
                  </div>
                  <div className="structura-panel p-5 text-center">
                    <Activity className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h4 className="font-mono text-sm text-foreground mb-1">Forward Updates</h4>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Metrics update strictly with new data
                    </p>
                  </div>
                  <div className="structura-panel p-5 text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h4 className="font-mono text-sm text-foreground mb-1">No Hindsight</h4>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      No future data in current calculations
                    </p>
                  </div>
                </div>

                <div className="structura-panel p-6 mt-6">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
                    Guarantees
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Lookback windows are fixed and disclosed',
                      'All calculations use data available at computation time',
                      'No optimization against future price action',
                      'Session boundaries are respected in session-anchored metrics'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                        <span className="text-primary font-mono">✓</span>
                        <span className="font-mono text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Reading the Dashboard */}
            <section id="reading" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">8</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Reading the Dashboard</h2>
              </div>

              <div className="space-y-6">
                <p className="font-serif text-sm text-foreground leading-relaxed">
                  Dashboard values are comparative within context, not absolute across instruments or regimes.
                  Dashboard elements describe measured structure. Interpretation is deliberately
                  neutral — we describe, never advise.
                </p>

                <div className="doc-callout border-l-4 border-accent bg-accent/10 p-6">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-accent mb-3">Language Convention</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-mono text-xs text-destructive mb-2">We never say:</p>
                      <p className="font-serif text-sm text-muted-foreground italic">
                        "High value means buy"
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-primary mb-2">We say:</p>
                      <p className="font-serif text-sm text-foreground">
                        "Higher values indicate increased structural participation
                        relative to recent distribution."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                    Value Interpretations
                  </h3>

                  <div className="structura-panel p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-foreground">Hurst Exponent</span>
                      <span className="font-mono text-xs text-muted-foreground">H ∈ [0, 1]</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">H &gt; 0.5</span>
                        <span className="text-foreground">Persistent serial correlation in returns</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">H ≈ 0.5</span>
                        <span className="text-foreground">Returns approximate random walk</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">H &lt; 0.5</span>
                        <span className="text-foreground">Anti-persistent serial correlation</span>
                      </div>
                    </div>
                  </div>

                  <div className="structura-panel p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-foreground">Efficiency Ratio</span>
                      <span className="font-mono text-xs text-muted-foreground">ER ∈ [0, 1]</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">ER → 1</span>
                        <span className="text-foreground">Direct path, minimal deviation</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">ER → 0</span>
                        <span className="text-foreground">Rotational path, high deviation</span>
                      </div>
                    </div>
                  </div>

                  <div className="structura-panel p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-foreground">Geometry Density</span>
                      <span className="font-mono text-xs text-muted-foreground">Count</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-border/30">
                        <span className="text-muted-foreground">High density</span>
                        <span className="text-foreground">Multiple geometric levels near price</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Low density</span>
                        <span className="text-foreground">Price distant from geometric levels</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Design Guarantees */}
            <section id="guarantees" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">9</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Design Guarantees</h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Deterministic Outputs', desc: 'Same input always produces same output' },
                    { label: 'Reproducible Results', desc: 'Any analyst can verify calculations' },
                    { label: 'Transparent Formulas', desc: 'All mathematics fully disclosed' },
                    { label: 'No Hidden Weighting', desc: 'No undocumented score blending' },
                    { label: 'No Blended Scores', desc: 'Each metric stands independently' },
                    { label: 'No Adaptive Intelligence', desc: 'Parameters are fixed, not learned' },
                  ].map((item, i) => (
                    <div key={i} className="structura-panel p-5 flex items-start gap-4">
                      <span className="text-primary font-mono text-xl">✓</span>
                      <div>
                        <p className="font-mono text-sm text-foreground">{item.label}</p>
                        <p className="font-mono text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="doc-callout border-l-4 border-primary bg-primary/5 p-8 text-center mt-8">
                  <p className="font-serif text-lg text-foreground italic leading-relaxed">
                    "Structura is a lens.<br />
                    Judgment remains human."
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10: Versioning & Audit */}
            <section id="versioning" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <span className="font-mono text-primary text-lg">10</span>
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">Versioning & Audit Trail</h2>
              </div>

              <div className="space-y-6">
                <p className="font-serif text-sm text-foreground leading-relaxed">
                  Institutional readiness requires complete traceability and version control
                  for all metric calculations.
                </p>

                <div className="structura-panel p-6">
                  <div className="space-y-3">
                    {[
                      { label: 'Metric Changes', desc: 'All calculation changes are versioned and documented' },
                      { label: 'Historical Outputs', desc: 'Past reports remain reproducible with version-matched algorithms' },
                      { label: 'Parameter Updates', desc: 'No silent parameter modifications — all changes are announced' },
                      { label: 'Audit Compatibility', desc: 'Exports include algorithm version and timestamp metadata' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0">
                        <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-mono text-sm text-foreground">{item.label}</p>
                          <p className="font-mono text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 px-6 bg-muted/30 border border-border">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Current Version</span>
                    <p className="font-mono text-lg text-foreground">v1.0.0</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Last Updated</span>
                    <p className="font-mono text-sm text-foreground">January 2026</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-12 border-t border-border">
              <div className="flex items-center gap-4 mb-6">
                <StructuraLogo size="sm" animated={false} />
                <div>
                  <div className="flex items-center">
                    <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                    <span className="font-mono text-sm font-semibold text-primary ml-1">· Core</span>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">by SwadeshLABS</p>
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-lg">
                This document constitutes the complete technical specification for STRUCTURA · Core.
                For questions regarding implementation or institutional licensing, contact SwadeshLABS.
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/60 mt-6">
                © 2026 SwadeshLABS — All rights reserved.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
