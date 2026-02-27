import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Download, FileDown } from "lucide-react";
import { StructuraLogo } from "@/components/StructuraLogo";
import { Button } from "@/components/ui/button";
import { exportWhitepaperPdf } from "@/lib/exportWhitepaperPdf";

export const Whitepaper = () => {
  const handleDownloadTxt = () => {
    const content = document.getElementById('whitepaper-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'STRUCTURA_CORE_Whitepaper_v1.2.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    exportWhitepaperPdf();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-mono tracking-wide">RETURN</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTxt}
              className="font-mono text-[10px] sm:text-xs tracking-wide px-2 sm:px-3 h-8"
            >
              <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
              TXT
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              className="font-mono text-[10px] sm:text-xs tracking-wide bg-primary hover:bg-primary/90 px-2 sm:px-3 h-8"
            >
              <FileDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="border-b border-border/30 bg-card/30">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-10 sm:py-16 text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <StructuraLogo size="md" className="sm:hidden" />
            <StructuraLogo size="lg" className="hidden sm:block" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.3em] text-primary uppercase">Whitepaper</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide mb-3 sm:mb-4">
            STRUCTURA · CORE
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-light italic max-w-2xl mx-auto px-2">
            A Deterministic Framework for Descriptive Market Structure Analysis
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-muted-foreground">
            <span>Published by: <span className="text-foreground">Swadesh LABS</span></span>
            <span className="text-border hidden sm:inline">|</span>
            <span>Version: <span className="text-foreground">1.2</span></span>
            <span className="text-border hidden sm:inline">|</span>
            <span>Class: <span className="text-foreground">Research & Methodology</span></span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="whitepaper-content" className="max-w-4xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
        <article className="prose prose-invert prose-sm sm:prose-lg max-w-none">

          {/* Abstract */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              1. Abstract
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Contemporary retail trading systems are overwhelmingly dominated by predictive abstractions—indicators and models designed to forecast future price direction. These approaches typically rely on linear assumptions, stationarity, or short-memory dynamics, which are empirically violated in real financial markets.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3">
              Financial markets are non-linear, regime-dependent, and structurally unstable. Under such conditions, persistent prediction of future prices is mathematically untenable beyond short horizons.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3">
              <strong className="text-foreground">STRUCTURA · CORE</strong> is not a forecasting system, trading strategy, or signal service. It is a deterministic market structure observatory designed to describe the current state of price behavior using reproducible statistical and geometric diagnostics.
            </p>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-6 sm:my-8">
              <p className="text-center text-foreground font-light italic text-sm sm:text-lg">
                Rather than answering "Where will price go?", STRUCTURA CORE answers the more fundamental and solvable question:
              </p>
              <p className="text-center text-primary font-mono text-sm sm:text-lg mt-3 sm:mt-4">
                "What type of market exists right now, and is it structurally suitable for capital deployment?"
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              2. Foundational Philosophy: Structure over Prediction
            </h2>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">2.1 The Limits of Prediction</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              In stochastic systems with non-stationary variance, regime shifts, and path dependency, point prediction degrades rapidly. This is not a philosophical claim, but a mathematical one supported by decades of empirical finance research.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4 mt-3">
              Prediction assumes:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>Stable distributions</li>
              <li>Linear response</li>
              <li>Time-invariant parameters</li>
            </ul>
            <p className="text-foreground font-medium mt-3 sm:mt-4 text-sm sm:text-base">Markets violate all three.</p>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">2.2 Reframing the Problem</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              STRUCTURA CORE reframes trading analysis as a <strong className="text-foreground">state classification problem</strong>, not a forecasting problem.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4 mt-3">It focuses on identifying:</p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>Whether price behaves as a random walk</li>
              <li>Whether persistence or anti-persistence exists</li>
              <li>Whether information is compressed or dispersed</li>
              <li>Whether geometric constraints are respected</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3 sm:mt-4">
              This reframing converts an ill-posed prediction task into a deterministic descriptive audit.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              3. Data Integrity & Market Reality
            </h2>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">3.1 Volume in Decentralized (OTC) Markets</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              In OTC markets such as Spot FX and CFDs (e.g., XAUUSD), centralized exchange volume does not exist. STRUCTURA CORE explicitly acknowledges this structural limitation.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3">
              Instead of attempting to reconstruct "true volume," the system analyzes <strong className="text-foreground">Liquidity Participation Density</strong> via tick volume.
            </p>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Tick Volume as an Informational Proxy</h4>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2">
                <li>Tick volume measures price update frequency</li>
                <li>Empirical research demonstrates strong correlation between tick frequency and actual traded volume in liquid markets</li>
                <li>Institutional activity manifests first as quote pressure before size disclosure</li>
              </ul>
            </div>
            <p className="text-sm sm:text-base text-foreground font-medium">
              STRUCTURA CORE does not simulate volume. It analyzes observable event density.
            </p>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">3.2 Implementation Principles</h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>Broker-native tick data only</li>
              <li>No cross-feed normalization</li>
              <li>Entropy and dispersion derived from event frequency, not trade size</li>
              <li>Full reproducibility given identical input data</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              4. Regime Identification via Fractal Statistics
            </h2>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">4.1 Hurst Exponent (Detrended Fluctuation Analysis)</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              STRUCTURA CORE estimates long-range dependence using Detrended Fluctuation Analysis (DFA) to reduce bias from non-stationarity.
            </p>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Mathematical Definition</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Given a time series x(t):</p>
              <ol className="list-decimal list-inside text-sm sm:text-base text-muted-foreground space-y-2 sm:space-y-3">
                <li>Construct cumulative deviation: Y(k) = Σ(xᵢ - x̄)</li>
                <li>Divide into windows of size n, detrend each window using first-order polynomial regression</li>
                <li>Compute fluctuation function: F(n) = √[(1/N) Σ(Y(k) - Yₙ(k))²]</li>
                <li>Estimate scaling relationship: F(n) ~ nᴴ</li>
              </ol>
              <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4">Where H is the Hurst exponent.</p>
            </div>

            <div className="overflow-x-auto my-4 sm:my-6 -mx-3 px-3 sm:mx-0 sm:px-0">
              <table className="w-full border border-border/50 text-xs sm:text-sm">
                <thead className="bg-card/50">
                  <tr>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Hurst Value</th>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Structural Regime</th>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Implication</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">H ≈ 0.5</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Random Walk</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Trend systems fail</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">H &gt; 0.55</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Persistent</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Trend-following viable</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">H &lt; 0.45</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Anti-Persistent</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Mean reversion dominates</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm sm:text-base text-foreground font-medium">This metric is descriptive only. No future inference is embedded.</p>
          </section>

          {/* Section 5 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              5. Information Dispersion & Entropy
            </h2>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">5.1 Shannon Entropy</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              STRUCTURA CORE measures information dispersion using Shannon entropy applied to normalized price-change distributions.
            </p>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6 text-center">
              <p className="font-mono text-base sm:text-lg text-foreground">H = - Σ pᵢ log₂ pᵢ</p>
              <p className="text-muted-foreground mt-3 sm:mt-4 text-xs sm:text-sm">
                Where pᵢ represents probability mass of binned returns. Base 2 is used for information-theoretic interpretation.
              </p>
            </div>
            <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Purpose</h4>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>High entropy → dispersed, noisy regime</li>
              <li>Low entropy → compressed structure, increased instability risk</li>
            </ul>
            <p className="text-sm sm:text-base text-foreground font-medium mt-3 sm:mt-4">Entropy is state-descriptive, not predictive.</p>
          </section>

          {/* Section 6: Advanced Econometrics */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              6. Advanced Econometrics for FX/Commodities
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              STRUCTURA CORE integrates a comprehensive suite of institutional-grade econometric metrics derived from high-frequency finance literature. These metrics are specifically designed for OTC markets where true volume data is unavailable.
            </p>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">6.1 High-Frequency Volatility Estimators</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              Instead of standard deviation, STRUCTURA CORE employs efficient volatility estimators from high-frequency literature:
            </p>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Parkinson Estimator (Range-Based)</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">σ²_P = (1/4ln2) · (1/n) Σ[ln(H/L)]²</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Uses high-low range for more efficient variance estimation</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Garman-Klass Estimator</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">σ²_GK = (1/n) Σ[0.5·ln(H/L)² - (2ln2-1)·ln(C/O)²]</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Combines range and close-to-open information</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Rogers-Satchell Estimator (Drift-Adjusted)</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">σ²_RS = (1/n) Σ[ln(H/C)·ln(H/O) + ln(L/C)·ln(L/O)]</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Accounts for drift in the price process</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Yang-Zhang Estimator (Jump-Robust)</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">σ²_YZ = σ²_o + k·σ²_c + (1-k)·σ²_RS</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Combines overnight, open-to-close, and Rogers-Satchell components for jump robustness</p>
            </div>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">6.2 Jump Detection & Discontinuities</h3>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Barndorff-Nielsen & Shephard Jump Test</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">Using bipower variation:</p>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">{"BV = (π/2) Σ|r_i||r_{i-1}|"}</p>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">RJ = (RV - BV) / RV</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Realized Jump ratio indicates discontinuous price movements</p>
            </div>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">6.3 Volume-Free Liquidity Proxies</h3>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Roll's Effective Spread Estimator</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">{"S = 2√(-Cov(ΔP_t, ΔP_{t-1}))"}</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Estimates bid-ask spread from serial covariance of price changes</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Corwin-Schultz Spread Estimator</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">Uses two-day high-low ratios:</p>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">S = 2(e^α - 1) / (1 + e^α)</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Where α is derived from β (single-day range) and γ (two-day range)</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Amihud Illiquidity Ratio</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">ILLIQ = |r_t| / (V_t · P_t)</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Price impact per unit of tick volume</p>
            </div>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">6.4 Market Efficiency Metrics</h3>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Hasbrouck's Market Efficiency Coefficient</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">MEC = 1 - (σ²_YZ / σ²_GK)</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Ratio of noise variance to efficient price variance</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Martingale Difference Test</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">
                Tests whether returns follow a martingale process (weak-form efficiency):
              </p>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">{"MD = (1/n) Σ I{E[r_t|F_{t-1}] ≠ 0}"}</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Estimated via variance ratio tests across multiple horizons</p>
            </div>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">6.5 Regime Detection & Structural Breaks</h3>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">CUSUM Test for Volatility Changes</h4>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">CUSUM_t = (1/σ√n) Σ(|r_i| - |r̄|)</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Structural break detected when |CUSUM_t| exceeds critical value</p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Volatility Regime Classification</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">Two-state descriptive model:</p>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
                <li><strong className="text-foreground">Low Volatility Regime:</strong> σ below historical median</li>
                <li><strong className="text-foreground">High Volatility Regime:</strong> σ above historical median</li>
              </ul>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3">Current regime probability based on rolling volatility percentile</p>
            </div>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">6.6 Long Memory & Persistence</h3>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">FIGARCH Long Memory Test</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">Estimates fractional integration in volatility:</p>
              <p className="font-mono text-sm sm:text-base text-foreground text-center mb-2">(1-L)^d ln(σ²_t) = ε_t</p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">d &gt; 0 indicates long memory in volatility process</p>
            </div>

            <div className="overflow-x-auto my-4 sm:my-6 -mx-3 px-3 sm:mx-0 sm:px-0">
              <table className="w-full border border-border/50 text-xs sm:text-sm">
                <thead className="bg-card/50">
                  <tr>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Metric Category</th>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Primary Estimator</th>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Academic Source</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Volatility</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">Yang-Zhang</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Yang & Zhang (2000)</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Jump Detection</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">BN&S Bipower</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Barndorff-Nielsen & Shephard (2004)</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Liquidity</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">Corwin-Schultz</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Corwin & Schultz (2012)</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Efficiency</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">Variance Ratio</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Lo & MacKinlay (1988)</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Structural Breaks</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">CUSUM</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Brown, Durbin & Evans (1975)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm sm:text-base text-foreground font-medium mt-4">
              All econometric metrics are deterministic, reproducible, and peer-reviewable.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              7. Proprietary Structural Metrics (Logic Transparency)
            </h2>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">7.1 Structural Integrity Index (SII)</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Definition:</strong> A bounded composite metric SII ∈ [0,1] quantifying the internal coherence of observed price structure.
            </p>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Components:</h4>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2">
                <li><strong className="text-foreground">Fractal Stability (≈40%)</strong> — Rolling variance of Hurst exponent</li>
                <li><strong className="text-foreground">Geometric Conformance (≈30%)</strong> — Normalized distance of price from lattice constraints</li>
                <li><strong className="text-foreground">Directional Efficiency (≈30%)</strong> — Net displacement vs total path length</li>
              </ul>
              <p className="font-mono text-sm sm:text-base text-foreground mt-4 sm:mt-6 text-center">SII = w₁H_stable + w₂G_conf + w₃E_dir</p>
            </div>
            <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Interpretation:</h4>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>SII &gt; 0.70: Structurally intact regime</li>
              <li>SII &lt; 0.40: Degraded structure, high false-signal risk</li>
            </ul>
            <p className="text-sm sm:text-base text-foreground font-medium mt-3 sm:mt-4">SII is not confidence. It is structural health.</p>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">7.2 Spectrum Stability (HSS)</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Markets may exhibit cyclical dominance or fragmented frequency behavior. STRUCTURA CORE evaluates spectral coherence using FFT-based power distribution.
            </p>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6 text-center">
              <p className="font-mono text-base sm:text-lg text-foreground">HSS = P_max / Σ Pᵢ</p>
              <p className="text-muted-foreground mt-3 sm:mt-4 text-xs sm:text-sm">
                Where P_max is dominant frequency power. Denominator is total spectral energy.
              </p>
            </div>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>Low HSS → noise-dominated</li>
              <li>High HSS → resonant, timing-compatible regime</li>
            </ul>
            <p className="text-sm sm:text-base text-foreground font-medium mt-3 sm:mt-4">No cycle projection is performed.</p>
          </section>

          {/* Section 8 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              8. Anchor-Based Lattice Geometry
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              STRUCTURA CORE employs deterministic, anchor-locked geometry.
            </p>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
              <h4 className="text-base sm:text-lg font-mono text-foreground mb-3 sm:mb-4">Methodology</h4>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2 sm:space-y-3">
                <li><strong className="text-foreground">Anchor Selection</strong> — First data point of dataset (immutable)</li>
                <li><strong className="text-foreground">Non-Linear Projection</strong> — Logarithmic, square-root, and harmonic transforms</li>
                <li><strong className="text-foreground">Conformance Measurement</strong> — Normalized distance of price from projected lattice levels</li>
              </ul>
            </div>
            <p className="text-sm sm:text-base text-foreground font-medium">This geometry is auditable and feed-specific.</p>
          </section>

          {/* Section 9 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              9. Practical Usage Guidelines (Non-Prescriptive)
            </h2>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4">9.1 Data Requirements</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">Minimum bars:</p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>Intraday: ≥ 1,500</li>
              <li>Daily: ≥ 500</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mt-4">Missing data treated as structural events. Single-feed consistency required.</p>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">9.2 Indicative Lookback Horizons</h3>
            <div className="overflow-x-auto my-4 sm:my-6 -mx-3 px-3 sm:mx-0 sm:px-0">
              <table className="w-full border border-border/50 text-xs sm:text-sm">
                <thead className="bg-card/50">
                  <tr>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Instrument Class</th>
                    <th className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 text-left font-mono">Suggested Range</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">FX Majors</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">500–2000 bars</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Commodities</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">800–2500 bars</td>
                  </tr>
                  <tr>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3">Indices</td>
                    <td className="border border-border/50 px-2 sm:px-4 py-2 sm:py-3 font-mono">1000–3000 bars</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg sm:text-xl font-light text-primary mb-3 sm:mb-4 mt-6 sm:mt-8">9.3 Multi-Timeframe Workflow</h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>Higher timeframe: regime classification</li>
              <li>Lower timeframe: execution logic (external systems)</li>
            </ul>
            <p className="text-sm sm:text-base text-foreground font-medium mt-3 sm:mt-4">STRUCTURA CORE is not a multi-timeframe signal generator.</p>
          </section>

          {/* Section 10 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              10. What STRUCTURA CORE Is — and Is Not
            </h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-mono text-primary mb-3 sm:mb-4">It IS</h4>
                <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2">
                  <li>A deterministic regime classification engine</li>
                  <li>A structural market observatory</li>
                  <li>A reproducible analytical system</li>
                  <li>An institutional-grade econometrics platform</li>
                </ul>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-mono text-destructive mb-3 sm:mb-4">It IS NOT</h4>
                <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1.5 sm:space-y-2">
                  <li>A trading strategy</li>
                  <li>A signal service</li>
                  <li>A prediction engine</li>
                  <li>A profit guarantee</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              11. Academic Foundations
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              STRUCTURA CORE is grounded in established research, including but not limited to:
            </p>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Lo, A. (1991)</strong> – Long-Term Memory in Stock Market Prices</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Peters, E. (1994)</strong> – Fractal Market Hypothesis</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Mandelbrot, B. (1997)</strong> – Fractals and Scaling in Finance</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Kyle, A. (1985)</strong> – Continuous Auctions and Insider Trading</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Bouchaud et al. (2009)</strong> – Market Impact & Liquidity</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Cont, R. (2001)</strong> – Empirical Properties of Asset Returns</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Roll, R. (1984)</strong> – A Simple Implicit Measure of the Effective Bid-Ask Spread</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Corwin & Schultz (2012)</strong> – A Simple Way to Estimate Bid-Ask Spreads from Daily High and Low Prices</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Barndorff-Nielsen & Shephard (2004)</strong> – Power and Bipower Variation with Stochastic Volatility and Jumps</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Yang & Zhang (2000)</strong> – Drift Independent Volatility Estimation Based on High, Low, Open, and Close Prices</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Amihud, Y. (2002)</strong> – Illiquidity and Stock Returns: Cross-Section and Time-Series Effects</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">Lo & MacKinlay (1988)</strong> – Stock Market Prices Do Not Follow Random Walks</span>
              </li>
            </ul>
            <p className="text-sm sm:text-base text-foreground font-medium mt-4 sm:mt-6">
              STRUCTURA CORE claims implementation synthesis, not theoretical novelty.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-light tracking-wide border-b border-border/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              12. Conclusion
            </h2>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-8 text-center">
              <p className="text-base sm:text-xl text-foreground font-light mb-4 sm:mb-6">
                STRUCTURA · CORE exists for traders, risk managers, and researchers who recognize a fundamental truth:
              </p>
              <p className="text-lg sm:text-2xl text-primary font-light italic mb-4 sm:mb-6">
                Capital should only be deployed when market structure permits it.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                The system does not promise profits.<br />
                It offers structural clarity.
              </p>
              <p className="text-sm sm:text-base text-foreground mt-4 sm:mt-6">
                If a market is unsuitable, STRUCTURA CORE will show it—without bias, optimism, or narrative.
              </p>
            </div>
          </section>

        </article>

        {/* Footer */}
        <footer className="border-t border-border/30 pt-12 mt-16 text-center">
          <p className="text-sm font-mono tracking-[0.2em] text-primary uppercase mb-2">
            Swadesh LABS
          </p>
          <p className="text-xs text-muted-foreground">
            Structural Intelligence for Non-Linear Markets
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Whitepaper;
