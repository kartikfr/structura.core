import { Link } from 'react-router-dom';
import { StructuraLogo } from '@/components/StructuraLogo';
import {
  ArrowLeft, BookOpen, Upload, Play, Download, Eye,
  Settings, AlertTriangle, CheckCircle, Info,
  BarChart3, TrendingUp, Layers, Activity, Clock,
  FileText, HelpCircle, Zap, Target, Compass
} from 'lucide-react';

const sections = [
  { id: 'getting-started', label: '1. Getting Started' },
  { id: 'data-input', label: '2. Data Input Methods' },
  { id: 'running-analysis', label: '3. Running Analysis' },
  { id: 'understanding-metrics', label: '4. Understanding Metrics' },
  { id: 'structural-intelligence', label: '5. Structural Intelligence' },
  { id: 'geometry-engine', label: '6. Geometry & Levels' },
  { id: 'reading-reports', label: '7. Reading PDF Reports' },
  { id: 'audit-mode', label: '8. Audit Mode' },
  { id: 'best-practices', label: '9. Best Practices' },
  { id: 'faq', label: '10. FAQ & Troubleshooting' },
];

export const UserManual = () => {
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
          <div className="flex items-center gap-4">
            <Link to="/documentation" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              Technical Docs
            </Link>
            <Link to="/" className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar - Section Index */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">User Manual</span>
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
                  <span>v1.2.0 · January 2026</span>
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
                    User <span className="text-primary">Manual</span>
                  </h1>
                  <p className="font-mono text-sm text-muted-foreground mt-1">Complete Guide to STRUCTURA · Core</p>
                </div>
              </div>
              <p className="font-serif text-lg text-foreground/80 leading-relaxed max-w-2xl">
                Learn how to use STRUCTURA Core to analyze market structure through deterministic,
                mathematically-grounded metrics. This manual covers data input, metric interpretation,
                and best practices for structural analysis.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Play className="w-3 h-3" /> Step-by-Step
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Practical Focus
                </span>
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3 h-3" /> Interpretation Guide
                </span>
              </div>
            </header>

            {/* Section 1: Getting Started */}
            <section id="getting-started" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">1. Getting Started</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">What is STRUCTURA Core?</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  STRUCTURA Core is a <span className="text-primary font-semibold">deterministic market structure observatory</span>.
                  It does not predict price, generate trades, or estimate probabilities. Instead, it answers one question:
                  <em className="text-foreground">"What type of market exists right now?"</em>
                </p>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h4 className="font-mono text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Core Principles
                  </h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <span><strong className="text-foreground">Deterministic:</strong> Same input always produces same output</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <span><strong className="text-foreground">Observable:</strong> All metrics derived from OHLCV data only</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <span><strong className="text-foreground">Non-Predictive:</strong> Describes structure, does not forecast direction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <span><strong className="text-foreground">Audit-Ready:</strong> Full mathematical disclosure for every metric</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">Account Setup</h3>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside mb-6">
                  <li>Navigate to the homepage and click <strong className="text-foreground">"ACCESS CORE"</strong></li>
                  <li>Create an account with your email or sign in with Google</li>
                  <li>Free tier includes 5 analyses per session</li>
                  <li>Premium unlock provides unlimited access</li>
                </ol>
              </div>
            </section>

            {/* Section 2: Data Input Methods */}
            <section id="data-input" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">2. Data Input Methods</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  STRUCTURA Core accepts OHLCV data through three methods. Each requires a minimum of
                  <span className="text-primary font-semibold"> 50 bars</span> for structural analysis.
                </p>

                {/* MT5 CSV Upload */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> MT5 CSV Upload (Recommended)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export data directly from MetaTrader 5 and upload the CSV file.
                  </p>
                  <div className="bg-background/50 rounded p-4 font-mono text-xs text-muted-foreground mb-4">
                    <div className="text-primary mb-2">Required Format:</div>
                    DATE, TIME, OPEN, HIGH, LOW, CLOSE, TICKVOL
                    <br />
                    <span className="text-foreground">2024.01.15, 09:00, 1.0850, 1.0875, 1.0845, 1.0860, 1250</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Open price is MANDATORY for structural integrity. Data without Open price will fail validation.</span>
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" /> Manual Entry
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paste OHLCV data directly into the text area. Supports tab-separated or comma-separated formats.
                  </p>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Switch to the <strong className="text-foreground">MANUAL</strong> tab</li>
                    <li>Paste your OHLCV data in the textarea</li>
                    <li>Enter the <strong className="text-foreground">Last Traded Price (LTP)</strong> in the input field</li>
                    <li>Enter the <strong className="text-foreground">Anchor Price</strong> (geometric reference point)</li>
                  </ol>
                </div>

                {/* Live API */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Live API (Premium)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect to live market data feeds for real-time analysis.
                  </p>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Switch to the <strong className="text-foreground">LIVE API</strong> tab</li>
                    <li>Select your instrument from the dropdown</li>
                    <li>Choose your preferred timeframe</li>
                    <li>Click <strong className="text-foreground">FETCH DATA</strong> to retrieve latest bars</li>
                  </ol>
                </div>

                {/* Input Fields */}
                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">Understanding Input Fields</h3>
                <div className="grid gap-4 mb-6">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="font-mono text-sm font-semibold text-primary mb-2">LTP (Last Traded Price)</div>
                    <p className="text-sm text-muted-foreground">
                      The current or most recent price. This is your reference point for calculating distances
                      to geometric levels and confluence zones.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="font-mono text-sm font-semibold text-primary mb-2">Anchor Price</div>
                    <p className="text-sm text-muted-foreground">
                      The geometric reference point for Square-Root Lattice (SRL) calculations. Typically set to
                      a significant structural high/low, session open, or pivot point. The anchor determines where
                      geometric levels are projected from.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Running Analysis */}
            <section id="running-analysis" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">3. Running Analysis</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">Step-by-Step Workflow</h3>

                <ol className="space-y-6 mb-8">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-background flex-shrink-0">1</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Load Your Data</div>
                      <p className="text-sm text-muted-foreground">
                        Upload CSV, paste manual data, or fetch from API. Ensure you have minimum 50 bars.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-background flex-shrink-0">2</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Set Reference Prices</div>
                      <p className="text-sm text-muted-foreground">
                        Enter the LTP and Anchor Price. For live data, these may be auto-populated.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-background flex-shrink-0">3</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Click ANALYZE STRUCTURE</div>
                      <p className="text-sm text-muted-foreground">
                        The engine will compute all metrics: Hurst exponent, ATR, geometry levels,
                        confluence zones, and structural intelligence indices.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-background flex-shrink-0">4</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Review Results</div>
                      <p className="text-sm text-muted-foreground">
                        Explore the dashboard panels: Structural Metrics, Time-Domain, Geometry Levels,
                        Auction Context, and Advanced Econometrics.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-background flex-shrink-0">5</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Export Report</div>
                      <p className="text-sm text-muted-foreground">
                        Click EXPORT to download a Bloomberg-style PDF report with all metrics and levels.
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-sm font-semibold text-amber-500 mb-1">Data Integrity Warnings</div>
                    <p className="text-sm text-muted-foreground">
                      If your data is missing Open prices or has insufficient bars, certain layers will be
                      <span className="text-amber-500"> disabled</span> with specific reasons displayed.
                      The system refuses to speculate on incomplete data.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Understanding Metrics */}
            <section id="understanding-metrics" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">4. Understanding Metrics</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  All metrics follow the <span className="text-primary font-semibold">"Formula-First"</span> principle:
                  every number displayed has its mathematical definition disclosed. Click any metric to expand its
                  full derivation.
                </p>

                {/* Hurst Exponent */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-mono text-sm font-semibold text-foreground">Hurst Exponent (H)</h4>
                    <span className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded">DFA Method</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Measures the persistence or anti-persistence of price movements using Detrended Fluctuation Analysis.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-green-400">H &gt; 0.55</div>
                      <div className="text-xs text-muted-foreground mt-1">Trending</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-amber-400">0.45-0.55</div>
                      <div className="text-xs text-muted-foreground mt-1">Random Walk</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-red-400">H &lt; 0.45</div>
                      <div className="text-xs text-muted-foreground mt-1">Mean-Reverting</div>
                    </div>
                  </div>
                </div>

                {/* ATR Percent */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-mono text-sm font-semibold text-foreground">ATR Percent</h4>
                    <span className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded">14-Period</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Average True Range as a percentage of price. Measures volatility compression or expansion.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-blue-400">&lt; 1%</div>
                      <div className="text-xs text-muted-foreground mt-1">Compressed</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-foreground">1-2.5%</div>
                      <div className="text-xs text-muted-foreground mt-1">Normal</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-amber-400">&gt; 2.5%</div>
                      <div className="text-xs text-muted-foreground mt-1">Elevated</div>
                    </div>
                  </div>
                </div>

                {/* Efficiency Ratio */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-mono text-sm font-semibold text-foreground">Efficiency Ratio (ER)</h4>
                    <span className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded">Kaufman</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Measures directional efficiency: net price change divided by total path length.
                  </p>
                  <div className="font-mono text-xs text-muted-foreground bg-background/50 p-3 rounded mb-4">
                    ER = |Close[N] - Close[0]| / SUM(|Close[i] - Close[i-1]|)
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-green-400">ER → 1:</span> Highly directional movement<br />
                    <span className="text-amber-400">ER → 0:</span> Choppy, non-directional movement
                  </p>
                </div>

                {/* Variance Ratio */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-mono text-sm font-semibold text-foreground">Variance Ratio (VR)</h4>
                    <span className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded">Lo-MacKinlay</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tests for random walk behavior by comparing multi-period variance to single-period variance.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground">VR ≈ 1:</span> Random walk behavior<br />
                    <span className="text-green-400">VR &gt; 1:</span> Positive autocorrelation (trending)<br />
                    <span className="text-red-400">VR &lt; 1:</span> Negative autocorrelation (mean-reverting)
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Structural Intelligence */}
            <section id="structural-intelligence" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">5. Structural Intelligence</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The Structural Intelligence layer provides advanced non-parametric metrics for deeper market structure analysis.
                </p>

                {/* SII */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4">Structural Integrity Index (SII)</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Composite index measuring overall structural coherence. Aggregates efficiency, variance, and persistence components.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-green-400">&gt; 0.65</div>
                      <div className="text-xs text-muted-foreground mt-1">Stable</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-amber-400">0.35-0.65</div>
                      <div className="text-xs text-muted-foreground mt-1">Transition</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-red-400">&lt; 0.35</div>
                      <div className="text-xs text-muted-foreground mt-1">Fragile</div>
                    </div>
                  </div>
                </div>

                {/* HSS */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4">Hurst Spectrum Stability (HSS)</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Measures consistency of the Hurst exponent across multiple scales (16, 32, 64, 128).
                    High HSS indicates scale-invariant behavior.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-green-400">HSS &gt; 0.70:</span> Stable scaling relationship<br />
                    <span className="text-amber-400">HSS 0.40-0.70:</span> Moderate stability<br />
                    <span className="text-red-400">HSS &lt; 0.40:</span> Unstable/transitional structure
                  </p>
                </div>

                {/* LPI */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4">Lattice Participation Index (LPI)</h4>
                  <p className="text-sm text-muted-foreground">
                    Entropy-based measure of how price interacts with geometric levels. Higher LPI means price
                    is distributed across many levels; lower LPI means concentrated around specific levels.
                  </p>
                </div>

                {/* LCR */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4">Lattice Compression Ratio (LCR)</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures compression of price relative to geometric level spacing. High LCR indicates
                    tight clustering around levels; low LCR indicates dispersed price action.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Geometry Engine */}
            <section id="geometry-engine" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">6. Geometry & Levels</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The Geometry Engine projects mathematical levels from the Anchor Price using three systems.
                </p>

                {/* SRL */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#9b87f5]"></div>
                    <h4 className="font-mono text-sm font-semibold text-foreground">Square-Root Lattice (SRL)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Levels derived from square-root transformations of price. Creates a natural compression
                    at higher prices and expansion at lower prices.
                  </p>
                  <div className="font-mono text-xs text-muted-foreground bg-background/50 p-3 rounded">
                    Level[n] = (sqrt(Anchor) + n × step)²
                  </div>
                </div>

                {/* Fibonacci */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#FEF7CD]"></div>
                    <h4 className="font-mono text-sm font-semibold text-foreground">Fibonacci Sequence</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Classic phi-ratio (φ = 1.618...) retracements and extensions from anchor.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Standard ratios: 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%, 127.2%, 161.8%
                  </div>
                </div>

                {/* Logarithmic */}
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#F2FCE2]"></div>
                    <h4 className="font-mono text-sm font-semibold text-foreground">Logarithmic Sequence</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Percentage-based levels that scale proportionally with price. Useful for maintaining
                    consistent visual spacing across different price magnitudes.
                  </p>
                </div>

                {/* Confluence Zones */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-4">
                  <h4 className="font-mono text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Confluence Zones
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    When levels from multiple systems cluster within ATR tolerance, they form
                    <span className="text-primary font-semibold"> confluence zones</span>. These represent areas
                    where multiple geometric relationships converge.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-muted-foreground">2x</div>
                      <div className="text-xs text-muted-foreground mt-1">Moderate</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-amber-400">3x</div>
                      <div className="text-xs text-muted-foreground mt-1">Strong</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="font-mono text-lg font-bold text-green-400">4x+</div>
                      <div className="text-xs text-muted-foreground mt-1">High</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Reading Reports */}
            <section id="reading-reports" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">7. Reading PDF Reports</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The exported PDF is a Bloomberg-style institutional report designed for structural analysis.
                </p>

                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">Report Structure</h3>

                <ol className="space-y-4 mb-6">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-mono font-bold text-primary flex-shrink-0">P1</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Quick Reference</div>
                      <p className="text-sm text-muted-foreground">
                        Executive summary with key metrics (LTP, Anchor, Hurst, ATR%), interpretation guide,
                        and structural state classification.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-mono font-bold text-primary flex-shrink-0">P2+</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Full Structural Report</div>
                      <p className="text-sm text-muted-foreground">
                        Detailed analysis including Market State banner, Analysis Context summary,
                        Time-Domain metrics, Price Distribution, Structural Intelligence,
                        Advanced Econometrics, and Geometry tables.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-sm font-mono font-bold text-primary flex-shrink-0">PN</div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground mb-1">Export Self-Check</div>
                      <p className="text-sm text-muted-foreground">
                        Audit trail showing data timestamp, bar count, volume status, and any
                        disabled layers with specific reasons. Essential for compliance and verification.
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" /> Report Timestamps
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The report timestamp is anchored to <span className="text-primary">max(OHLC.timestamp)</span>,
                    not the generation time. This ensures audit traceability—the report reflects the data state,
                    not when you clicked Export.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Audit Mode */}
            <section id="audit-mode" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">8. Audit Mode</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Audit Mode provides full mathematical transparency for compliance and verification.
                </p>

                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">Enabling Audit Mode</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside mb-6">
                  <li>Toggle the <strong className="text-foreground">AUDIT MODE</strong> switch in the header</li>
                  <li>All Formula-First metric panels will automatically expand</li>
                  <li>Raw mathematical inputs (N, anchor_index, etc.) become visible</li>
                  <li>A mobile-accessible indicator chip confirms Audit Mode is active</li>
                </ol>

                <h3 className="text-lg font-mono font-semibold text-foreground mb-4">Exporting Audit JSON</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click <strong className="text-foreground">AUDIT JSON</strong> to download a complete audit file containing:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside mb-6">
                  <li>Every metric's name, class, method, and window</li>
                  <li>Raw input values used for computation</li>
                  <li>Output values with active/disabled status</li>
                  <li>Specific reasons for any disabled metrics</li>
                </ul>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-sm font-semibold text-primary mb-1">Recomputation Aid</div>
                    <p className="text-sm text-muted-foreground">
                      Auditors can use the disclosed inputs and Python/TypeScript reference implementations
                      in the documentation to independently verify every computed metric.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Best Practices */}
            <section id="best-practices" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">9. Best Practices</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="grid gap-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Use Sufficient Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      50 bars is the minimum. For robust Hurst exponent calculation and volatility estimation,
                      use 100-200 bars when available. More data = more stable structural readings.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Choose Meaningful Anchors
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      The Anchor Price should be a structurally significant level: session open, recent swing
                      high/low, or known institutional pivot. Random anchors produce meaningless geometry.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Respect Disabled Layers
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      When metrics are disabled with specific reasons, trust the system. Adding fake data
                      or forcing calculations defeats the purpose of deterministic analysis.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Comparative, Not Absolute
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Metric values are comparative within context, not absolute across instruments.
                      An "elevated" ATR% for EUR/USD differs from "elevated" for Bitcoin.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Structure ≠ Direction
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Remember: "Trending" Hurst doesn't mean UP, it means price tends to continue in
                      whatever direction it's moving. The system reveals structure; you supply judgment.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: FAQ */}
            <section id="faq" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl font-mono font-bold text-foreground">10. FAQ & Troubleshooting</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3">
                      Why are some metrics showing "Disabled"?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Metrics are disabled when input data is insufficient or invalid. Each disabled metric
                      shows a specific reason (e.g., "Insufficient temporal context" = not enough bars).
                      Provide more data or check data quality.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3">
                      Why does my Hurst exponent show R² validation failed?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      DFA requires a valid linear relationship in log-log space (R² &gt; 0.85). If your data
                      has regime changes or insufficient samples, the scaling law may not hold. Try using
                      more homogeneous data or a longer history.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3">
                      Can I use tick data instead of OHLCV?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      No. STRUCTURA Core is designed for bar-based OHLCV analysis. Tick data must be
                      aggregated into bars before use. The system assumes each row represents a discrete
                      time period with Open, High, Low, Close, and Volume.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3">
                      Why is volume data marked as "proxy only"?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      OTC markets (like Forex) don't have centralized volume. Tick volume from your broker
                      is an informational proxy, not true exchange volume. Auction-layer metrics use this
                      with appropriate disclaimers.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3">
                      How often should I re-run analysis?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Structural metrics are most meaningful on completed bars. Re-running mid-bar adds noise.
                      For intraday analysis, wait for bar close. For daily analysis, run once at session end.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold text-foreground mb-3">
                      What's the difference between Documentation and Whitepaper?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Documentation:</strong> Technical reference for metrics, formulas, and data requirements.<br />
                      <strong className="text-foreground">Whitepaper:</strong> Academic/philosophical framework explaining the underlying methodology and theory.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-4">
                  <Link to="/documentation" className="hover:text-primary transition-colors">Technical Docs</Link>
                  <Link to="/whitepaper" className="hover:text-primary transition-colors">Whitepaper</Link>
                  <Link to="/lens" className="hover:text-primary transition-colors">Access Lens</Link>
                </div>
                <div>© 2026 SwadeshLABS — STRUCTURA · Core</div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
