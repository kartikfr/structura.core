import { jsPDF } from 'jspdf';

// ============================================================================
// STRUCTURA CORE WHITEPAPER PDF EXPORT
// Industrial-Grade Institutional Document
// ============================================================================

// Institutional Color System
const theme = {
  charcoal: [28, 32, 38] as [number, number, number],
  graphite: [42, 48, 56] as [number, number, number],
  slate: [80, 90, 105] as [number, number, number],
  silver: [160, 170, 180] as [number, number, number],
  ivory: [245, 247, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  primary: [64, 156, 143] as [number, number, number],
  primaryDark: [45, 120, 110] as [number, number, number],
  primaryLight: [100, 180, 168] as [number, number, number],
  gold: [218, 165, 32] as [number, number, number],
};

// ============================================================================
// LOGO & BRANDING
// ============================================================================

function drawLargeLogo(doc: jsPDF, x: number, y: number, size: number = 80): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  // Outer ring
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(2.5);
  doc.circle(centerX, centerY, size / 2 - 4, 'S');

  // Second ring
  doc.setLineWidth(1);
  doc.setDrawColor(...theme.primaryLight);
  doc.circle(centerX, centerY, size / 2 - 12, 'S');

  // Golden spiral approximation
  doc.setLineWidth(1.5);
  doc.setDrawColor(...theme.primary);

  const phi = 1.618;
  let r = size * 0.08;
  let angle = 0;
  const spiralPoints: [number, number][] = [];

  for (let i = 0; i < 12; i++) {
    const px = centerX + r * Math.cos(angle);
    const py = centerY + r * Math.sin(angle);
    spiralPoints.push([px, py]);
    r *= Math.pow(phi, 0.25);
    angle += Math.PI / 2;
  }

  for (let i = 0; i < spiralPoints.length - 1; i++) {
    doc.line(spiralPoints[i][0], spiralPoints[i][1], spiralPoints[i + 1][0], spiralPoints[i + 1][1]);
  }

  // Crosshairs
  doc.setLineWidth(0.8);
  doc.setDrawColor(...theme.primaryLight);
  doc.line(centerX - size * 0.35, centerY, centerX + size * 0.35, centerY);
  doc.line(centerX, centerY - size * 0.35, centerX, centerY + size * 0.35);

  // Center point
  doc.setFillColor(...theme.primary);
  doc.circle(centerX, centerY, 4, 'F');

  // Phi nodes
  const nodeRadius = 2.5;
  doc.setFillColor(...theme.primaryLight);
  doc.circle(centerX + size * 0.28, centerY - size * 0.18, nodeRadius, 'F');
  doc.circle(centerX - size * 0.18, centerY + size * 0.28, nodeRadius, 'F');
  doc.circle(centerX - size * 0.25, centerY - size * 0.22, nodeRadius, 'F');
  doc.circle(centerX + size * 0.22, centerY + size * 0.25, nodeRadius, 'F');
}

// ============================================================================
// PAGE UTILITIES
// ============================================================================

function checkPageBreak(doc: jsPDF, y: number, needed: number = 20): number {
  if (y + needed > 275) {
    doc.addPage();
    drawPageFooter(doc);
    return 30;
  }
  return y;
}

function drawPageFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageNum = doc.getNumberOfPages();

  // Footer line
  doc.setDrawColor(...theme.slate);
  doc.setLineWidth(0.3);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

  // Footer text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.slate);
  doc.text('STRUCTURA CORE | Technical Whitepaper v1.2', 15, pageHeight - 10);
  doc.text(`Page ${pageNum}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
}

// ============================================================================
// CONTENT RENDERING FUNCTIONS
// ============================================================================

function drawSectionHeader(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 25);

  // Accent bar
  doc.setFillColor(...theme.primary);
  doc.rect(15, y, 4, 14, 'F');

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.charcoal);
  doc.text(title.toUpperCase(), 24, y + 10);

  // Underline
  doc.setDrawColor(...theme.silver);
  doc.setLineWidth(0.5);
  doc.line(24, y + 14, 195, y + 14);

  return y + 22;
}

function drawSubsectionHeader(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.primaryDark);
  doc.text(title, 15, y);

  return y + 8;
}

function drawParagraph(doc: jsPDF, text: string, y: number, indent: number = 15): number {
  y = checkPageBreak(doc, y, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.charcoal);

  const lines = doc.splitTextToSize(text, 180 - indent + 15);
  doc.text(lines, indent, y);

  return y + lines.length * 4.5 + 3;
}

function drawBulletPoint(doc: jsPDF, text: string, y: number): number {
  y = checkPageBreak(doc, y, 10);

  doc.setFillColor(...theme.primary);
  doc.circle(20, y - 1.5, 1.2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.charcoal);

  const lines = doc.splitTextToSize(text, 170);
  doc.text(lines, 25, y);

  return y + lines.length * 4.5 + 2;
}

function drawHighlightBox(doc: jsPDF, text: string, y: number): number {
  y = checkPageBreak(doc, y, 28);

  const lines = doc.splitTextToSize(text, 165);
  const boxHeight = lines.length * 4.5 + 12;

  doc.setFillColor(...theme.graphite);
  doc.roundedRect(15, y, 180, boxHeight, 3, 3, 'F');

  // Left accent
  doc.setFillColor(...theme.primary);
  doc.rect(15, y, 3, boxHeight, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...theme.silver);
  doc.text(lines, 25, y + 8);

  return y + boxHeight + 8;
}

function drawTable(doc: jsPDF, headers: string[], rows: string[][], y: number, colWidths?: number[]): number {
  y = checkPageBreak(doc, y, 40);

  const defaultColWidth = 180 / headers.length;
  const widths = colWidths || headers.map(() => defaultColWidth);
  const rowHeight = 10;
  const startX = 15;

  // Header row
  doc.setFillColor(...theme.graphite);
  doc.rect(startX, y, 180, rowHeight, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.white);

  let xPos = startX + 5;
  headers.forEach((h, i) => {
    doc.text(h, xPos, y + 7);
    xPos += widths[i];
  });

  y += rowHeight;

  // Data rows
  rows.forEach((row, rowIndex) => {
    y = checkPageBreak(doc, y, rowHeight);

    doc.setFillColor(...(rowIndex % 2 === 0 ? theme.ivory : theme.white));
    doc.rect(startX, y, 180, rowHeight, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.charcoal);

    xPos = startX + 5;
    row.forEach((cell, i) => {
      const cellLines = doc.splitTextToSize(cell, widths[i] - 8);
      doc.text(cellLines[0] || '', xPos, y + 7);
      xPos += widths[i];
    });

    y += rowHeight;
  });

  // Border
  doc.setDrawColor(...theme.slate);
  doc.setLineWidth(0.3);
  doc.rect(startX, y - (rows.length + 1) * rowHeight, 180, (rows.length + 1) * rowHeight, 'S');

  return y + 8;
}

// Enhanced formula box with detailed explanation
function drawFormulaBoxDetailed(
  doc: jsPDF,
  formula: string,
  title: string,
  explanation: string,
  structuraUse: string,
  y: number
): number {
  y = checkPageBreak(doc, y, 55);

  // Formula container
  doc.setFillColor(...theme.ivory);
  doc.setDrawColor(...theme.slate);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, 180, 18, 2, 2, 'FD');

  // Formula text (ASCII-safe)
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.setTextColor(...theme.charcoal);
  doc.text(formula, 105, y + 8, { align: 'center' });

  // Formula name
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.primary);
  doc.text(title, 105, y + 15, { align: 'center' });

  y += 22;

  // Explanation box
  doc.setFillColor(250, 251, 252);
  doc.roundedRect(20, y, 170, 28, 2, 2, 'F');

  // "What it measures" label
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.slate);
  doc.text('WHAT IT MEASURES:', 25, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.charcoal);
  const explLines = doc.splitTextToSize(explanation, 155);
  doc.text(explLines.slice(0, 2), 25, y + 12);

  // "How STRUCTURA uses it" label
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.primaryDark);
  doc.text('STRUCTURA APPLICATION:', 25, y + 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.charcoal);
  const useLines = doc.splitTextToSize(structuraUse, 155);
  doc.text(useLines.slice(0, 1), 70, y + 22);

  return y + 34;
}

// Simple formula box (for less critical formulas)
function drawFormulaBox(doc: jsPDF, formula: string, description: string, y: number): number {
  y = checkPageBreak(doc, y, 28);

  doc.setFillColor(...theme.ivory);
  doc.setDrawColor(...theme.slate);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, 180, 20, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.setTextColor(...theme.charcoal);
  doc.text(formula, 105, y + 8, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.slate);
  doc.text(description, 105, y + 16, { align: 'center' });

  return y + 26;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function exportWhitepaperPdf(): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ===== COVER PAGE =====

  // Full dark background
  doc.setFillColor(...theme.charcoal);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent line
  doc.setFillColor(...theme.primary);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Logo - centered in upper half
  drawLargeLogo(doc, (pageWidth - 100) / 2, 45, 100);

  // Title
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.white);
  doc.text('STRUCTURA', pageWidth / 2, 175, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(...theme.primary);
  doc.text('CORE', pageWidth / 2, 190, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.silver);
  doc.text('Technical Whitepaper', pageWidth / 2, 208, { align: 'center' });

  doc.setFontSize(10);
  doc.text('A Deterministic Framework for Descriptive', pageWidth / 2, 220, { align: 'center' });
  doc.text('Market Structure Analysis', pageWidth / 2, 228, { align: 'center' });

  // Separator line
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.8);
  doc.line(60, 240, pageWidth - 60, 240);

  // Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.slate);
  doc.text('Published by: Swadesh LABS', pageWidth / 2, 252, { align: 'center' });
  doc.text('Version: 1.2 | Document Class: Research & Methodology', pageWidth / 2, 260, { align: 'center' });

  // Bottom accent
  doc.setFillColor(...theme.primary);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...theme.charcoal);
  doc.text(currentDate, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // ===== CONTENT PAGES =====

  doc.addPage();
  drawPageFooter(doc);
  let y = 25;

  // --------------------------------------------------------------------------
  // SECTION 1: ABSTRACT
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '1. Abstract', y);

  y = drawParagraph(doc, 'Contemporary retail trading systems are overwhelmingly dominated by predictive abstractions—indicators and models designed to forecast future price direction. These approaches typically rely on linear assumptions, stationarity, or short-memory dynamics, which are empirically violated in real financial markets.', y);

  y = drawParagraph(doc, 'Financial markets are non-linear, regime-dependent, and structurally unstable. Under such conditions, persistent prediction of future prices is mathematically untenable beyond short horizons.', y);

  y = drawParagraph(doc, 'STRUCTURA CORE is not a forecasting system, trading strategy, or signal service. It is a deterministic market structure observatory designed to describe the current state of price behavior using reproducible statistical and geometric diagnostics.', y);

  y = drawHighlightBox(doc, 'Rather than answering "Where will price go?", STRUCTURA CORE answers the more fundamental and solvable question: "What type of market exists right now, and is it structurally suitable for capital deployment?"', y);

  // --------------------------------------------------------------------------
  // SECTION 2: FOUNDATIONAL PHILOSOPHY
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '2. Foundational Philosophy: Structure Over Prediction', y);

  y = drawSubsectionHeader(doc, '2.1 The Limits of Prediction', y);
  y = drawParagraph(doc, 'In stochastic systems with non-stationary variance, regime shifts, and path dependency, point prediction degrades rapidly. This is not a philosophical claim, but a mathematical one supported by decades of empirical finance research.', y);

  y = drawParagraph(doc, 'Prediction assumes:', y);
  y = drawBulletPoint(doc, 'Stable distributions (markets have fat tails and regime changes)', y);
  y = drawBulletPoint(doc, 'Linear response (markets exhibit non-linear dynamics)', y);
  y = drawBulletPoint(doc, 'Time-invariant parameters (market structure evolves continuously)', y);

  y = drawHighlightBox(doc, 'Markets violate all three assumptions. This is why prediction-based systems fail systematically.', y);

  y = drawSubsectionHeader(doc, '2.2 Reframing the Problem', y);
  y = drawParagraph(doc, 'STRUCTURA CORE reframes trading analysis as a state classification problem, not a forecasting problem. Instead of asking "where will price go?", we ask:', y);
  y = drawBulletPoint(doc, 'Is current price behavior consistent with a random walk?', y);
  y = drawBulletPoint(doc, 'Does the market exhibit memory (persistence or anti-persistence)?', y);
  y = drawBulletPoint(doc, 'Is information compressed or dispersed across the price distribution?', y);
  y = drawBulletPoint(doc, 'Are geometric structural constraints being respected?', y);

  y = drawParagraph(doc, 'This reframing converts an ill-posed prediction task into a deterministic descriptive audit.', y);

  // --------------------------------------------------------------------------
  // SECTION 3: DATA INTEGRITY
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '3. Data Integrity & Market Reality', y);

  y = drawSubsectionHeader(doc, '3.1 Volume in Decentralized (OTC) Markets', y);
  y = drawParagraph(doc, 'In OTC markets such as Spot FX and CFDs (e.g., XAUUSD), centralized exchange volume does not exist. STRUCTURA CORE explicitly acknowledges this structural limitation and does not fabricate volume data.', y);

  y = drawParagraph(doc, 'Instead, the system analyzes Liquidity Participation Density via tick volume as an informational proxy:', y);
  y = drawBulletPoint(doc, 'Tick volume measures price update frequency, not traded notional', y);
  y = drawBulletPoint(doc, 'Empirical research shows strong correlation between tick frequency and actual volume in liquid markets', y);
  y = drawBulletPoint(doc, 'Institutional activity manifests first as quote pressure before size disclosure', y);

  y = drawHighlightBox(doc, 'STRUCTURA CORE does not simulate volume. It analyzes observable event density.', y);

  // --------------------------------------------------------------------------
  // SECTION 4: REGIME IDENTIFICATION
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '4. Regime Identification via Fractal Statistics', y);

  y = drawSubsectionHeader(doc, '4.1 Hurst Exponent (Detrended Fluctuation Analysis)', y);
  y = drawParagraph(doc, 'STRUCTURA CORE estimates long-range dependence using Detrended Fluctuation Analysis (DFA), which is robust to non-stationarity—a critical requirement for financial time series.', y);

  y = drawFormulaBoxDetailed(doc,
    'F(n) ~ n^H',
    'Hurst Exponent via DFA',
    'The Hurst exponent H measures the degree of long-range dependence in a time series. F(n) is the fluctuation function at scale n. H=0.5 indicates random walk; H>0.5 indicates trending behavior; H<0.5 indicates mean-reversion.',
    'Classifies market regime (trending/random/mean-reverting) to determine structural environment.',
    y
  );

  y = drawTable(doc,
    ['Hurst Value', 'Structural Regime', 'Practical Implication'],
    [
      ['H = 0.5', 'Random Walk', 'Trend-following strategies unreliable'],
      ['H > 0.55', 'Persistent', 'Trend-following environments viable'],
      ['H < 0.45', 'Anti-Persistent', 'Mean-reversion patterns dominate'],
    ], y, [45, 60, 75]);

  y = drawHighlightBox(doc, 'This metric is descriptive only. No future inference is embedded in the calculation.', y);

  // --------------------------------------------------------------------------
  // SECTION 5: INFORMATION ENTROPY
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '5. Information Dispersion & Entropy Analysis', y);

  y = drawSubsectionHeader(doc, '5.1 Shannon Entropy', y);
  y = drawParagraph(doc, 'STRUCTURA CORE measures information dispersion using Shannon entropy applied to normalized price-change distributions. This quantifies how "spread out" or "concentrated" price movements are.', y);

  y = drawFormulaBoxDetailed(doc,
    'H = - SUM( p_i * log2(p_i) )',
    'Shannon Entropy',
    'Entropy H measures the unpredictability or randomness in price changes. p_i represents the probability of each binned return category. Higher entropy means more dispersed, noisy behavior. Lower entropy indicates concentrated, structured behavior.',
    'Detects regime compression (low entropy = potential breakout) vs noise (high entropy = choppy).',
    y
  );

  y = drawBulletPoint(doc, 'High entropy: dispersed, noisy regime—signals unreliable', y);
  y = drawBulletPoint(doc, 'Low entropy: compressed structure—increased potential for directional movement', y);

  y = drawHighlightBox(doc, 'Entropy is state-descriptive. It identifies structural compression, not future direction.', y);

  // --------------------------------------------------------------------------
  // SECTION 6: ADVANCED ECONOMETRICS
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '6. Advanced Econometrics Framework', y);

  y = drawParagraph(doc, 'STRUCTURA CORE integrates a comprehensive suite of institutional-grade econometric metrics derived from high-frequency finance literature. These metrics are specifically designed for OTC markets where true volume data is unavailable.', y);

  // 6.1 Volatility Estimators
  y = drawSubsectionHeader(doc, '6.1 High-Frequency Volatility Estimators', y);
  y = drawParagraph(doc, 'Standard deviation underestimates true volatility by ignoring intrabar price dynamics. STRUCTURA CORE employs four academic volatility estimators that extract more information from OHLC data:', y);

  y = drawFormulaBoxDetailed(doc,
    'Var_P = (1/4*ln2) * (1/n) * SUM[ ln(H/L)^2 ]',
    'Parkinson Estimator (1980)',
    'Uses the high-low range to estimate variance. More efficient than close-to-close because it captures intrabar price movement. Assumes continuous trading with no overnight gaps.',
    'Primary range-based volatility input for regime classification.',
    y
  );

  y = drawFormulaBoxDetailed(doc,
    'Var_GK = (1/n) * SUM[ 0.5*ln(H/L)^2 - (2*ln2-1)*ln(C/O)^2 ]',
    'Garman-Klass Estimator (1980)',
    'Combines range information with open-close data for higher efficiency. Accounts for both the spread of prices and the directional movement within each bar.',
    'Cross-validates Parkinson; detects range vs directional volatility divergence.',
    y
  );

  y = drawFormulaBoxDetailed(doc,
    'Var_RS = (1/n) * SUM[ ln(H/C)*ln(H/O) + ln(L/C)*ln(L/O) ]',
    'Rogers-Satchell Estimator (1991)',
    'Accounts for drift in the price process, making it robust when prices have a directional trend. Does not assume zero mean returns.',
    'Drift-adjusted volatility for trending markets.',
    y
  );

  y = drawFormulaBoxDetailed(doc,
    'Var_YZ = Var_overnight + k*Var_openclose + (1-k)*Var_RS',
    'Yang-Zhang Estimator (2000)',
    'The most comprehensive OHLC estimator. Combines overnight jumps, open-close variance, and Rogers-Satchell components. Robust to both drift and opening jumps.',
    'PRIMARY volatility estimator for STRUCTURA regime classification.',
    y
  );

  // 6.2 Jump Detection
  y = drawSubsectionHeader(doc, '6.2 Jump Detection & Price Discontinuities', y);
  y = drawParagraph(doc, 'Continuous price movement and discontinuous jumps require different analytical approaches. STRUCTURA CORE detects jumps using Bipower Variation:', y);

  y = drawFormulaBoxDetailed(doc,
    'BV = (pi/2) * SUM( |r_i| * |r_(i-1)| )  |  RJ = (RV - BV) / RV',
    'Barndorff-Nielsen & Shephard Bipower Variation (2004)',
    'Bipower Variation (BV) is robust to jumps because it uses products of adjacent absolute returns. Realized Variance (RV) captures total variance. The difference (RV-BV) isolates jump variance.',
    'Jump Ratio (RJ) classifies market discontinuity risk. High RJ = gap-prone regime.',
    y
  );

  y = drawBulletPoint(doc, 'Jump Ratio > 0.15: Discontinuous regime—gap risk elevated', y);
  y = drawBulletPoint(doc, 'Jump Ratio < 0.05: Continuous diffusion—smooth price process', y);

  // 6.3 Liquidity Proxies
  y = drawSubsectionHeader(doc, '6.3 Volume-Free Liquidity Proxies', y);
  y = drawParagraph(doc, 'In OTC markets without true volume, STRUCTURA CORE estimates liquidity using price-based proxies:', y);

  y = drawFormulaBoxDetailed(doc,
    'S = 2 * SQRT( -Cov(dP_t, dP_(t-1)) )',
    'Roll Spread Estimator (1984)',
    'Estimates the effective bid-ask spread from the negative serial covariance of price changes. Based on the insight that market maker inventory management creates negative autocorrelation.',
    'Identifies illiquidity regimes where execution costs are elevated.',
    y
  );

  y = drawFormulaBoxDetailed(doc,
    'S = 2 * (e^alpha - 1) / (1 + e^alpha)',
    'Corwin-Schultz Spread (2012)',
    'Uses the ratio of two-day high-low range to single-day ranges. The idea is that the high-low range over two days captures both volatility and spread, while single-day ranges capture volatility alone.',
    'Cross-validates Roll spread; robust to different market microstructure.',
    y
  );

  y = drawFormulaBoxDetailed(doc,
    'ILLIQ = |r_t| / (TickVol_t * P_t)',
    'Amihud Illiquidity Ratio (2002)',
    'Measures price impact per unit of trading activity. High values indicate that small volume causes large price movements—a sign of illiquidity.',
    'Detects thin-market regimes where slippage risk is elevated.',
    y
  );

  // 6.4 Market Efficiency
  y = drawSubsectionHeader(doc, '6.4 Market Efficiency Metrics', y);

  y = drawFormulaBoxDetailed(doc,
    'VR(q) = Var(r_t, q) / (q * Var(r_t, 1))',
    'Variance Ratio Test (Lo & MacKinlay, 1988)',
    'Tests whether long-horizon variance equals the sum of short-horizon variances. Under random walk, VR(q)=1 for all horizons q. Deviations indicate predictable structure.',
    'Detects departure from random walk across multiple time scales.',
    y
  );

  y = drawFormulaBoxDetailed(doc,
    'MEC = 1 - (Var_noise / Var_efficient)',
    'Hasbrouck Market Efficiency Coefficient',
    'Separates observed price variance into efficient (fundamental) and noise components. High MEC means prices quickly incorporate information.',
    'Measures information efficiency of current price discovery process.',
    y
  );

  // 6.5 Regime Detection
  y = drawSubsectionHeader(doc, '6.5 Structural Break Detection', y);

  y = drawFormulaBoxDetailed(doc,
    'CUSUM_t = (1 / sigma*sqrt(n)) * SUM( |r_i| - mean(|r|) )',
    'CUSUM Test (Brown et al., 1975)',
    'Cumulative Sum test detects structural breaks by tracking cumulative deviations from the mean. When CUSUM exceeds critical bounds, a regime change is indicated.',
    'Real-time structural break detection for regime transition alerts.',
    y
  );

  y = drawTable(doc,
    ['Metric Category', 'Primary Estimator', 'Academic Source'],
    [
      ['Volatility', 'Yang-Zhang', 'Yang & Zhang (2000)'],
      ['Jump Detection', 'Bipower Variation', 'Barndorff-Nielsen (2004)'],
      ['Liquidity', 'Corwin-Schultz', 'Corwin & Schultz (2012)'],
      ['Efficiency', 'Variance Ratio', 'Lo & MacKinlay (1988)'],
      ['Structural Breaks', 'CUSUM', 'Brown et al. (1975)'],
    ], y, [50, 55, 75]);

  y = drawHighlightBox(doc, 'All econometric metrics are deterministic, reproducible, and derived from peer-reviewed academic literature.', y);

  // --------------------------------------------------------------------------
  // SECTION 7: PROPRIETARY METRICS
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '7. Proprietary Structural Metrics', y);

  y = drawSubsectionHeader(doc, '7.1 Structural Integrity Index (SII)', y);
  y = drawParagraph(doc, 'The SII is a bounded composite metric in [0,1] that quantifies the internal coherence of observed price structure. It aggregates three orthogonal dimensions:', y);

  y = drawBulletPoint(doc, 'Fractal Stability (40% weight): Rolling variance of Hurst exponent across windows', y);
  y = drawBulletPoint(doc, 'Geometric Conformance (30% weight): Normalized distance of price from lattice constraints', y);
  y = drawBulletPoint(doc, 'Directional Efficiency (30% weight): Net displacement vs total path length (efficiency ratio)', y);

  y = drawFormulaBoxDetailed(doc,
    'SII = w1*H_stable + w2*G_conf + w3*E_dir',
    'Structural Integrity Index',
    'Weighted composite of three structural health indicators. H_stable measures consistency of fractal behavior. G_conf measures adherence to geometric constraints. E_dir measures path efficiency.',
    'Single-number structural health score. SII > 0.70 = intact structure; SII < 0.40 = degraded.',
    y
  );

  y = drawBulletPoint(doc, 'SII > 0.70: Structurally intact regime—analytical framework applicable', y);
  y = drawBulletPoint(doc, 'SII < 0.40: Degraded structure—high false-signal risk, framework unreliable', y);

  y = drawHighlightBox(doc, 'SII is not confidence. It is structural health. A high SII does not imply profitability.', y);

  y = drawSubsectionHeader(doc, '7.2 Hurst Spectrum Stability (HSS)', y);
  y = drawParagraph(doc, 'Markets may exhibit cyclical dominance or fragmented frequency behavior. STRUCTURA CORE evaluates spectral coherence using FFT-based power distribution:', y);

  y = drawFormulaBoxDetailed(doc,
    'HSS = P_max / SUM(P_i)',
    'Hurst Spectrum Stability',
    'Ratio of dominant frequency power to total spectral energy. High HSS means one frequency dominates. Low HSS means power is dispersed across many frequencies (noise).',
    'Identifies coherent vs fragmented market rhythm. High HSS = timing-compatible regime.',
    y
  );

  // --------------------------------------------------------------------------
  // SECTION 8: LATTICE GEOMETRY
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '8. Anchor-Based Lattice Geometry', y);

  y = drawParagraph(doc, 'STRUCTURA CORE employs deterministic, anchor-locked geometry to identify structural price levels. Unlike discretionary methods, these levels are mathematically reproducible.', y);

  y = drawSubsectionHeader(doc, '8.1 Methodology', y);
  y = drawBulletPoint(doc, 'Anchor Selection: First data point of dataset (immutable reference point)', y);
  y = drawBulletPoint(doc, 'Non-Linear Projection: Logarithmic, square-root, and Fibonacci-derived transforms', y);
  y = drawBulletPoint(doc, 'Conformance Measurement: Normalized distance of current price from projected lattice levels', y);

  y = drawHighlightBox(doc, 'This geometry is auditable, feed-specific, and produces identical results given identical input data.', y);

  // --------------------------------------------------------------------------
  // SECTION 9: USAGE GUIDELINES
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '9. Practical Usage Guidelines', y);

  y = drawSubsectionHeader(doc, '9.1 Data Requirements', y);
  y = drawBulletPoint(doc, 'Intraday timeframes: Minimum 1,500 bars recommended', y);
  y = drawBulletPoint(doc, 'Daily timeframes: Minimum 500 bars recommended', y);
  y = drawBulletPoint(doc, 'Missing data treated as structural events (not interpolated)', y);
  y = drawBulletPoint(doc, 'Single-feed consistency required for reproducibility', y);

  y = drawSubsectionHeader(doc, '9.2 Indicative Lookback Horizons', y);
  y = drawTable(doc,
    ['Instrument Class', 'Suggested Range', 'Notes'],
    [
      ['FX Majors', '500-2000 bars', 'High liquidity, stable spreads'],
      ['Commodities', '800-2500 bars', 'Variable spreads, session gaps'],
      ['Indices', '1000-3000 bars', 'Session gaps, overnight risk'],
    ], y, [50, 55, 75]);

  // --------------------------------------------------------------------------
  // SECTION 10: WHAT IT IS
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '10. What STRUCTURA CORE Is - And Is Not', y);

  y = drawSubsectionHeader(doc, 'It IS:', y);
  y = drawBulletPoint(doc, 'A deterministic regime classification engine', y);
  y = drawBulletPoint(doc, 'A structural market observatory', y);
  y = drawBulletPoint(doc, 'A reproducible analytical system', y);
  y = drawBulletPoint(doc, 'An institutional-grade econometrics platform', y);

  y = drawSubsectionHeader(doc, 'It IS NOT:', y);
  y = drawBulletPoint(doc, 'A trading strategy or execution system', y);
  y = drawBulletPoint(doc, 'A signal service or alert generator', y);
  y = drawBulletPoint(doc, 'A prediction engine or price forecaster', y);
  y = drawBulletPoint(doc, 'A profit guarantee or performance promise', y);

  // --------------------------------------------------------------------------
  // SECTION 11: ACADEMIC FOUNDATIONS
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '11. Academic Foundations', y);

  y = drawParagraph(doc, 'STRUCTURA CORE is grounded in established peer-reviewed research:', y);

  y = drawBulletPoint(doc, 'Lo, A. (1991) - Long-Term Memory in Stock Market Prices', y);
  y = drawBulletPoint(doc, 'Peters, E. (1994) - Fractal Market Hypothesis', y);
  y = drawBulletPoint(doc, 'Mandelbrot, B. (1997) - Fractals and Scaling in Finance', y);
  y = drawBulletPoint(doc, 'Kyle, A. (1985) - Continuous Auctions and Insider Trading', y);
  y = drawBulletPoint(doc, 'Roll, R. (1984) - A Simple Implicit Measure of the Effective Bid-Ask Spread', y);
  y = drawBulletPoint(doc, 'Corwin & Schultz (2012) - Bid-Ask Spreads from Daily High and Low Prices', y);
  y = drawBulletPoint(doc, 'Barndorff-Nielsen & Shephard (2004) - Power and Bipower Variation', y);
  y = drawBulletPoint(doc, 'Yang & Zhang (2000) - Drift Independent Volatility Estimation', y);
  y = drawBulletPoint(doc, 'Amihud, Y. (2002) - Illiquidity and Stock Returns', y);
  y = drawBulletPoint(doc, 'Lo & MacKinlay (1988) - Stock Market Prices Do Not Follow Random Walks', y);

  y = drawHighlightBox(doc, 'STRUCTURA CORE claims implementation synthesis, not theoretical novelty.', y);

  // --------------------------------------------------------------------------
  // SECTION 12: CONCLUSION
  // --------------------------------------------------------------------------
  y = drawSectionHeader(doc, '12. Conclusion', y);

  y = drawParagraph(doc, 'STRUCTURA CORE exists for traders, risk managers, and researchers who recognize a fundamental truth:', y);

  y = drawHighlightBox(doc, 'Capital should only be deployed when market structure permits it.', y);

  y = drawParagraph(doc, 'The system does not promise profits. It offers structural clarity.', y);

  y = drawParagraph(doc, 'If a market is unsuitable, STRUCTURA CORE will show it—without bias, optimism, or narrative.', y);

  y = checkPageBreak(doc, y, 40);

  // Signature block
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(50, y + 10, 110, 35, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.primary);
  doc.text('Swadesh LABS', pageWidth / 2, y + 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.silver);
  doc.text('Structural Intelligence for', pageWidth / 2, y + 34, { align: 'center' });
  doc.text('Non-Linear Markets', pageWidth / 2, y + 41, { align: 'center' });

  // Save
  doc.save('STRUCTURA_CORE_Whitepaper_v1.2.pdf');
}

export default exportWhitepaperPdf;
