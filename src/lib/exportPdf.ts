import { jsPDF } from 'jspdf';
import { ConfluenceZone, classifyRegime, RegimeClassification } from './geometry';
import { ContextualMetricsResult } from './contextualMetrics';
import { MarketStructureContextResult } from './marketStructureContext';
import { StructuralIntelligenceResult } from './structuralIntelligence';
import { PriceStats } from './priceContext';
import { AdvancedEconometricsResult } from './advancedEconometrics';
import { getInstrumentPricePrecision, InstrumentType } from './priceFormatting';
import { formatATRDisplay, classifyATR, ATRDisplayResult } from './atrFormatting';
// ═══════════════════════════════════════════════════════════════════════════
// 5-TIER HURST REGIME COLOR MAPPING
// ═══════════════════════════════════════════════════════════════════════════
function getHurstRegimeColor(tier: RegimeClassification['tier'], themeColors: typeof theme): [number, number, number] {
  switch (tier) {
    case 'strong-mean-rev':
      return themeColors.negative;
    case 'weak-mean-rev':
      return themeColors.amber;
    case 'random':
      return themeColors.neutral;
    case 'weak-trend':
      return themeColors.primary;
    case 'strong-trend':
      return themeColors.positive;
    default:
      return themeColors.neutral;
  }
}

interface AssetInfo {
  symbol: string;
  name: string;
  source: 'csv' | 'api' | 'manual';
  interval?: string;
  barCount: number;
  dateRange?: { start: string; end: string };
  instrumentType?: InstrumentType;
  displayPrecision?: number;
}

interface ExportData {
  ltp: number;
  anchor: number;
  gannLevels: { level: number; step: number; label: string }[];
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[];
  fibLevels: { level: number; ratio: number; type: 'retracement' | 'extension' }[];
  confluenceZones: ConfluenceZone[];
  hurst: number;
  atr: number;
  atrPercent: number;
  marketState: { state: string; description: string };
  assetInfo?: AssetInfo;
  contextualMetrics?: ContextualMetricsResult;
  structureContext?: MarketStructureContextResult;
  structuralIntelligence?: StructuralIntelligenceResult;
  priceStats?: PriceStats;
  sessionContext?: {
    sessionOpen: number;
    priceVsOpen: number;
  };
  timeDomain?: {
    temporalSymmetry: { status: 'active' | 'disabled'; value?: number; reason?: string };
    barNormalizedRange: { status: 'active' | 'disabled'; value?: number; reason?: string };
    temporalPriceCompressionRatio: { status: 'active' | 'disabled'; value?: number; reason?: string };
  };
  advancedEconometrics?: AdvancedEconometricsResult;
  auditMode?: boolean;
  /** Timestamp of last OHLC bar (Data Through) - MUST be from CSV, not system clock */
  dataTimestamp?: string;
  /** Report generation time (system clock) */
  reportGeneratedAt?: string;
  timestampMessage?: string;
  volumeStatus?: {
    status: 'valid' | 'partial' | 'disabled';
    message: string;
    totalBarCount?: number;
    zeroVolumePercent?: number;
  };
  dataIntegrity?: {
    isComplete: boolean;
    hasOpenPrice: boolean;
    hasVolume: boolean;
    barCount: number;
    minimumBars: number;
    missingFields: string[];
    affectedLayers: string[];
    message: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG TERMINAL COLOR SYSTEM — Institutional Grade
// ═══════════════════════════════════════════════════════════════════════════
const theme = {
  // Core backgrounds - darker for terminal feel
  black: [5, 6, 8] as [number, number, number],
  charcoal: [12, 14, 18] as [number, number, number],
  graphite: [22, 26, 32] as [number, number, number],
  slate: [35, 42, 52] as [number, number, number],

  // Accent colors - Bloomberg orange/teal
  primary: [65, 155, 137] as [number, number, number],      // Institutional Teal
  primaryBright: [80, 185, 165] as [number, number, number],
  gold: [255, 170, 50] as [number, number, number],         // Bloomberg Orange
  amber: [245, 158, 11] as [number, number, number],
  bloomberg: [255, 136, 0] as [number, number, number],     // Classic Bloomberg

  // Data visualization  
  positive: [34, 197, 94] as [number, number, number],      // Bright Green
  negative: [239, 68, 68] as [number, number, number],      // Alert Red
  neutral: [148, 163, 184] as [number, number, number],     // Slate Gray

  // Text hierarchy
  textPrimary: [248, 250, 252] as [number, number, number],
  textSecondary: [203, 213, 225] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],

  // Geometry accents
  fibonacci: [56, 189, 248] as [number, number, number],    // Sky Blue
  lattice: [251, 191, 36] as [number, number, number],      // Amber
  logarithmic: [167, 139, 250] as [number, number, number], // Violet

  // Light theme elements
  white: [255, 255, 255] as [number, number, number],
  ivory: [250, 250, 252] as [number, number, number],
  lightBorder: [226, 232, 240] as [number, number, number],
  terminalBg: [15, 18, 24] as [number, number, number],
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function checkPageBreak(doc: jsPDF, y: number, needed: number = 20): number {
  if (y + needed > 275) {
    doc.addPage();
    return 25;
  }
  return y;
}

function formatNumber(val: number, decimals: number = 2): string {
  return val.toFixed(decimals);
}

/**
 * Format a price value with instrument-aware precision.
 * Uses symbol to detect FX vs commodity and applies appropriate decimals.
 */
function formatPrice(val: number, symbol?: string): string {
  if (!Number.isFinite(val)) return '—';
  const precision = getInstrumentPricePrecision({ price: val, symbol });
  return val.toFixed(precision);
}

function formatPercent(val: number, decimals: number = 2): string {
  return `${(val * 100).toFixed(decimals)}%`;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG-STYLE PREMIUM LOGO
// ═══════════════════════════════════════════════════════════════════════════

function drawPremiumLogo(doc: jsPDF, x: number, y: number, size: number = 28): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // Outer precision ring
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(1.5);
  doc.circle(cx, cy, r - 2, 'S');

  // Inner ring with gradient effect
  doc.setDrawColor(...theme.gold);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, r * 0.65, 'S');

  // Golden spiral approximation
  doc.setDrawColor(...theme.bloomberg);
  doc.setLineWidth(0.8);

  const spiralPoints = [
    { angle: 0, radius: r * 0.18 },
    { angle: 90, radius: r * 0.29 },
    { angle: 180, radius: r * 0.47 },
    { angle: 270, radius: r * 0.76 },
  ];

  spiralPoints.forEach((pt, i) => {
    const rad = (pt.angle * Math.PI) / 180;
    const px = cx + Math.cos(rad) * pt.radius * 0.8;
    const py = cy + Math.sin(rad) * pt.radius * 0.8;

    if (i > 0) {
      const prev = spiralPoints[i - 1];
      const prevRad = (prev.angle * Math.PI) / 180;
      const prevX = cx + Math.cos(prevRad) * prev.radius * 0.8;
      const prevY = cy + Math.sin(prevRad) * prev.radius * 0.8;
      doc.line(prevX, prevY, px, py);
    }
  });

  // Terminal crosshairs
  doc.setDrawColor(...theme.textMuted);
  doc.setLineWidth(0.25);
  doc.line(cx - r * 0.4, cy, cx + r * 0.4, cy);
  doc.line(cx, cy - r * 0.4, cx, cy + r * 0.4);

  // Phi nodes
  doc.setFillColor(...theme.primary);
  doc.circle(cx + r * 0.35, cy - r * 0.2, 1.4, 'F');
  doc.circle(cx - r * 0.2, cy + r * 0.35, 1.4, 'F');

  // Center point - Bloomberg orange
  doc.setFillColor(...theme.bloomberg);
  doc.circle(cx, cy, 2, 'F');
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG TERMINAL HEADER - With Dual Timestamps (A2 Fix)
// ═══════════════════════════════════════════════════════════════════════════

interface DualTimestamps {
  generated: Date;
  dataThrough: Date | null;
  latencyMinutes: number;
}

function drawTerminalHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  timestamps: DualTimestamps,
  assetInfo?: AssetInfo,
  latencyWarning?: boolean
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark terminal header - slightly taller if latency warning
  const headerHeight = latencyWarning ? 64 : 58;
  doc.setFillColor(...theme.terminalBg);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Bloomberg-style orange accent stripe
  doc.setFillColor(...theme.bloomberg);
  doc.rect(0, headerHeight, pageWidth, 2, 'F');

  // Secondary teal accent
  doc.setFillColor(...theme.primary);
  doc.rect(0, headerHeight + 2, pageWidth, 0.5, 'F');

  // Latency warning banner if data > 30 min old
  if (latencyWarning) {
    doc.setFillColor(...theme.amber);
    doc.rect(0, headerHeight - 8, pageWidth, 8, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.black);
    doc.text('DATA DELAYED — Refresh from MT5', pageWidth / 2, headerHeight - 3, { align: 'center' });
  }

  // Logo
  drawPremiumLogo(doc, 12, 8, 32);

  // STRUCTURA branding - Bloomberg style
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  doc.text('STRUCTURA', 50, 22);

  // "Core" with orange accent
  doc.setFontSize(24);
  doc.setTextColor(...theme.bloomberg);
  doc.text('Core', 112, 22);

  // Tagline
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textSecondary);
  doc.text('Deterministic Market Structure Observatory', 50, 32);

  // Report type badge - terminal style
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(50, 38, 75, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.bloomberg);
  doc.text(title.toUpperCase(), 55, 46);

  // Asset info badge
  if (assetInfo) {
    doc.setFillColor(...theme.slate);
    doc.roundedRect(130, 38, 55, 12, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.primaryBright);
    doc.text(assetInfo.symbol, 135, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...theme.textSecondary);
    doc.text(`${assetInfo.barCount} bars`, 160, 46);
  }

  // Right side: DUAL TIMESTAMPS (A2 Fix)
  // Box 1: Generated At (report time)
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(pageWidth - 75, 8, 60, 20, 2, 2, 'F');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textMuted);
  doc.text('GENERATED', pageWidth - 70, 14);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  const genDate = timestamps.generated.toISOString().split('T')[0];
  const genTime = timestamps.generated.toISOString().split('T')[1].substring(0, 5);
  doc.text(`${genDate} ${genTime}`, pageWidth - 70, 21);

  // Box 2: Data Through (last candle time from CSV)
  doc.setFillColor(...theme.slate);
  doc.roundedRect(pageWidth - 75, 30, 60, 20, 2, 2, 'F');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textMuted);
  doc.text('DATA THROUGH', pageWidth - 70, 36);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  if (timestamps.dataThrough) {
    const dataDate = timestamps.dataThrough.toISOString().split('T')[0];
    const dataTime = timestamps.dataThrough.toISOString().split('T')[1].substring(0, 5);
    doc.setTextColor(...(latencyWarning ? theme.amber : theme.primaryBright));
    doc.text(`${dataDate} ${dataTime}`, pageWidth - 70, 43);
  } else {
    doc.setTextColor(...theme.textMuted);
    doc.text('Unavailable', pageWidth - 70, 43);
  }

  // Powered by
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textMuted);
  doc.text('SwadeshLABS', pageWidth - 15, 54, { align: 'right' });

  return latencyWarning ? 74 : 68;
}

// ═══════════════════════════════════════════════════════════════════════════
// MANDATORY DISCLAIMER - Terminal Style
// ═══════════════════════════════════════════════════════════════════════════

const mandatoryDisclaimerText =
  'STRUCTURA CORE is a deterministic market structure analysis tool. ' +
  'It does not predict price, generate trades, or estimate probabilities. ' +
  'All outputs are descriptive and derived from OHLCV data only. ' +
  'Where data is insufficient, the system refuses to speculate.';

function drawDisclaimerBlock(doc: jsPDF, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  y = checkPageBreak(doc, y, 20);

  // Terminal-style disclaimer box
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(15, y, pageWidth - 30, 18, 2, 2, 'F');

  // Warning stripe
  doc.setFillColor(...theme.amber);
  doc.rect(15, y, 4, 18, 'F');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textSecondary);
  const lines = doc.splitTextToSize(mandatoryDisclaimerText, pageWidth - 50);
  doc.text(lines, 24, y + 7);

  return y + 24;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG-STYLE SECTION HEADERS
// ═══════════════════════════════════════════════════════════════════════════

function drawSectionHeader(
  doc: jsPDF,
  title: string,
  y: number,
  subtitle?: string,
  accentColor: [number, number, number] = theme.bloomberg
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  y = checkPageBreak(doc, y, subtitle ? 22 : 18);

  // Accent bar - Bloomberg orange
  doc.setFillColor(...accentColor);
  doc.rect(15, y, 4, subtitle ? 16 : 12, 'F');

  // Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.charcoal);
  doc.text(title.toUpperCase(), 23, y + 8);

  // Horizontal rule
  doc.setDrawColor(...theme.lightBorder);
  doc.setLineWidth(0.4);
  doc.line(23, y + (subtitle ? 12 : 11), pageWidth - 15, y + (subtitle ? 12 : 11));

  if (subtitle) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.textMuted);
    doc.text(subtitle, 23, y + 17);
    return y + 22;
  }

  return y + 16;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG METRIC CARDS - Enhanced
// ═══════════════════════════════════════════════════════════════════════════

function drawMetricCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  classification?: string,
  accentColor: [number, number, number] = theme.bloomberg,
  secondaryValue?: string
): void {
  // Card with subtle shadow effect
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(x + 1, y + 1, w, h, 2, 2, 'F');

  // Main card background
  doc.setFillColor(...theme.ivory);
  doc.setDrawColor(...theme.lightBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  // Top accent stripe - contained within card with rounded top corners
  doc.setFillColor(...accentColor);
  // Draw accent as rounded rect clipped to top, then overlay main content below
  doc.roundedRect(x, y, w, 4, 2, 2, 'F');
  // Fill in the bottom corners of the accent stripe to make it rectangular at bottom
  doc.rect(x, y + 2, w, 2, 'F');

  // Label - positioned with proper spacing from accent
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textMuted);
  const labelText = label.toUpperCase();
  // Truncate label if too long for card width
  const maxLabelWidth = w - 10;
  const labelLines = doc.splitTextToSize(labelText, maxLabelWidth);
  doc.text(labelLines[0] || labelText, x + 5, y + 13);

  // Value - larger and prominent with proper vertical spacing
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  // Ensure value fits within card width
  const maxValueWidth = w - 10;
  const valueText = doc.splitTextToSize(value, maxValueWidth);
  doc.text(valueText[0] || value, x + 5, y + 25);

  // Secondary value if provided and card has enough height
  if (secondaryValue && h >= 36) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.textMuted);
    doc.text(secondaryValue, x + 5, y + 33);
  }

  // Classification badge at bottom with proper spacing
  if (classification && h >= 38) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.textSecondary);
    const classText = doc.splitTextToSize(classification, w - 10);
    doc.text(classText[0] || classification, x + 5, y + h - 4);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG DATA TABLES - Enhanced
// ═══════════════════════════════════════════════════════════════════════════

interface TableColumn {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

interface TableRow {
  cells: { value: string; color?: [number, number, number]; bold?: boolean }[];
}

function drawDataTable(
  doc: jsPDF,
  x: number,
  y: number,
  columns: TableColumn[],
  rows: TableRow[],
  options?: {
    headerBg?: [number, number, number];
    stripedRows?: boolean;
    maxRows?: number;
    compact?: boolean;
  }
): number {
  const opts = {
    headerBg: theme.graphite,
    stripedRows: true,
    maxRows: 12,
    compact: false,
    ...options
  };

  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const rowHeight = opts.compact ? 7 : 9;
  const headerHeight = opts.compact ? 9 : 11;

  const displayRows = rows.slice(0, opts.maxRows);
  const tableHeight = headerHeight + displayRows.length * rowHeight + 4;

  y = checkPageBreak(doc, y, tableHeight);

  // Table container with shadow
  doc.setFillColor(235, 238, 242);
  doc.roundedRect(x + 1, y + 1, totalWidth, tableHeight, 2, 2, 'F');

  doc.setFillColor(...theme.ivory);
  doc.setDrawColor(...theme.lightBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, totalWidth, tableHeight, 2, 2, 'FD');

  // Header row - terminal style
  doc.setFillColor(...opts.headerBg);
  doc.roundedRect(x, y, totalWidth, headerHeight, 2, 2, 'F');
  doc.rect(x, y + headerHeight - 2, totalWidth, 2, 'F');

  // Header text
  doc.setFontSize(opts.compact ? 6 : 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textSecondary);

  let colX = x;
  columns.forEach(col => {
    const textX = col.align === 'right' ? colX + col.width - 4 :
      col.align === 'center' ? colX + col.width / 2 : colX + 4;
    const align = col.align || 'left';
    doc.text(col.header.toUpperCase(), textX, y + (opts.compact ? 6 : 7), { align });
    colX += col.width;
  });

  // Data rows
  doc.setFontSize(opts.compact ? 7 : 8);
  displayRows.forEach((row, rowIndex) => {
    const rowY = y + headerHeight + rowIndex * rowHeight;

    if (opts.stripedRows && rowIndex % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(x, rowY, totalWidth, rowHeight, 'F');
    }

    colX = x;
    row.cells.forEach((cell, cellIndex) => {
      const col = columns[cellIndex];
      const textX = col.align === 'right' ? colX + col.width - 4 :
        col.align === 'center' ? colX + col.width / 2 : colX + 4;

      doc.setFont('helvetica', cell.bold ? 'bold' : 'normal');
      doc.setTextColor(...(cell.color || theme.charcoal));
      doc.text(cell.value, textX, rowY + (opts.compact ? 5 : 6), { align: col.align || 'left' });

      colX += col.width;
    });
  });

  if (rows.length > opts.maxRows) {
    doc.setFontSize(6);
    doc.setTextColor(...theme.textMuted);
    doc.text(`... and ${rows.length - opts.maxRows} additional rows`, x + 4, y + tableHeight - 2);
  }

  return y + tableHeight + 6;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOOMBERG-STYLE MINI TERMINAL BLOCK
// ═══════════════════════════════════════════════════════════════════════════

function drawTerminalBlock(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  rows: { label: string; value: string; color?: [number, number, number] }[]
): number {
  // Dark terminal background
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // Header bar
  doc.setFillColor(...theme.bloomberg);
  doc.rect(x, y, w, 12, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.black);
  doc.text(title.toUpperCase(), x + 5, y + 8);

  // Terminal rows
  doc.setFontSize(7);
  rows.forEach((row, i) => {
    const rowY = y + 18 + i * 10;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.textMuted);
    doc.text(row.label, x + 5, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(row.color || theme.textPrimary));
    doc.text(row.value, x + w - 5, rowY, { align: 'right' });
  });

  return y + h + 6;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL CONSTRAINTS - Terminal Style
// ═══════════════════════════════════════════════════════════════════════════

function drawModelConstraints(doc: jsPDF, x: number, y: number, w: number): number {
  const constraints = [
    { label: 'Data Inputs', value: 'OHLCV only' },
    { label: 'Optimization', value: 'None' },
    { label: 'Parameter Fitting', value: 'None' },
    { label: 'Lookback Windows', value: 'Fixed' },
    { label: 'Recalibration', value: 'Never' },
    { label: 'Probabilities', value: 'Not Used' },
  ];

  return drawTerminalBlock(doc, x, y, w, constraints.length * 10 + 20, 'Model Constraints', constraints);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCALE DECOMPOSITION VISUALIZATION - FIXED ALIGNMENT
// ═══════════════════════════════════════════════════════════════════════════

function drawScaleDecompositionPanel(
  doc: jsPDF,
  si: StructuralIntelligenceResult,
  x: number,
  y: number,
  w: number
): number {
  const h = 85;

  // Dark terminal background
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // Header
  doc.setFillColor(...theme.slate);
  doc.roundedRect(x, y, w, 14, 3, 3, 'F');
  doc.rect(x, y + 10, w, 4, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.gold);
  doc.text('SCALE DECOMPOSITION ENGINE', x + 6, y + 10);

  // DFA Hurst - main value
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  doc.text(`DFA Hurst: ${formatNumber(si.hurstSpectrum.overallHurst, 3)}`, x + 6, y + 28);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.primary);
  doc.text(`(${si.hurstSpectrum.classification})`, x + 65, y + 28);

  // Scale decomposition in a proper table format - FIXED ALIGNMENT
  doc.setFontSize(7);
  doc.setTextColor(...theme.textMuted);
  doc.text('Scale Decomposition:', x + 6, y + 40);

  // Draw scale values as a proper grid
  const scaleW = (w - 20) / 4;
  si.hurstSpectrum.scales.slice(0, 4).forEach((scale, i) => {
    const scaleX = x + 8 + i * scaleW;

    // Scale label
    doc.setFontSize(6);
    doc.setTextColor(...theme.textMuted);
    doc.text(`n=${scale}`, scaleX, y + 48);

    // Scale value
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.primaryBright);
    doc.text(si.hurstSpectrum.hurstValues[i]?.toFixed(3) ?? '-', scaleX, y + 55);
  });

  // HSS row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  doc.text(`Spectrum Stability (HSS): ${formatNumber(si.hurstStability.hss, 3)}`, x + 6, y + 68);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.primary);
  doc.text(`(${si.hurstStability.classification})`, x + 90, y + 68);

  // SII row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  doc.text(`Structural Integrity (SII): ${formatNumber(si.structuralIntegrity.sii, 3)}`, x + 6, y + 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.primary);
  doc.text(`(${si.structuralIntegrity.classification})`, x + 90, y + 80);

  return y + h + 6;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Build dual timestamps from export data
// ═══════════════════════════════════════════════════════════════════════════

function buildDualTimestamps(data: ExportData): { timestamps: DualTimestamps; latencyWarning: boolean } {
  const generated = data.reportGeneratedAt ? new Date(data.reportGeneratedAt) : new Date();
  const dataThrough = data.dataTimestamp ? new Date(data.dataTimestamp) : null;

  let latencyMinutes = 0;
  if (dataThrough) {
    latencyMinutes = (generated.getTime() - dataThrough.getTime()) / (60 * 1000);
  }

  // Latency warning if data > 30 minutes old
  const latencyWarning = latencyMinutes > 30;

  return {
    timestamps: { generated, dataThrough, latencyMinutes },
    latencyWarning,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK REFERENCE PAGE (Page 1) - Bloomberg Enhanced
// ═══════════════════════════════════════════════════════════════════════════

function drawQuickReference(doc: jsPDF, data: ExportData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { timestamps, latencyWarning } = buildDualTimestamps(data);

  let y = drawTerminalHeader(
    doc,
    'Quick Reference',
    'Executive Summary',
    timestamps,
    data.assetInfo,
    latencyWarning
  );

  y = drawDisclaimerBlock(doc, y);

  // ─── KEY METRICS GRID - Enhanced ───
  const cardW = (pageWidth - 50) / 4;
  const cardH = 38; // Consistent with full report

  const keyMetrics = [
    {
      label: 'Last Traded',
      value: formatNumber(data.ltp),
      class: 'Current Price',
      color: theme.bloomberg
    },
    {
      label: 'Anchor',
      value: formatNumber(data.anchor),
      class: 'Geometric Ref',
      color: theme.lattice
    },
    (() => {
      const hurstRegime = classifyRegime(data.hurst);
      return {
        label: 'Hurst Exponent',
        value: formatNumber(data.hurst, 3),
        class: hurstRegime.regime,
        color: getHurstRegimeColor(hurstRegime.tier, theme)
      };
    })(),
    // A1 FIX: ATR displayed as pips (primary) with % secondary
    (() => {
      const atrDisplay = formatATRDisplay(data.atr, data.ltp, data.assetInfo?.symbol);
      const classification = classifyATR(atrDisplay.percentValue);
      return {
        label: 'ATR (Pips)',
        value: atrDisplay.isValid ? atrDisplay.pipsFormatted : 'Calc Error',
        class: classification.label,
        color: classification.severity === 'high' ? theme.negative : classification.severity === 'low' ? theme.primary : theme.amber
      };
    })(),
  ];

  keyMetrics.forEach((m, i) => {
    drawMetricCard(doc, 15 + i * (cardW + 5), y, cardW, cardH, m.label, m.value, m.class, m.color);
  });

  y += cardH + 10;

  // ─── TWO COLUMN LAYOUT ───
  const colW = (pageWidth - 35) / 2;

  // Left: Metric Interpretation Guide - Enhanced
  y = drawSectionHeader(doc, 'Interpretation Guide', y, 'Thresholds & Classifications');

  const guideColumns: TableColumn[] = [
    { header: 'Metric', width: 32 },
    { header: 'Stable', width: 28, align: 'center' },
    { header: 'Transition', width: 32, align: 'center' },
    { header: 'Fragile', width: 28, align: 'center' },
  ];

  // 5-Tier Hurst Guide Table
  const hurstGuideColumns: TableColumn[] = [
    { header: 'Hurst Range', width: 30 },
    { header: 'Regime', width: 45 },
    { header: 'Strategy Hint', width: 45, align: 'left' },
  ];

  const hurstGuideRows: TableRow[] = [
    {
      cells: [
        { value: 'H < 0.40', bold: true },
        { value: 'Strong Mean-Rev', color: theme.negative },
        { value: 'Reversal strategies favored' }
      ]
    },
    {
      cells: [
        { value: '0.40-0.45', bold: true },
        { value: 'Weak Mean-Rev', color: theme.amber },
        { value: 'Monitor for transition' }
      ]
    },
    {
      cells: [
        { value: '0.45-0.55', bold: true },
        { value: 'Random Walk', color: theme.neutral },
        { value: 'Strategies unreliable' }
      ]
    },
    {
      cells: [
        { value: '0.55-0.60', bold: true },
        { value: 'Weak Trending', color: theme.primary },
        { value: 'Mild persistence' }
      ]
    },
    {
      cells: [
        { value: 'H > 0.60', bold: true },
        { value: 'Strong Trending', color: theme.positive },
        { value: 'Momentum favored' }
      ]
    },
  ];

  y = drawDataTable(doc, 15, y, hurstGuideColumns, hurstGuideRows, { compact: true });
  y += 8;

  // Other Metrics Interpretation Guide
  const otherGuideColumns: TableColumn[] = [
    { header: 'Metric', width: 32 },
    { header: 'Stable', width: 28, align: 'center' },
    { header: 'Transition', width: 32, align: 'center' },
    { header: 'Fragile', width: 28, align: 'center' },
  ];

  const guideRows: TableRow[] = [
    {
      cells: [
        { value: 'HSS', bold: true },
        { value: '> 0.70', color: theme.positive },
        { value: '0.40-0.70', color: theme.amber },
        { value: '< 0.40', color: theme.negative }
      ]
    },
    {
      cells: [
        { value: 'SII', bold: true },
        { value: '> 0.65', color: theme.positive },
        { value: '0.35-0.65', color: theme.amber },
        { value: '< 0.35', color: theme.negative }
      ]
    },
    {
      cells: [
        { value: 'Yang-Zhang', bold: true },
        { value: '< 15%', color: theme.positive },
        { value: '15-25%', color: theme.amber },
        { value: '> 25%', color: theme.negative }
      ]
    },
    {
      cells: [
        { value: 'Jump Ratio', bold: true },
        { value: '< 0.10', color: theme.positive },
        { value: '0.10-0.30', color: theme.amber },
        { value: '> 0.30', color: theme.negative }
      ]
    },
    {
      cells: [
        { value: 'MEC', bold: true },
        { value: '> 0.90', color: theme.positive },
        { value: '0.70-0.90', color: theme.amber },
        { value: '< 0.70', color: theme.negative }
      ]
    },
  ];

  y = drawDataTable(doc, 15, y, otherGuideColumns, guideRows, { compact: true });

  // Model Constraints - right side
  drawModelConstraints(doc, pageWidth / 2 + 2, y - 72, colW - 5);

  // ─── CURRENT STRUCTURAL STATE ───
  if (data.structuralIntelligence) {
    y = checkPageBreak(doc, y, 60);
    y = drawSectionHeader(doc, 'Current Structural State', y, 'DFA-Based Intelligence Metrics', theme.gold);

    const si = data.structuralIntelligence;

    const stateColumns: TableColumn[] = [
      { header: 'Metric', width: 60 },
      { header: 'Value', width: 30, align: 'right' },
      { header: 'Classification', width: 50 },
      { header: 'R² Valid', width: 25, align: 'center' },
    ];

    const stateRows: TableRow[] = [
      {
        cells: [
          { value: 'DFA Hurst Exponent', bold: true },
          { value: formatNumber(si.hurstSpectrum.overallHurst, 3), color: theme.bloomberg, bold: true },
          { value: si.hurstSpectrum.classification },
          { value: si.hurstSpectrum.isValid ? 'Yes' : 'No', color: si.hurstSpectrum.isValid ? theme.positive : theme.negative }
        ]
      },
      {
        cells: [
          { value: 'Hurst Spectrum Stability (HSS)', bold: true },
          { value: formatNumber(si.hurstStability.hss, 3), color: theme.bloomberg, bold: true },
          { value: si.hurstStability.classification },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Structural Integrity Index (SII)', bold: true },
          { value: formatNumber(si.structuralIntegrity.sii, 3), color: theme.bloomberg, bold: true },
          { value: si.structuralIntegrity.classification },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Lattice Compression Ratio', bold: true },
          { value: formatNumber(si.latticeCompression.lcr, 3), color: theme.bloomberg, bold: true },
          { value: si.latticeCompression.classification },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Lattice Participation (Entropy)', bold: true },
          { value: formatNumber(si.latticeParticipation.lpi, 3), color: theme.bloomberg, bold: true },
          { value: si.latticeParticipation.classification },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Anchor-Side Dominance', bold: true },
          { value: formatNumber(si.anchorDominance.asd, 3), color: theme.bloomberg, bold: true },
          { value: si.anchorDominance.dominantSide },
          { value: '-' }
        ]
      },
    ];

    y = drawDataTable(doc, 15, y, stateColumns, stateRows, { headerBg: theme.slate });
  }

  // Footer note
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...theme.textMuted);
  doc.text('This summary provides quick metric interpretation. Full structural analysis follows on subsequent pages.', pageWidth / 2, 278, { align: 'center' });
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL STRUCTURAL REPORT (Page 2+) - Bloomberg Enhanced
// ═══════════════════════════════════════════════════════════════════════════

function drawFullReport(doc: jsPDF, data: ExportData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { timestamps, latencyWarning } = buildDualTimestamps(data);

  doc.addPage();

  let y = drawTerminalHeader(
    doc,
    'Structural Analysis',
    'Complete Report',
    timestamps,
    data.assetInfo,
    latencyWarning
  );

  y = drawDisclaimerBlock(doc, y);

  // ─── MARKET STATE BANNER - Bloomberg Style ───
  doc.setFillColor(...theme.terminalBg);
  doc.roundedRect(15, y, pageWidth - 30, 32, 3, 3, 'F');

  // State badge
  doc.setFillColor(...theme.bloomberg);
  doc.roundedRect(20, y + 4, 65, 12, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.black);
  doc.text('STRUCTURAL STATE', 25, y + 12);

  // State value
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  doc.text(data.marketState.state.toUpperCase(), 92, y + 14);

  // Description
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textSecondary);
  doc.text(data.marketState.description, 20, y + 26);

  y += 40;

  // ─── STRUCTURAL ANALYSIS SUMMARY BOX ───
  // Generate context-aware summary text
  const volatilityState = data.atrPercent < 1 ? 'compressed' : data.atrPercent > 2.5 ? 'elevated' : 'moderate';
  const hurstRegimeSummary = classifyRegime(data.hurst);
  const hurstInterpretation = `${hurstRegimeSummary.regime.toLowerCase()} behavior (${hurstRegimeSummary.recommendation.split(';')[0].toLowerCase()})`;
  const pricePosition = data.priceStats ?
    ((data.ltp - data.priceStats.mean) / data.priceStats.stdDev) : 0;
  const priceContext = Math.abs(pricePosition) > 2 ? 'statistically extended' : Math.abs(pricePosition) > 1 ? 'moderately stretched' : 'near equilibrium';
  const confluenceCount = data.confluenceZones.filter(z => z.strength >= 3).length;
  const geometryNote = confluenceCount > 0 ? `${confluenceCount} high-confluence zones detected` : 'No strong confluence zones';

  // Draw summary box
  doc.setFillColor(...theme.graphite);
  doc.roundedRect(15, y, pageWidth - 30, 38, 3, 3, 'F');

  // Title
  doc.setFillColor(...theme.primary);
  doc.roundedRect(20, y + 3, 48, 10, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.black);
  doc.text('ANALYSIS CONTEXT', 24, y + 10);

  // Summary text - structured for trader comprehension
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textPrimary);
  const symbol = data.assetInfo?.symbol;
  const summaryLine1 = `Structure exhibits ${hurstInterpretation}. Volatility is ${volatilityState} (ATR: ${formatNumber(data.atrPercent)}%). Price ${priceContext}.`;
  const summaryLine2 = `${geometryNote}. Anchor reference: ${formatPrice(data.anchor, symbol)} (${((data.ltp - data.anchor) / data.anchor * 100).toFixed(2)}% from LTP).`;
  doc.text(summaryLine1, 20, y + 22);
  doc.setTextColor(...theme.textSecondary);
  doc.text(summaryLine2, 20, y + 32);

  y += 46;

  // ─── KEY METRICS ───
  y = drawSectionHeader(doc, 'Key Structural Metrics', y, 'Core Observables');

  const cardW = (pageWidth - 45) / 3;
  const cardH = 38; // Consistent card height for proper content display

  drawMetricCard(doc, 15, y, cardW, cardH, 'Last Traded Price', formatPrice(data.ltp, symbol), 'Current LTP', theme.bloomberg);
  drawMetricCard(doc, 15 + cardW + 5, y, cardW, cardH, 'Anchor Price', formatPrice(data.anchor, symbol), 'Geometric Reference', theme.lattice);
  const hurstRegimeCard = classifyRegime(data.hurst);
  drawMetricCard(doc, 15 + (cardW + 5) * 2, y, cardW, cardH, 'Hurst Exponent', formatNumber(data.hurst, 3), hurstRegimeCard.regime, getHurstRegimeColor(hurstRegimeCard.tier, theme));

  y += cardH + 5;

  // A1 FIX: ATR displayed as pips (primary) + % (secondary)
  const atrDisplay = formatATRDisplay(data.atr, data.ltp, data.assetInfo?.symbol);
  const atrClass = classifyATR(atrDisplay.percentValue);
  drawMetricCard(doc, 15, y, cardW, cardH, 'ATR (Pips)',
    atrDisplay.isValid ? atrDisplay.pipsFormatted : 'Calculation Error',
    atrDisplay.isValid ? `${atrDisplay.percentFormatted} | ${atrClass.label}` : atrDisplay.validationError ?? 'Invalid',
    atrClass.severity === 'high' ? theme.negative : theme.fibonacci);

  drawMetricCard(doc, 15 + cardW + 5, y, cardW, cardH, 'ATR %',
    atrDisplay.isValid ? atrDisplay.percentFormatted : '—',
    atrClass.label,
    atrClass.severity === 'high' ? theme.negative : atrClass.severity === 'low' ? theme.primary : theme.amber);

  if (data.priceStats) {
    drawMetricCard(doc, 15 + (cardW + 5) * 2, y, cardW, cardH, 'Std Deviation', formatNumber(data.priceStats.stdDev), 'Price Dispersion', theme.negative);
  }

  y += cardH + 10;

  // ─── TIME-DOMAIN METRICS ─── 
  // C1 FIX: Only show Time-Domain section if at least one metric is active
  // Never show 0.000 placeholders - hide disabled metrics entirely
  if (data.timeDomain) {
    const td = data.timeDomain;

    // Count active metrics
    const activeMetrics = [
      td.temporalSymmetry.status === 'active' ? td.temporalSymmetry : null,
      td.barNormalizedRange.status === 'active' ? td.barNormalizedRange : null,
      td.temporalPriceCompressionRatio.status === 'active' ? td.temporalPriceCompressionRatio : null,
    ].filter(Boolean);

    // Only render section if at least one metric is active
    if (activeMetrics.length > 0) {
      y = checkPageBreak(doc, y, 60);
      y = drawSectionHeader(doc, 'Time-Domain Metrics', y, 'Phase-1 Temporal Analysis');

      const fmt = (m: { status: 'active' | 'disabled'; value?: number }) => {
        if (m.status !== 'active') return null; // Skip disabled
        const val = m.value ?? 0;
        // Never show 0.000 unless actually zero
        return formatNumber(val, 3);
      };

      const tdCardW = (pageWidth - 45) / 3;
      const tdCardH = 38;
      let cardX = 15;

      // Only render cards for ACTIVE metrics - hide disabled entirely
      if (td.temporalSymmetry.status === 'active') {
        drawMetricCard(doc, cardX, y, tdCardW, tdCardH, 'Temporal Symmetry',
          fmt(td.temporalSymmetry) ?? '—', 'Direct OHLC Metric', theme.bloomberg);
        cardX += tdCardW + 5;
      }

      if (td.barNormalizedRange.status === 'active') {
        drawMetricCard(doc, cardX, y, tdCardW, tdCardH, 'Bar-Normalized Range',
          fmt(td.barNormalizedRange) ?? '—', 'Direct OHLC Metric', theme.bloomberg);
        cardX += tdCardW + 5;
      }

      if (td.temporalPriceCompressionRatio.status === 'active') {
        drawMetricCard(doc, cardX, y, tdCardW, tdCardH, 'Compression Ratio',
          fmt(td.temporalPriceCompressionRatio) ?? '—', 'Transform Metric', theme.bloomberg);
      }

      y += tdCardH + 10;
    } else {
      // All metrics disabled - show compact notice instead of cards
      y = checkPageBreak(doc, y, 30);
      doc.setFillColor(...theme.graphite);
      doc.roundedRect(15, y, pageWidth - 30, 18, 2, 2, 'F');
      doc.setFillColor(...theme.amber);
      doc.rect(15, y, 4, 18, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...theme.amber);
      doc.text('TIME-DOMAIN METRICS DISABLED', 24, y + 8);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...theme.textSecondary);
      doc.text('Insufficient data for temporal symmetry, bar-normalized range, and compression ratio calculations.', 24, y + 14);
      y += 24;
    }
  }

  // ─── PRICE DISTRIBUTION - Enhanced ───
  if (data.priceStats) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Price Distribution Statistics', y, 'Distributional Properties');

    const stats = data.priceStats;
    const zScore = stats.stdDev > 0 ? (data.ltp - stats.mean) / stats.stdDev : 0;

    const distColumns: TableColumn[] = [
      { header: 'Mean', width: 32, align: 'center' },
      { header: 'Median', width: 32, align: 'center' },
      { header: 'Std Dev', width: 32, align: 'center' },
      { header: 'Z-Score', width: 28, align: 'center' },
      { header: 'Skewness', width: 28, align: 'center' },
      { header: 'Kurtosis', width: 28, align: 'center' },
    ];

    const distRows: TableRow[] = [{
      cells: [
        { value: formatNumber(stats.mean), bold: true, color: theme.bloomberg },
        { value: formatNumber(stats.median), bold: true, color: theme.fibonacci },
        { value: formatNumber(stats.stdDev), bold: true, color: theme.logarithmic },
        { value: `${zScore >= 0 ? '+' : ''}${formatNumber(zScore)}`, bold: true, color: Math.abs(zScore) > 2 ? theme.negative : theme.positive },
        { value: formatNumber(stats.skewness, 3) },
        { value: formatNumber(stats.kurtosis, 3) },
      ]
    }];

    y = drawDataTable(doc, 15, y, distColumns, distRows);
  }

  // ─── CONTEXTUAL METRICS ───
  if (data.contextualMetrics) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Contextual Metrics', y, 'Efficiency & Structure');

    const cm = data.contextualMetrics;

    const ctxColumns: TableColumn[] = [
      { header: 'Metric', width: 55 },
      { header: 'Value', width: 35, align: 'right' },
      { header: 'Classification', width: 50 },
      { header: 'Method', width: 40 },
    ];

    const ctxRows: TableRow[] = [
      {
        cells: [
          { value: 'Efficiency Ratio', bold: true },
          { value: formatNumber(cm.efficiencyRatio.value, 3), color: theme.bloomberg, bold: true },
          { value: cm.efficiencyRatio.classification },
          { value: 'Direct OHLC' }
        ]
      },
      {
        cells: [
          { value: 'Diffusive Variance Ratio', bold: true },
          { value: formatNumber(cm.varianceRatio.value, 3), color: theme.bloomberg, bold: true },
          { value: cm.varianceRatio.classification },
          { value: 'Statistical' }
        ]
      },
      {
        cells: [
          { value: 'Z-Score Stretch', bold: true },
          { value: formatNumber(cm.zScoreStretch.value), color: theme.bloomberg, bold: true },
          { value: cm.zScoreStretch.classification },
          { value: 'Normalized' }
        ]
      },
      {
        cells: [
          { value: 'Session Context', bold: true },
          { value: cm.sessionContext.session, color: theme.bloomberg, bold: true },
          { value: cm.sessionContext.behavior },
          { value: 'Time-Based' }
        ]
      },
    ];

    y = drawDataTable(doc, 15, y, ctxColumns, ctxRows);
  }

  // ─── STRUCTURAL INTELLIGENCE - Fixed Panel ───
  if (data.structuralIntelligence) {
    y = checkPageBreak(doc, y, 95);
    y = drawSectionHeader(doc, 'Structural Intelligence Layer', y, 'Advanced Non-Parametric Metrics', theme.gold);

    y = drawScaleDecompositionPanel(doc, data.structuralIntelligence, 15, y, pageWidth - 30);

    // Additional Intelligence Metrics Table
    const si = data.structuralIntelligence;

    const siColumns: TableColumn[] = [
      { header: 'Metric', width: 55 },
      { header: 'Value', width: 30, align: 'right' },
      { header: 'Classification', width: 45 },
      { header: 'Components', width: 50 },
    ];

    const siRows: TableRow[] = [
      {
        cells: [
          { value: 'Lattice Compression Ratio', bold: true },
          { value: formatNumber(si.latticeCompression.lcr, 3), color: theme.bloomberg, bold: true },
          { value: si.latticeCompression.classification },
          { value: `Median: ${formatNumber(si.latticeCompression.medianSpacing, 4)}` }
        ]
      },
      {
        cells: [
          { value: 'Lattice Participation Index', bold: true },
          { value: formatNumber(si.latticeParticipation.lpi, 3), color: theme.bloomberg, bold: true },
          { value: si.latticeParticipation.classification },
          { value: `LPI Norm: ${formatNumber(si.latticeParticipation.normalizedLpi, 3)}` }
        ]
      },
      {
        cells: [
          { value: 'Anchor-Side Dominance', bold: true },
          { value: formatNumber(si.anchorDominance.asd, 3), color: theme.bloomberg, bold: true },
          { value: si.anchorDominance.dominantSide },
          { value: `H+: ${formatNumber(si.anchorDominance.hurstAbove, 2)}` }
        ]
      },
      {
        cells: [
          { value: 'Structural Resonance', bold: true },
          { value: formatNumber(si.structuralResonance.power, 3), color: theme.bloomberg, bold: true },
          { value: si.structuralResonance.classification },
          { value: `Scale: ${si.structuralResonance.dominantScale}` }
        ]
      },
    ];

    y = drawDataTable(doc, 15, y, siColumns, siRows, { headerBg: theme.slate });
  }

  // ─── ADVANCED ECONOMETRICS ───
  if (data.advancedEconometrics) {
    const ae = data.advancedEconometrics;

    // Volatility Estimators
    y = checkPageBreak(doc, y, 55);
    y = drawSectionHeader(doc, 'Advanced Volatility Estimators', y, 'High-Frequency-Inspired OHLC Estimators');

    const ve = ae.volatilityEstimators;

    const volColumns: TableColumn[] = [
      { header: 'Estimator', width: 42 },
      { header: 'Daily', width: 32, align: 'right' },
      { header: 'Annualized', width: 35, align: 'right' },
      { header: 'Type', width: 38 },
      { header: 'Validation', width: 33, align: 'center' },
    ];

    const annualize = (v: number) => formatPercent(v * Math.sqrt(252));

    const volRows: TableRow[] = [
      {
        cells: [
          { value: 'Parkinson', bold: true },
          { value: formatPercent(ve.parkinson), color: theme.bloomberg, bold: true },
          { value: annualize(ve.parkinson) },
          { value: 'Range-Based' },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Garman-Klass', bold: true },
          { value: formatPercent(ve.garmanKlass), color: theme.bloomberg, bold: true },
          { value: annualize(ve.garmanKlass) },
          { value: 'OHLC Combined' },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Rogers-Satchell', bold: true },
          { value: formatPercent(ve.rogersSatchell), color: theme.bloomberg, bold: true },
          { value: annualize(ve.rogersSatchell) },
          { value: 'Drift-Adjusted' },
          { value: '-' }
        ]
      },
      {
        cells: [
          { value: 'Yang-Zhang', bold: true },
          { value: formatPercent(ve.yangZhang), color: theme.gold, bold: true },
          { value: annualize(ve.yangZhang) },
          { value: 'Jump-Robust' },
          { value: formatNumber(ve.validationRatio, 3) }
        ]
      },
    ];

    y = drawDataTable(doc, 15, y, volColumns, volRows, { headerBg: theme.slate });

    // Classification
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.charcoal);
    doc.text(`Volatility Classification: ${ve.classification}`, 20, y - 2);
    y += 6;

    // Liquidity Proxies - Enhanced
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Liquidity Proxies', y, 'Volume-Free Spread & Illiquidity Estimators');

    const roll = ae.rollSpread;
    const cs = ae.corwinSchultzSpread;
    const amihud = ae.amihudIlliquidity;

    const liqColumns: TableColumn[] = [
      { header: 'Estimator', width: 50 },
      { header: 'Value', width: 40, align: 'right' },
      { header: 'Status', width: 35, align: 'center' },
      { header: 'Classification', width: 40 },
      { header: 'Method', width: 35 },
    ];

    const liqRows: TableRow[] = [
      {
        cells: [
          { value: "Roll's Effective Spread", bold: true },
          { value: roll.isValid ? formatPercent(roll.effectiveSpread, 4) : 'N/A', color: roll.isValid ? theme.bloomberg : theme.textMuted, bold: true },
          { value: roll.isValid ? 'Valid' : 'Invalid', color: roll.isValid ? theme.positive : theme.negative },
          { value: '-' },
          { value: 'Covariance' }
        ]
      },
      {
        cells: [
          { value: 'Corwin-Schultz Spread', bold: true },
          { value: cs.isValid ? formatPercent(cs.bidAskSpread, 4) : 'N/A', color: cs.isValid ? theme.bloomberg : theme.textMuted, bold: true },
          { value: cs.isValid ? 'Valid' : 'Invalid', color: cs.isValid ? theme.positive : theme.negative },
          { value: '-' },
          { value: 'High-Low' }
        ]
      },
      {
        cells: [
          { value: 'Amihud Illiquidity', bold: true },
          { value: amihud.illiquidityRatio.toFixed(6), color: theme.bloomberg, bold: true },
          { value: 'Valid', color: theme.positive },
          { value: amihud.classification },
          { value: 'Price Impact' }
        ]
      },
    ];

    y = drawDataTable(doc, 15, y, liqColumns, liqRows);

    // Jump Detection - Enhanced
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Jump Detection', y, 'Barndorff-Nielsen & Shephard Framework');

    const jd = ae.jumpDetection;

    const jumpColumns: TableColumn[] = [
      { header: 'Bipower Var', width: 35, align: 'center' },
      { header: 'Realized Var', width: 35, align: 'center' },
      { header: 'Jump Ratio', width: 30, align: 'center' },
      { header: 'Detected', width: 28, align: 'center' },
      { header: 'Intensity', width: 30, align: 'center' },
      { header: 'Classification', width: 38, align: 'center' },
    ];

    const jumpRows: TableRow[] = [{
      cells: [
        { value: jd.bipowerVariation.toFixed(6), bold: true },
        { value: jd.realizedVariance.toFixed(6), bold: true },
        { value: formatNumber(jd.jumpRatio, 3), bold: true, color: jd.jumpRatio > 0.3 ? theme.negative : theme.positive },
        { value: jd.hasSignificantJump ? 'YES' : 'NO', bold: true, color: jd.hasSignificantJump ? theme.negative : theme.positive },
        { value: formatNumber(jd.jumpIntensity, 3), bold: true },
        { value: jd.classification, bold: true },
      ]
    }];

    y = drawDataTable(doc, 15, y, jumpColumns, jumpRows);

    // Regime Detection - Enhanced
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Regime Detection', y, 'Volatility State & Structural Breaks');

    const vr = ae.volatilityRegime;
    const cusum = ae.cusum;

    const regimeColumns: TableColumn[] = [
      { header: 'Current Regime', width: 40, align: 'center' },
      { header: 'Probability', width: 32, align: 'center' },
      { header: 'Low-Vol Mean', width: 35, align: 'center' },
      { header: 'Max CUSUM', width: 35, align: 'center' },
      { header: 'Structural Break', width: 45, align: 'center' },
    ];

    const regimeColor = vr.currentRegime === 'Low-Vol' ? theme.positive : theme.negative;
    const breakColor = cusum.hasStructuralBreak ? theme.negative : theme.positive;

    const regimeRows: TableRow[] = [{
      cells: [
        { value: vr.currentRegime.toUpperCase(), bold: true, color: regimeColor },
        { value: formatPercent(vr.regimeProbability), bold: true },
        { value: formatPercent(vr.lowVolMean, 4), bold: true },
        { value: formatNumber(cusum.maxCusum, 3), bold: true },
        { value: cusum.hasStructuralBreak ? 'DETECTED' : 'NONE', bold: true, color: breakColor },
      ]
    }];

    y = drawDataTable(doc, 15, y, regimeColumns, regimeRows);

    // Market Efficiency - Enhanced
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Market Efficiency', y, 'Informational Efficiency Metrics');

    const me = ae.marketEfficiency;
    const acn = ae.autocorrelationNoise;
    const md = ae.martingaleDifference;

    const effColumns: TableColumn[] = [
      { header: 'MEC', width: 35, align: 'center' },
      { header: 'Classification', width: 40, align: 'center' },
      { header: 'Autocorr (rho1)', width: 40, align: 'center' },
      { header: 'Noise/Signal', width: 40, align: 'center' },
      { header: 'Martingale', width: 35, align: 'center' },
    ];

    const effRows: TableRow[] = [{
      cells: [
        { value: formatNumber(me.mec, 3), bold: true, color: theme.bloomberg },
        { value: me.classification, bold: true },
        { value: formatNumber(acn.rho1, 4), bold: true },
        { value: formatNumber(acn.noiseSignalRatio, 4), bold: true },
        { value: md.isEfficient ? 'Efficient' : 'Inefficient', bold: true, color: md.isEfficient ? theme.positive : theme.negative },
      ]
    }];

    y = drawDataTable(doc, 15, y, effColumns, effRows);

    // Econometrics Summary - Enhanced with Terminal Block
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Econometrics Summary', y, 'Composite Assessment', theme.gold);

    const summary = ae.summary;

    const summaryCardW = (pageWidth - 45) / 3;

    const getSummaryColor = (val: string): [number, number, number] => {
      if (['High', 'Efficient', 'Stable'].includes(val)) return theme.positive;
      if (['Low', 'Inefficient', 'Volatile'].includes(val)) return theme.negative;
      return theme.amber;
    };

    drawMetricCard(doc, 15, y, summaryCardW, 32, 'Overall Liquidity', summary.overallLiquidity, 'Composite Score', getSummaryColor(summary.overallLiquidity));
    drawMetricCard(doc, 15 + summaryCardW + 5, y, summaryCardW, 32, 'Market Efficiency', summary.overallEfficiency, 'Composite Score', getSummaryColor(summary.overallEfficiency));
    drawMetricCard(doc, 15 + (summaryCardW + 5) * 2, y, summaryCardW, 32, 'Regime Stability', summary.regimeStability, 'Composite Score', getSummaryColor(summary.regimeStability));

    y += 40;
  }

  // ─── CONFLUENCE ZONES ───
  const highConfluence = data.confluenceZones.filter(z => z.strength >= 2);

  y = checkPageBreak(doc, y, 60);
  y = drawSectionHeader(doc, `High Confluence Zones (${highConfluence.length})`, y, 'Geometric Level Convergence');

  if (highConfluence.length > 0) {
    const confColumns: TableColumn[] = [
      { header: 'Strength', width: 28, align: 'center' },
      { header: 'Price Level', width: 42, align: 'right' },
      { header: 'Distance from LTP', width: 45, align: 'right' },
      { header: 'Sources', width: 70 },
    ];

    const confRows: TableRow[] = highConfluence.slice(0, 8).map(zone => {
      const sources = zone.levels.map(l => l.source).filter((v, idx, a) => a.indexOf(v) === idx).join(', ');
      const distance = ((zone.centerPrice - data.ltp) / data.ltp) * 100;
      return {
        cells: [
          { value: `${zone.strength}x`, bold: true, color: zone.strength >= 3 ? theme.positive : theme.amber },
          { value: formatPrice(zone.centerPrice, data.assetInfo?.symbol), bold: true, color: theme.bloomberg },
          { value: `${distance >= 0 ? '+' : ''}${formatNumber(distance)}%`, color: distance > 0 ? theme.positive : theme.negative },
          { value: sources }
        ]
      };
    });

    y = drawDataTable(doc, 15, y, confColumns, confRows);
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...theme.textMuted);
    doc.text('No high confluence zones detected in current structure', 20, y + 8);
    y += 15;
  }

  // ─── GEOMETRY LEVELS TABLES ───
  const sym = data.assetInfo?.symbol;
  y = drawGeometryTable(doc, 'Square-Root Lattice Levels',
    data.gannLevels.map(l => ({ price: formatPrice(l.level, sym), detail: l.label, distance: ((l.level - data.ltp) / data.ltp * 100) })),
    theme.lattice, y, data.ltp);

  y = drawGeometryTable(doc, 'Fibonacci Sequence Levels',
    data.fibLevels.map(l => ({ price: formatPrice(l.level, sym), detail: `${(l.ratio * 100).toFixed(1)}% ${l.type}`, distance: ((l.level - data.ltp) / data.ltp * 100) })),
    theme.fibonacci, y, data.ltp);

  y = drawGeometryTable(doc, 'Logarithmic Sequence Levels',
    data.logLevels.map(l => ({ price: formatPrice(l.level, sym), detail: `${l.percent}% ${l.direction}`, distance: ((l.level - data.ltp) / data.ltp * 100) })),
    theme.logarithmic, y, data.ltp);
}

function drawGeometryTable(
  doc: jsPDF,
  title: string,
  levels: { price: string; detail: string; distance: number }[],
  color: [number, number, number],
  y: number,
  ltp: number
): number {
  y = checkPageBreak(doc, y, 50);
  y = drawSectionHeader(doc, title, y, undefined, color);

  const columns: TableColumn[] = [
    { header: 'Price Level', width: 50, align: 'right' },
    { header: 'Distance', width: 40, align: 'right' },
    { header: 'Geometric Detail', width: 90 },
  ];

  const rows: TableRow[] = levels.slice(0, 8).map(l => ({
    cells: [
      { value: l.price, bold: true, color },
      { value: `${l.distance >= 0 ? '+' : ''}${l.distance.toFixed(2)}%`, color: l.distance > 0 ? theme.positive : theme.negative },
      { value: l.detail }
    ]
  }));

  return drawDataTable(doc, 15, y, columns, rows, { maxRows: 8 });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SELF-CHECK PAGE - Enhanced
// ═══════════════════════════════════════════════════════════════════════════

function drawExportSelfCheckPage(doc: jsPDF, data: ExportData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { timestamps, latencyWarning } = buildDualTimestamps(data);

  doc.addPage();

  let y = drawTerminalHeader(doc, 'Export Self-Check', 'Audit Summary', timestamps, data.assetInfo, latencyWarning);

  y = drawDisclaimerBlock(doc, y);

  // Export Inputs
  y = drawSectionHeader(doc, 'Export Inputs', y, 'Dataset and timestamp used for this report');

  const integrity = data.dataIntegrity;
  const volume = data.volumeStatus;

  const inputColumns: TableColumn[] = [
    { header: 'Parameter', width: 60 },
    { header: 'Value', width: 80 },
    { header: 'Status', width: 40, align: 'center' },
  ];

  const inputRows: TableRow[] = [
    {
      cells: [
        { value: 'Data Timestamp (max)', bold: true },
        { value: data.dataTimestamp ? new Date(data.dataTimestamp).toISOString() : 'Unavailable' },
        { value: data.dataTimestamp ? 'OK' : 'N/A', color: data.dataTimestamp ? theme.positive : theme.textMuted }
      ]
    },
    {
      cells: [
        { value: 'Bars (reported)', bold: true },
        { value: String(data.assetInfo?.barCount ?? integrity?.barCount ?? '-') },
        { value: (data.assetInfo?.barCount ?? 0) >= 50 ? 'OK' : 'LOW', color: (data.assetInfo?.barCount ?? 0) >= 50 ? theme.positive : theme.amber }
      ]
    },
    {
      cells: [
        { value: 'Minimum Bars Rule', bold: true },
        { value: String(integrity?.minimumBars ?? 50) },
        { value: '-' }
      ]
    },
    {
      cells: [
        { value: 'Open Price', bold: true },
        { value: integrity?.hasOpenPrice ? 'AVAILABLE' : 'MISSING' },
        { value: integrity?.hasOpenPrice ? 'OK' : 'WARN', color: integrity?.hasOpenPrice === false ? theme.negative : theme.positive }
      ]
    },
    {
      cells: [
        { value: 'Volume Availability', bold: true },
        { value: (volume?.status ?? '-').toUpperCase() },
        { value: volume?.status === 'valid' ? 'OK' : volume?.status === 'partial' ? 'PARTIAL' : 'N/A', color: volume?.status === 'disabled' ? theme.negative : volume?.status === 'partial' ? theme.amber : theme.positive }
      ]
    },
  ];

  y = drawDataTable(doc, 15, y, inputColumns, inputRows);

  if (volume?.message) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.textMuted);
    const vLines = doc.splitTextToSize(volume.message, pageWidth - 40);
    doc.text(vLines, 20, y);
    y += vLines.length * 4 + 8;
  }

  // Disabled Layers
  y = drawSectionHeader(doc, 'Disabled Layers', y, 'Classes and components disabled due to data constraints');

  const disabledItems: { label: string; reason: string }[] = [];

  if (volume?.status === 'disabled') {
    disabledItems.push({
      label: 'CLASS C (Auction / Volume Metrics)',
      reason: volume.message || 'DISABLED - Volume data unavailable',
    });
  }

  if (data.timeDomain) {
    const td = data.timeDomain;
    if (td.temporalSymmetry.status === 'disabled') {
      disabledItems.push({ label: 'Temporal Symmetry', reason: td.temporalSymmetry.reason || 'Constraint not met' });
    }
    if (td.barNormalizedRange.status === 'disabled') {
      disabledItems.push({ label: 'Bar-Normalized Range', reason: td.barNormalizedRange.reason || 'Constraint not met' });
    }
    if (td.temporalPriceCompressionRatio.status === 'disabled') {
      disabledItems.push({ label: 'Temporal-Price Compression', reason: td.temporalPriceCompressionRatio.reason || 'Constraint not met' });
    }
  }

  if (integrity?.missingFields?.length) {
    disabledItems.push({ label: 'Data Contract', reason: integrity.message });
  }

  if (disabledItems.length === 0) {
    doc.setFillColor(...theme.terminalBg);
    doc.roundedRect(15, y, pageWidth - 30, 20, 3, 3, 'F');

    // Green indicator
    doc.setFillColor(...theme.positive);
    doc.rect(15, y, 4, 20, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.positive);
    doc.text('ALL LAYERS ACTIVE', 25, y + 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...theme.textSecondary);
    doc.text('No layers disabled for this dataset.', 25, y + 16);
    y += 28;
  } else {
    const disabledColumns: TableColumn[] = [
      { header: 'Layer', width: 70 },
      { header: 'Reason', width: 110 },
    ];

    const disabledRows: TableRow[] = disabledItems.map(item => ({
      cells: [
        { value: item.label, bold: true, color: theme.negative },
        { value: item.reason }
      ]
    }));

    y = drawDataTable(doc, 15, y, disabledColumns, disabledRows);
  }

  // ─── SRL METHODOLOGY TRANSPARENCY (C2 FIX) ───
  y = checkPageBreak(doc, y, 80);
  y = drawSectionHeader(doc, 'SRL Methodology', y, 'Square-Root Lattice Formula Documentation', theme.lattice);

  // Formula box
  doc.setFillColor(...theme.terminalBg);
  doc.roundedRect(15, y, pageWidth - 30, 55, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.lattice);
  doc.text('SQUARE-ROOT LATTICE (SRL) LEVEL FORMULA:', 20, y + 10);

  // Main formula
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...theme.textPrimary);
  doc.text('SRL(n) = (sqrt(P_anchor) + n)^2', 20, y + 22);

  // Explanation
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...theme.textSecondary);
  doc.text('Where:', 20, y + 32);
  doc.text('  P_anchor = Anchor price (geometric reference point)', 28, y + 38);
  doc.text('  n = Step value (integer or fractional: -4, -3, ..., -0.5, +0.5, ..., +3, +4)', 28, y + 44);

  // FX Normalization note
  doc.setFontSize(6);
  doc.setTextColor(...theme.textMuted);
  doc.text('FX Normalization: For instruments with tight decimal pricing (e.g., EUR/USD), calculations use integer-space math:', 20, y + 52);
  doc.text('  P_int = P * 10^decimals --> SRL_int = (sqrt(P_int) + n)^2 --> SRL = SRL_int / 10^decimals', 28, y + 58);

  y += 62;

  // Tier explanation table
  const tierColumns: TableColumn[] = [
    { header: 'Tier', width: 25, align: 'center' },
    { header: 'Steps', width: 45 },
    { header: 'Description', width: 90 },
  ];

  const tierRows: TableRow[] = [
    {
      cells: [
        { value: '1', bold: true, color: theme.lattice },
        { value: 'n = +-0.25, +-0.5' },
        { value: 'Immediate structural levels (closest to anchor)' }
      ]
    },
    {
      cells: [
        { value: '2', bold: true, color: theme.lattice },
        { value: 'n = +-1' },
        { value: 'Primary support/resistance levels' }
      ]
    },
    {
      cells: [
        { value: '3', bold: true, color: theme.lattice },
        { value: 'n = +-1.5' },
        { value: 'Secondary structural levels' }
      ]
    },
    {
      cells: [
        { value: '4', bold: true, color: theme.lattice },
        { value: 'n = +-2' },
        { value: 'Extended structural levels' }
      ]
    },
    {
      cells: [
        { value: '5', bold: true, color: theme.lattice },
        { value: 'n = +-3, +-4' },
        { value: 'Major structural boundaries (extreme moves)' }
      ]
    },
  ];

  y = drawDataTable(doc, 15, y, tierColumns, tierRows, { compact: true });

  // Model Constraints reminder
  y = checkPageBreak(doc, y, 80);
  drawModelConstraints(doc, 15, y, pageWidth - 30);
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE FOOTER - Bloomberg Style
// ═══════════════════════════════════════════════════════════════════════════

function drawPageFooters(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    // Footer bar
    doc.setFillColor(...theme.graphite);
    doc.rect(0, 280, pageWidth, 17, 'F');

    // Orange accent
    doc.setFillColor(...theme.bloomberg);
    doc.rect(0, 280, pageWidth, 1, 'F');

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(...theme.textSecondary);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth / 2, 289, { align: 'center' });

    // Branding
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.bloomberg);
    doc.text('STRUCTURA', 15, 289);
    doc.setTextColor(...theme.primary);
    doc.text('Core', 42, 289);

    // Mathematical identity
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...theme.textMuted);
    doc.text('phi^2 = phi + 1', pageWidth - 15, 289, { align: 'right' });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function exportAnalysisPdf(data: ExportData) {
  const doc = new jsPDF();

  // Page 1: Quick Reference Summary
  drawQuickReference(doc, data);

  // Page 2+: Full Structural Report
  drawFullReport(doc, data);

  // Final Page: Export Self-Check
  drawExportSelfCheckPage(doc, data);

  // Add footers to all pages
  drawPageFooters(doc);

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const symbol = data.assetInfo?.symbol || 'analysis';
  doc.save(`structura-core-${symbol.toLowerCase()}-${timestamp}.pdf`);
}
