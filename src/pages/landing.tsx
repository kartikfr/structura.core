import { Link } from 'react-router-dom';
import { DoctrineBlock } from '@/components/DoctrineBlock';
import { ConceptCard } from '@/components/ConceptCard';
import { AnimatedPriceTicker } from '@/components/AnimatedPriceTicker';
import { FloatingMathSymbols } from '@/components/FloatingMathSymbols';
import { PriceFieldVisual } from '@/components/PriceFieldVisual';
import { StructuraLogo } from '@/components/StructuraLogo';
import { MarketMetricsDisplay } from '@/components/MarketMetricsDisplay';
import { InstitutionalStats } from '@/components/InstitutionalStats';
import { TradingInstruments } from '@/components/TradingInstruments';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, Lock, Activity, Layers, Grid3X3, Shield, Database, GitBranch, Clock } from 'lucide-react';

const doctrines = [
  { symbol: 'Δ', title: 'Data Is Law', description: 'Only OHLCV data enters. No opinions. No interpretations.' },
  { symbol: '∫', title: 'Structure Over Opinion', description: 'Mathematics reveals what price demonstrates.' },
  { symbol: '≡', title: 'Determinism Over Optimization', description: 'Fixed algorithms. No curve-fitting. No tuning.' },
  { symbol: '⟹', title: 'Same Input → Same Output', description: 'Reproducible. Auditable. Institutional.' },
  { symbol: '∅', title: 'No Prediction Allowed', description: 'This system describes. It does not forecast.' },
  { symbol: 't', title: 'Time Is First-Class', description: 'Time-domain structure is measured directly: balance around anchor and range per bar.' },
];

const concepts = [
  {
    symbol: '∂P/∂t',
    title: 'Structural Slope',
    description: 'Price–Time Balance ratio measuring structural momentum without directional prediction.',
    formula: '∂P/∂t = (Pₙ - P₀) / (tₙ - t₀)',
  },
  {
    symbol: '√n',
    title: 'Square-Root Lattice',
    description: 'Geometric price levels derived from integer square roots of anchor prices.',
    formula: 'L(n) = (√Anchor ± n)²',
  },
  {
    symbol: 'ρ(x)',
    title: 'Geometry Density Field',
    description: 'Confluence measurement across Fibonacci, logarithmic, and root lattice structures.',
    formula: 'ρ(P) = Σ 1/|P - Lᵢ|',
  },
  {
    symbol: '∑V·G',
    title: 'Auction Participation',
    description: 'Volume participation at structural levels quantified through entropy metrics.',
    formula: 'LPI = -Σ pᵢ log(pᵢ)',
  },
  {
    symbol: 'SII',
    title: 'Structural Integrity Index',
    description: 'Median-form composite measuring Hurst balance, ATR stability, and geometry alignment.',
    formula: 'SII = median(H-bal, ATR-stab, Geo)',
  },
  {
    symbol: 'H(t)',
    title: 'Hurst Spectrum',
    description: 'DFA-based exponent measuring structural persistence across time scales.',
    formula: 'H = log(F(n)) / log(n)',
  },
];

const capabilities = [
  { icon: Grid3X3, title: 'Academic Rigor', desc: 'DFA, Hurst, variance ratios — institutional econometrics' },
  { icon: Activity, title: 'Reproducible Analysis', desc: 'Fixed algorithms, auditable outputs' },
  { icon: Layers, title: 'Multi-Scale Study', desc: 'Regime, volatility, and structure at every scale' },
];

const features = [
  { icon: Shield, title: 'Formula-First', desc: 'Every metric shows its math' },
  { icon: Database, title: 'Research-Grade', desc: 'Suitable for academic papers' },
  { icon: GitBranch, title: 'Reproducible', desc: 'Same data = same results' },
  { icon: Clock, title: 'Time-Anchored', desc: 'Session-aware computations' },
];

export const Landing = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating math symbols background */}
      <FloatingMathSymbols />

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-primary/20 bg-card/95 backdrop-blur-md sticky top-0 shadow-lg shadow-black/20">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <StructuraLogo size="sm" animated={true} />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-mono text-sm sm:text-base font-semibold tracking-wide text-foreground">STRUCTURA</span>
                <span className="font-mono text-sm sm:text-base font-semibold text-primary ml-1 sm:ml-1.5">· Core</span>
              </div>
              <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest hidden xs:block">by SwadeshLABS</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5 md:gap-8">
            <Link to="/whitepaper" className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hidden sm:block">
              Whitepaper
            </Link>
            <Link to="/user-manual" className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hidden md:block">
              User Manual
            </Link>
            <Link to="/pricing" className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hidden md:block">
              Access
            </Link>
            <Link to="/login" className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn-structura-solid text-[10px] sm:text-[11px] py-2 sm:py-2.5 px-3 sm:px-5 flex items-center gap-1 sm:gap-2 shadow-lg shadow-primary/20">
              <span className="hidden sm:inline">Access</span> Core
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Live Price Ticker */}
      <div className="relative z-10 border-b border-border bg-card/50">
        <AnimatedPriceTicker />
      </div>

      {/* Hero Section with Price Field Visual */}
      <section className="relative z-10 py-10 sm:py-16 md:py-20 px-3 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Copy */}
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <StructuraLogo size={isMobile ? 'sm' : 'md'} animated={true} />
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold tracking-tight text-foreground leading-[1.1]">
                    STRUCTURA
                    <span className="text-primary ml-1 sm:ml-2">· Core</span>
                  </h1>
                  <p className="font-mono text-[10px] sm:text-sm text-muted-foreground uppercase tracking-widest mt-1">
                    Market Structure Study Tool
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg md:text-xl font-mono text-foreground/90 mb-2 sm:mb-3 max-w-xl leading-relaxed">
                A research-grade instrument for studying market microstructure.
              </p>
              <p className="text-xs sm:text-sm font-mono text-muted-foreground mb-6 sm:mb-8 max-w-lg">
                For researchers, students, and analysts who want to understand — not predict.
              </p>

              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                <Link to="/signup" className="btn-structura-solid text-xs flex items-center justify-center gap-2 w-full xs:w-auto">
                  <span>Start Studying</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/documentation" className="btn-structura text-xs text-center w-full xs:w-auto">
                  Methodology
                </Link>
              </div>

              {/* Who this is for */}
              <div className="structura-panel p-4 sm:p-5 max-w-md">
                <p className="font-mono text-[10px] sm:text-[11px] text-primary uppercase tracking-widest mb-2">
                  Built for Market Students
                </p>
                <p className="font-mono text-[11px] sm:text-xs text-foreground leading-relaxed mb-2 sm:mb-3">
                  This is not a trading tool.<br />
                  It does not generate signals or alpha.<br />
                  It does not tell you what to do.
                </p>
                <p className="font-mono text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  It helps you study how markets behave —<br />
                  through deterministic, reproducible metrics.
                </p>
              </div>
            </div>

            {/* Right - Price Field Visualization */}
            <div>
              <div className="structura-panel overflow-hidden h-[280px] sm:h-[320px] lg:h-[420px]">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Price Field · Structure Visualization
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-mono text-[9px] text-primary">LIVE</span>
                  </div>
                </div>
                <PriceFieldVisual />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Live Metrics Grid */}
      <section className="relative z-10 py-10 px-6 border-y border-border bg-card/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-primary/60" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Real-Time Structural Metrics
            </span>
          </div>
          <MarketMetricsDisplay />
        </div>
      </section>

      {/* Capabilities + Instruments Grid */}
      <section className="relative z-10 py-8 sm:py-12 px-3 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
            {/* Left - Capabilities and Features */}
            <div className="space-y-6 sm:space-y-8">
              {/* Main Capabilities */}
              <div>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
                  Core Capabilities
                </span>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  {capabilities.map((item, i) => (
                    <div key={i} className="structura-panel p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border border-border flex items-center justify-center shrink-0">
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] sm:text-xs text-foreground">{item.title}</p>
                        <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {features.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-border/50 bg-card/50">
                    <item.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground shrink-0" />
                    <span className="font-mono text-[9px] sm:text-[10px] text-foreground">{item.title}</span>
                    <span className="font-mono text-[8px] sm:text-[9px] text-muted-foreground hidden xs:inline">· {item.desc}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="pt-4 sm:pt-6 border-t border-border/50">
                <InstitutionalStats />
              </div>
            </div>

            {/* Right - Trading Instruments Feed */}
            <div>
              <TradingInstruments />
            </div>
          </div>
        </div>
      </section>

      {/* Model Constraints */}
      <section className="relative z-10 py-10 sm:py-16 px-3 sm:px-6 border-y border-border bg-card/20">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
                  Model Constraints
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-foreground mb-2">
                No optimization. No fitting. No inference.
              </p>
              <p className="font-mono text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Every output is deterministically derived from OHLCV data alone.
                Parameters are fixed. Lookback windows are constant.
                The same input will always produce the same output.
              </p>
            </div>
            <div className="constraint-block p-4 sm:p-5">
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: 'Data Inputs', value: 'OHLCV only' },
                  { label: 'Optimization', value: 'None' },
                  { label: 'Parameter Fitting', value: 'None' },
                  { label: 'Lookback Windows', value: 'Fixed' },
                  { label: 'Recalibration', value: 'Never' },
                  { label: 'Probabilities', value: 'Not Used' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 sm:py-1.5 border-b border-border/30 last:border-0">
                    <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">{item.label}</span>
                    <span className="font-mono text-[10px] sm:text-[11px] text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctrine Section */}
      <section id="doctrine" className="relative z-10 py-12 sm:py-20 px-3 sm:px-6 border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 sm:mb-12">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
              Foundation
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-foreground mt-2">
              The Doctrine
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {doctrines.map((doctrine, index) => (
              <DoctrineBlock key={index} {...doctrine} />
            ))}
          </div>
        </div>
      </section>

      {/* Mathematical Framework */}
      <section className="relative z-10 py-12 sm:py-20 px-3 sm:px-6 border-b border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-12">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
              ∫ ∑ √
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-foreground mt-2">
              Mathematical Framework
            </h2>
            <p className="font-mono text-[11px] sm:text-xs text-muted-foreground mt-2">
              Structure revealed through deterministic computation
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {concepts.map((concept, index) => (
              <ConceptCard key={index} {...concept} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-12 sm:py-20 px-3 sm:px-6 border-b border-border bg-card/20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 sm:mb-12">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
              Workflow
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-foreground mt-2">
              How STRUCTURA Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { step: '01', title: 'Import', desc: 'Load any OHLCV dataset — historical or real-time. Study any instrument, any timeframe, any market.' },
              { step: '02', title: 'Measure', desc: 'Deterministic algorithms compute regime, volatility, and structural metrics. Verify every formula.' },
              { step: '03', title: 'Understand', desc: 'Export reproducible reports for research, documentation, or further analysis. Build market intuition.' },
            ].map((item, i) => (
              <div key={i} className="structura-panel p-4 sm:p-6">
                <span className="font-mono text-2xl sm:text-3xl text-primary/40">{item.step}</span>
                <h3 className="font-mono text-xs sm:text-sm text-foreground mt-2 sm:mt-3 mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="font-mono text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-20 px-3 sm:px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <StructuraLogo size={isMobile ? 'md' : 'lg'} animated={true} className="mx-auto mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-foreground mb-2 sm:mb-3">
            Start Studying Market Structure
          </h3>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-lg mx-auto">
            For researchers, quant students, and analysts building deep market intuition through rigorous, reproducible analysis.
          </p>
          <p className="font-mono text-[10px] sm:text-[11px] text-muted-foreground/70 mb-6 sm:mb-8">
            5 free study sessions · $99 lifetime access
          </p>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3 sm:gap-4">
            <Link to="/signup" className="btn-structura-solid text-xs flex items-center justify-center gap-2 w-full xs:w-auto">
              Begin Study
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/whitepaper" className="btn-structura text-xs text-center w-full xs:w-auto">
              Read Whitepaper
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 sm:py-10 px-3 sm:px-6 bg-card/30">
        <div className="container mx-auto">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <StructuraLogo size="sm" animated={false} />
              <div>
                <p className="font-mono text-[11px] sm:text-xs text-foreground">SwadeshLABS</p>
                <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground">Market Structure Research Tools</p>
              </div>
            </div>

            <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground text-center max-w-md leading-relaxed order-last md:order-none">
              Educational and research tool for studying market microstructure.
              Not a trading system. Not financial advice. For study purposes only.
            </p>

            <div className="flex items-center gap-4 sm:gap-6 font-mono text-[9px] sm:text-[10px] text-muted-foreground">
              <Link to="/whitepaper" className="hover:text-foreground transition-colors">Whitepaper</Link>
              <Link to="/user-manual" className="hover:text-foreground transition-colors">User Manual</Link>
              <Link to="/documentation" className="hover:text-foreground transition-colors">Docs</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Access</Link>
              <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
