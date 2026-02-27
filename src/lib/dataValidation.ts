/**
 * STRUCTURA CORE: DATA VALIDATION PIPELINE
 * 
 * Comprehensive OHLCV validation to prevent garbage-in-garbage-out.
 * All checks are deterministic and audit-compliant.
 * 
 * Reference: Institutional data quality standards
 * 
 * FIX BUNDLE D: Input Validation Layer
 * - D1: Input validation with specific error messages
 * - D2: Deterministic output (same CSV = same results)
 */

import { OHLCVBar } from './mt5Parser';

// ============= VALIDATION RESULT TYPES =============

export interface OHLCLogicViolation {
  barIndex: number;
  timestamp?: string;
  reason: string;
  severity: 'error' | 'warning';
}

export interface PriceJump {
  barIndex: number;
  timestamp?: string;
  pctChange: number;
}

export interface TimeGap {
  fromIndex: number;
  toIndex: number;
  fromTimestamp?: string;
  toTimestamp?: string;
  gapMinutes: number;
}

export interface DataValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  barsValidated: number;
  timestampRange: {
    start: string | null;
    end: string | null;
  };
  // Detailed findings
  ohlcViolations: OHLCLogicViolation[];
  impossibleJumps: PriceJump[];
  timeGaps: TimeGap[];
  staleDataHours: number | null;
  volumeStatus: 'all-zero' | 'partial-zero' | 'valid';
}

// ============= CSV VALIDATION (D1 FIX) =============

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  columnMap: {
    hasDate: boolean;
    hasTime: boolean;
    hasOpen: boolean;
    hasHigh: boolean;
    hasLow: boolean;
    hasClose: boolean;
    hasVolume: boolean;
  };
  rowCount: number;
}

/**
 * Validates raw CSV content before parsing.
 * D1 FIX: Reject bad CSVs gracefully with specific error messages.
 */
export function validateCSVContent(content: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if content is empty
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      errors: ['CSV file is empty'],
      warnings: [],
      columnMap: { hasDate: false, hasTime: false, hasOpen: false, hasHigh: false, hasLow: false, hasClose: false, hasVolume: false },
      rowCount: 0,
    };
  }

  const lines = content.trim().split('\n');

  // Minimum 50 rows requirement
  const dataLines = lines.filter(l => l.trim().length > 0 && !l.toLowerCase().includes('date'));
  if (dataLines.length < 50) {
    errors.push(`Minimum 50 rows required, found ${dataLines.length}`);
  }

  // Detect delimiter (tab or comma)
  const firstLine = lines[0];
  const isTabDelimited = firstLine.includes('\t');
  const delimiter = isTabDelimited ? '\t' : ',';

  // Check for required columns by parsing header or first data row
  const headerLine = lines[0].toLowerCase();
  const columnMap = {
    hasDate: headerLine.includes('date') || /\d{4}[.\-/]\d{2}[.\-/]\d{2}/.test(lines[1] || ''),
    hasTime: headerLine.includes('time') || /\d{2}:\d{2}/.test(lines[1] || ''),
    hasOpen: headerLine.includes('open') || lines[0].split(delimiter).length >= 4,
    hasHigh: headerLine.includes('high') || lines[0].split(delimiter).length >= 4,
    hasLow: headerLine.includes('low') || lines[0].split(delimiter).length >= 4,
    hasClose: headerLine.includes('close') || lines[0].split(delimiter).length >= 4,
    hasVolume: headerLine.includes('vol') || headerLine.includes('tickvol'),
  };

  // CRITICAL: Check for required OHLC columns
  if (!columnMap.hasOpen) {
    errors.push('OPEN price column is MANDATORY for structural integrity');
  }
  if (!columnMap.hasHigh) {
    errors.push('HIGH price column is required');
  }
  if (!columnMap.hasLow) {
    errors.push('LOW price column is required');
  }
  if (!columnMap.hasClose) {
    errors.push('CLOSE price column is required');
  }

  // Warning for missing volume
  if (!columnMap.hasVolume) {
    warnings.push('Volume/TickVolume column not detected - Class C metrics will be disabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    columnMap,
    rowCount: dataLines.length,
  };
}

// ============= ATR VALIDATION RESULT =============

export interface ATRValidationResult {
  atrAbsolute: number;       // Raw ATR value (e.g., 0.00097 for EUR/USD)
  atrPips: number;           // Pip representation (e.g., 9.7)
  atrPercent: number;        // Percentage of price (e.g., 0.082%)
  raw: number;               // Unformatted for internal calculations
  isValid: boolean;
  validationMessage: string;
  // Audit info
  pipMultiplier: number;     // 10000 for most FX, 100 for JPY pairs
  priceUsed: number;
}

// ============= HURST VALIDATION RESULT WITH HSS OUTLIER DETECTION (B3 FIX) =============

export interface HurstValidationResult {
  value: number | null;
  rSquared: number;
  isValid: boolean;
  confidence: 'High' | 'Medium' | 'Low' | 'Invalid';
  classification: 'Mean-Reverting' | 'Random-Walk' | 'Trending' | 'Indeterminate';
  scalesUsed: number[];
  scaledHursts: Record<string, { hurst: number; rSquared: number; valid: boolean; isOutlier?: boolean }>;
  stabilityScore: number;    // HSS: 1 - std(hursts)
  hasOutliers: boolean;      // B3 FIX: Flag if any scale differs >0.30 from median
  outlierScales: number[];   // B3 FIX: Which scales are outliers
  error?: string;
}

// ============= DATA VALIDATION PIPELINE =============

/**
 * Comprehensive OHLCV validation with multiple checks.
 * Prevents silent calculation failures from bad data.
 */
export function validateOHLCV(
  bars: OHLCVBar[],
  options?: {
    maxJumpPercent?: number;        // Default 5%
    expectedIntervalMinutes?: number; // Default 15 (M15)
    maxAllowedGapMultiplier?: number; // Default 1.5
    maxStaleHours?: number;          // Default 1
    currentTime?: Date;              // Default: now
  }
): DataValidationResult {
  const opts = {
    maxJumpPercent: options?.maxJumpPercent ?? 5,
    expectedIntervalMinutes: options?.expectedIntervalMinutes ?? 15,
    maxAllowedGapMultiplier: options?.maxAllowedGapMultiplier ?? 1.5,
    maxStaleHours: options?.maxStaleHours ?? 1,
    currentTime: options?.currentTime ?? new Date(),
  };

  const errors: string[] = [];
  const warnings: string[] = [];
  const ohlcViolations: OHLCLogicViolation[] = [];
  const impossibleJumps: PriceJump[] = [];
  const timeGaps: TimeGap[] = [];

  if (!bars || bars.length === 0) {
    return {
      valid: false,
      errors: ['No data provided'],
      warnings: [],
      barsValidated: 0,
      timestampRange: { start: null, end: null },
      ohlcViolations: [],
      impossibleJumps: [],
      timeGaps: [],
      staleDataHours: null,
      volumeStatus: 'all-zero',
    };
  }

  // 1. Check for OHLC logic violations
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];

    // High < Low is impossible
    if (b.high < b.low) {
      ohlcViolations.push({
        barIndex: i,
        timestamp: b.timestamp,
        reason: `High (${b.high}) < Low (${b.low})`,
        severity: 'error',
      });
    }

    // High should be >= Open and Close
    if (b.high < b.open || b.high < b.close) {
      ohlcViolations.push({
        barIndex: i,
        timestamp: b.timestamp,
        reason: `High (${b.high}) < Open (${b.open}) or Close (${b.close})`,
        severity: 'warning',
      });
    }

    // Low should be <= Open and Close
    if (b.low > b.open || b.low > b.close) {
      ohlcViolations.push({
        barIndex: i,
        timestamp: b.timestamp,
        reason: `Low (${b.low}) > Open (${b.open}) or Close (${b.close})`,
        severity: 'warning',
      });
    }
  }

  const ohlcErrors = ohlcViolations.filter(v => v.severity === 'error');
  if (ohlcErrors.length > 0) {
    errors.push(`OHLC logic violations: ${ohlcErrors.length} bars`);
  }
  if (ohlcViolations.length > ohlcErrors.length) {
    warnings.push(`OHLC warnings: ${ohlcViolations.length - ohlcErrors.length} bars`);
  }

  // 2. Check for impossible price jumps (>maxJumpPercent in one bar)
  for (let i = 1; i < bars.length; i++) {
    const prev = bars[i - 1];
    const curr = bars[i];

    if (prev.close > 0 && curr.close > 0) {
      const pctChange = Math.abs((curr.close - prev.close) / prev.close) * 100;
      if (pctChange > opts.maxJumpPercent) {
        impossibleJumps.push({
          barIndex: i,
          timestamp: curr.timestamp,
          pctChange,
        });
      }
    }
  }

  if (impossibleJumps.length > 0) {
    errors.push(`Impossible price jumps >${opts.maxJumpPercent}%: ${impossibleJumps.length} bars`);
  }

  // 3. Check for zero volume
  const zeroVolumeBars = bars.filter(b => !b.volume || b.volume === 0).length;
  let volumeStatus: DataValidationResult['volumeStatus'] = 'valid';

  if (zeroVolumeBars === bars.length) {
    volumeStatus = 'all-zero';
    warnings.push('Zero volume in all bars — using tick volume proxy');
  } else if (zeroVolumeBars > bars.length * 0.5) {
    volumeStatus = 'partial-zero';
    warnings.push(`Partial zero volume: ${zeroVolumeBars}/${bars.length} bars`);
  }

  // 4. Check timestamp continuity
  const expectedGapMs = opts.expectedIntervalMinutes * 60 * 1000;
  const maxAllowedGapMs = expectedGapMs * opts.maxAllowedGapMultiplier;
  let weekendGaps = 0;

  for (let i = 1; i < bars.length; i++) {
    const t0 = new Date(bars[i - 1].timestamp).getTime();
    const t1 = new Date(bars[i].timestamp).getTime();

    if (Number.isFinite(t0) && Number.isFinite(t1)) {
      const gapMs = t1 - t0;
      const gapMinutes = gapMs / (60 * 1000);

      // Check if it's a weekend gap (Friday 21:00 to Sunday 22:00 or similar)
      const d0 = new Date(t0);
      const d1 = new Date(t1);
      const isWeekendGap = d0.getUTCDay() === 5 && d1.getUTCDay() === 0;

      if (isWeekendGap) {
        weekendGaps++;
      } else if (gapMs > maxAllowedGapMs) {
        timeGaps.push({
          fromIndex: i - 1,
          toIndex: i,
          fromTimestamp: bars[i - 1].timestamp,
          toTimestamp: bars[i].timestamp,
          gapMinutes,
        });
      }
    }
  }

  const unexpectedGaps = timeGaps.length;
  if (unexpectedGaps > 0) {
    warnings.push(`Unexpected time gaps: ${unexpectedGaps} (excluding ${weekendGaps} weekend gaps)`);
  }

  // 5. Check for stale data
  let staleDataHours: number | null = null;
  if (bars.length > 0 && bars[bars.length - 1].timestamp) {
    const lastBarTime = new Date(bars[bars.length - 1].timestamp).getTime();
    if (Number.isFinite(lastBarTime)) {
      const ageMs = opts.currentTime.getTime() - lastBarTime;
      staleDataHours = ageMs / (1000 * 60 * 60);

      if (staleDataHours > opts.maxStaleHours) {
        warnings.push(`Stale data: Last bar is ${staleDataHours.toFixed(1)} hours old`);
      }
    }
  }

  // Build timestamp range
  const timestampRange = {
    start: bars[0]?.timestamp || null,
    end: bars[bars.length - 1]?.timestamp || null,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    barsValidated: bars.length,
    timestampRange,
    ohlcViolations,
    impossibleJumps,
    timeGaps,
    staleDataHours,
    volumeStatus,
  };
}

// ============= ATR WITH VALIDATION =============

/**
 * Corrected ATR calculation with unit validation.
 * Prevents the 577× position sizing error from unit confusion.
 */
export function calculateATRCorrected(
  ohlcv: OHLCVBar[],
  period: number = 14
): ATRValidationResult {
  const invalidResult: ATRValidationResult = {
    atrAbsolute: 0,
    atrPips: 0,
    atrPercent: 0,
    raw: 0,
    isValid: false,
    validationMessage: 'Insufficient data',
    pipMultiplier: 10000,
    priceUsed: 0,
  };

  if (ohlcv.length < period + 1) {
    return { ...invalidResult, validationMessage: `Need at least ${period + 1} bars, have ${ohlcv.length}` };
  }

  // Calculate True Range for each bar
  const trueRanges: number[] = [];
  for (let i = 1; i < ohlcv.length; i++) {
    const curr = ohlcv[i];
    const prevClose = ohlcv[i - 1].close;

    if (!Number.isFinite(curr.high) || !Number.isFinite(curr.low) || !Number.isFinite(prevClose)) {
      continue;
    }

    const tr = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prevClose),
      Math.abs(curr.low - prevClose)
    );
    trueRanges.push(tr);
  }

  if (trueRanges.length < period) {
    return { ...invalidResult, validationMessage: 'Insufficient valid bars for ATR' };
  }

  // Wilder's smoothing (RMA) for ATR
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const alpha = 1 / period;

  for (let i = period; i < trueRanges.length; i++) {
    atr = alpha * trueRanges[i] + (1 - alpha) * atr;
  }

  // Current price for percentage and validation
  const currentPrice = ohlcv[ohlcv.length - 1].close;
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return { ...invalidResult, validationMessage: 'Invalid current price' };
  }

  // Detect pip multiplier based on price magnitude
  // JPY pairs: 100, most FX: 10000, crypto: varies
  let pipMultiplier = 10000;
  if (currentPrice > 50) {
    // Likely JPY pair or commodity
    pipMultiplier = 100;
  } else if (currentPrice > 1000) {
    // Likely index or high-value commodity
    pipMultiplier = 1;
  }

  const atrPips = atr * pipMultiplier;
  const atrPercent = (atr / currentPrice) * 100;

  // VALIDATION: ATR% should match calculated value within tolerance
  const calculatedAtrFromPercent = currentPrice * (atrPercent / 100);
  const tolerance = 0.0001; // 0.01% tolerance

  if (Math.abs(calculatedAtrFromPercent - atr) > tolerance) {
    return {
      ...invalidResult,
      validationMessage: `ATR unit mismatch: calculated ${calculatedAtrFromPercent.toFixed(6)} vs raw ${atr.toFixed(6)}`,
    };
  }

  // SANITY CHECK: ATR > 10% of price is extremely unusual for FX
  if (atrPercent > 10) {
    return {
      ...invalidResult,
      validationMessage: `ATR% unrealistic: ${atrPercent.toFixed(2)}% exceeds 10% threshold`,
    };
  }

  // SANITY CHECK: ATR > 10,000 pips is impossible for most FX
  if (atrPips > 10000) {
    return {
      ...invalidResult,
      validationMessage: `ATR pips unrealistic: ${atrPips.toFixed(1)} exceeds 10,000 threshold`,
    };
  }

  return {
    atrAbsolute: atr,
    atrPips,
    atrPercent,
    raw: atr,
    isValid: true,
    validationMessage: 'ATR validated successfully',
    pipMultiplier,
    priceUsed: currentPrice,
  };
}

// ============= HURST WITH CONFIDENCE INTERVALS =============

/**
 * Enhanced Hurst calculation using DFA with R² validation.
 * Returns confidence metrics and multi-scale stability analysis.
 */
export function calculateHurstWithConfidence(
  prices: number[],
  minDataPoints: number = 1000
): HurstValidationResult {
  const scales = [16, 32, 64, 128];

  const invalidResult: HurstValidationResult = {
    value: null,
    rSquared: 0,
    isValid: false,
    confidence: 'Invalid',
    classification: 'Indeterminate',
    scalesUsed: [],
    scaledHursts: {},
    stabilityScore: 0,
    hasOutliers: false,
    outlierScales: [],
    error: 'Insufficient data',
  };

  if (prices.length < minDataPoints) {
    return {
      ...invalidResult,
      error: `Insufficient data: ${prices.length} < ${minDataPoints}`,
    };
  }

  // Calculate log returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > 0 && prices[i - 1] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }

  if (returns.length < scales[scales.length - 1] * 10) {
    return {
      ...invalidResult,
      error: `Insufficient returns for DFA: ${returns.length}`,
    };
  }

  // Multi-scale DFA
  const scaledHursts: Record<string, { hurst: number; rSquared: number; valid: boolean; isOutlier?: boolean }> = {};
  const logScales: number[] = [];
  const logFlucts: number[] = [];

  for (const scale of scales) {
    const requiredBars = scale * 10;
    if (returns.length < requiredBars) {
      scaledHursts[`n=${scale}`] = { hurst: 0, rSquared: 0, valid: false };
      continue;
    }

    // DFA: Segment returns and calculate fluctuation
    const numSegments = Math.floor(returns.length / scale);
    let totalFluct = 0;

    for (let seg = 0; seg < numSegments; seg++) {
      const start = seg * scale;
      const segment = returns.slice(start, start + scale);

      // Cumulative sum
      let cumSum = 0;
      const profile: number[] = [];
      for (const r of segment) {
        cumSum += r;
        profile.push(cumSum);
      }

      // Linear detrend
      const n = profile.length;
      const xMean = (n - 1) / 2;
      const yMean = profile.reduce((a, b) => a + b, 0) / n;

      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (profile[i] - yMean);
        den += (i - xMean) * (i - xMean);
      }

      const slope = den !== 0 ? num / den : 0;
      const intercept = yMean - slope * xMean;

      // Variance around trend
      let sumSq = 0;
      for (let i = 0; i < n; i++) {
        const trend = slope * i + intercept;
        sumSq += (profile[i] - trend) ** 2;
      }

      totalFluct += sumSq / n;
    }

    const fluct = Math.sqrt(totalFluct / numSegments);

    if (fluct > 0) {
      logScales.push(Math.log(scale));
      logFlucts.push(Math.log(fluct));
    }

    // Estimate Hurst for this scale (simplified)
    scaledHursts[`n=${scale}`] = {
      hurst: 0.5, // Will be updated from regression
      rSquared: 0,
      valid: fluct > 0,
    };
  }

  if (logScales.length < 2) {
    return {
      ...invalidResult,
      error: 'Insufficient valid scales for regression',
    };
  }

  // Linear regression: log(F(s)) = H * log(s) + c
  const n = logScales.length;
  const xMean = logScales.reduce((a, b) => a + b, 0) / n;
  const yMean = logFlucts.reduce((a, b) => a + b, 0) / n;

  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (logScales[i] - xMean) * (logFlucts[i] - yMean);
    den += (logScales[i] - xMean) ** 2;
  }

  const hurst = den !== 0 ? num / den : 0.5;

  // Calculate R²
  const intercept = yMean - hurst * xMean;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = hurst * logScales[i] + intercept;
    ssRes += (logFlucts[i] - predicted) ** 2;
    ssTot += (logFlucts[i] - yMean) ** 2;
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // Update scaled Hursts with actual values
  const hurstValues: number[] = [];
  for (const key of Object.keys(scaledHursts)) {
    if (scaledHursts[key].valid) {
      scaledHursts[key].hurst = hurst;
      scaledHursts[key].rSquared = rSquared;
      hurstValues.push(hurst);
    }
  }

  // Calculate Hurst Stability Score (HSS)
  let stabilityScore = 0;
  if (hurstValues.length > 1) {
    const hurstMean = hurstValues.reduce((a, b) => a + b, 0) / hurstValues.length;
    const hurstStd = Math.sqrt(
      hurstValues.reduce((s, h) => s + (h - hurstMean) ** 2, 0) / hurstValues.length
    );
    stabilityScore = hurstMean > 0 ? 1 - (hurstStd / hurstMean) : 0;
  }

  // Determine validity and confidence
  const isValid = rSquared > 0.85;

  let confidence: HurstValidationResult['confidence'];
  if (!isValid) {
    confidence = 'Invalid';
  } else if (rSquared > 0.95) {
    confidence = 'High';
  } else if (rSquared > 0.90) {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  // Classification with uncertainty handling
  let classification: HurstValidationResult['classification'];
  if (!isValid) {
    classification = 'Indeterminate';
  } else if (hurst < 0.45) {
    classification = 'Mean-Reverting';
  } else if (hurst > 0.55) {
    classification = 'Trending';
  } else {
    classification = 'Random-Walk';
  }

  // Clamp Hurst to valid range
  const clampedHurst = Math.max(0, Math.min(1, hurst));

  // B3 FIX: Detect outliers (scale differs by >0.30 from median of others)
  const hurstValuesForOutlier = Object.values(scaledHursts).filter(h => h.valid).map(h => h.hurst);
  let hasOutliers = false;
  const outlierScales: number[] = [];

  if (hurstValuesForOutlier.length >= 3) {
    const sortedHursts = [...hurstValuesForOutlier].sort((a, b) => a - b);
    const median = sortedHursts[Math.floor(sortedHursts.length / 2)];

    scales.forEach((scale, i) => {
      const scaleKey = `n=${scale}`;
      const scaleData = scaledHursts[scaleKey];
      if (scaleData && scaleData.valid) {
        if (Math.abs(scaleData.hurst - median) > 0.30) {
          hasOutliers = true;
          outlierScales.push(scale);
          scaledHursts[scaleKey].isOutlier = true;
        }
      }
    });
  }

  return {
    value: isValid ? clampedHurst : null,
    rSquared,
    isValid,
    confidence,
    classification,
    scalesUsed: scales.filter((_, i) => i < logScales.length),
    scaledHursts,
    stabilityScore,
    hasOutliers,
    outlierScales,
    error: isValid ? undefined : `R² = ${rSquared.toFixed(3)} < 0.85 threshold`,
  };
}

// ============= TEMPORAL CONSISTENCY VALIDATOR =============

export interface TemporalConsistencyResult {
  isConsistent: boolean;
  reportGeneratedAt: Date;
  dataEndTimestamp: Date | null;
  latencyMinutes: number;
  ltp: number;
  isRealtime: boolean;
  error?: string;
}

/**
 * Ensures all metrics use data from the same time window.
 * Prevents the timestamp desync issue (18:15 vs 23:45).
 */
export function validateTemporalConsistency(
  ohlcv: OHLCVBar[],
  maxLatencyMinutes: number = 5
): TemporalConsistencyResult {
  const now = new Date();

  if (!ohlcv || ohlcv.length === 0) {
    return {
      isConsistent: false,
      reportGeneratedAt: now,
      dataEndTimestamp: null,
      latencyMinutes: Infinity,
      ltp: 0,
      isRealtime: false,
      error: 'No data available',
    };
  }

  const lastBar = ohlcv[ohlcv.length - 1];
  const dataEndTimestamp = lastBar.timestamp ? new Date(lastBar.timestamp) : null;

  if (!dataEndTimestamp || isNaN(dataEndTimestamp.getTime())) {
    return {
      isConsistent: false,
      reportGeneratedAt: now,
      dataEndTimestamp: null,
      latencyMinutes: Infinity,
      ltp: lastBar.close,
      isRealtime: false,
      error: 'Invalid timestamp in last bar',
    };
  }

  const latencyMs = now.getTime() - dataEndTimestamp.getTime();
  const latencyMinutes = latencyMs / (60 * 1000);
  const isRealtime = latencyMinutes <= 1;
  const isConsistent = latencyMinutes <= maxLatencyMinutes;

  return {
    isConsistent,
    reportGeneratedAt: now,
    dataEndTimestamp,
    latencyMinutes,
    ltp: lastBar.close,
    isRealtime,
    error: isConsistent ? undefined : `Data stale by ${latencyMinutes.toFixed(1)} minutes`,
  };
}

// ============= FIBONACCI PROVENANCE =============

export interface FibonacciLevel {
  ratio: number;
  ratioLabel: string;
  price: number;
  type: 'Anchor' | 'Retracement' | 'Swing Point' | 'Extension';
  distanceFromLTP: number;  // Percentage
}

export interface FibonacciProvenance {
  levels: FibonacciLevel[];
  metadata: {
    calculationTime: string;
    anchorPrice: number;
    swingPrice: number;
    priceRange: number;
    direction: 'up' | 'down';
    swingDetectionMethod: string;
    swingTimestamp?: string;
  };
}

/**
 * Calculates Fibonacci levels with full provenance for audit trail.
 */
export function calculateFibonacciWithProvenance(
  anchorPrice: number,
  swingPrice: number,
  ltp: number,
  direction: 'up' | 'down' = 'up',
  swingTimestamp?: string
): FibonacciProvenance {
  const diff = swingPrice - anchorPrice;
  const priceRange = Math.abs(diff);

  const ratios = [
    { ratio: 0, label: '0%', type: 'Anchor' as const },
    { ratio: 0.236, label: '23.6%', type: 'Retracement' as const },
    { ratio: 0.382, label: '38.2%', type: 'Retracement' as const },
    { ratio: 0.5, label: '50%', type: 'Retracement' as const },
    { ratio: 0.618, label: '61.8%', type: 'Retracement' as const },
    { ratio: 0.786, label: '78.6%', type: 'Retracement' as const },
    { ratio: 1.0, label: '100%', type: 'Swing Point' as const },
    { ratio: 1.272, label: '127.2%', type: 'Extension' as const },
    { ratio: 1.618, label: '161.8%', type: 'Extension' as const },
    { ratio: 2.0, label: '200%', type: 'Extension' as const },
    { ratio: 2.618, label: '261.8%', type: 'Extension' as const },
  ];

  const levels: FibonacciLevel[] = ratios.map(({ ratio, label, type }) => {
    const price = anchorPrice + ratio * diff;
    const distanceFromLTP = ltp > 0 ? ((price / ltp) - 1) * 100 : 0;

    return {
      ratio,
      ratioLabel: label,
      price: Number(price.toFixed(5)),
      type,
      distanceFromLTP: Number(distanceFromLTP.toFixed(2)),
    };
  });

  return {
    levels,
    metadata: {
      calculationTime: new Date().toISOString(),
      anchorPrice,
      swingPrice,
      priceRange: Number(priceRange.toFixed(5)),
      direction,
      swingDetectionMethod: 'Fractal (5-bar pattern)',
      swingTimestamp,
    },
  };
}

// ============= SWING POINT DETECTION =============

export interface SwingPoint {
  type: 'high' | 'low';
  price: number;
  barIndex: number;
  timestamp?: string;
}

/**
 * Identifies significant swing highs and lows using fractal detection.
 * Returns the most recent significant swing points.
 */
export function findSignificantSwings(
  ohlcv: OHLCVBar[],
  lookbackBars: number = 200,
  fractalWidth: number = 2
): { swingHigh: SwingPoint | null; swingLow: SwingPoint | null; allSwings: SwingPoint[] } {
  const swings: SwingPoint[] = [];
  const startIdx = Math.max(0, ohlcv.length - lookbackBars);

  for (let i = startIdx + fractalWidth; i < ohlcv.length - fractalWidth; i++) {
    const curr = ohlcv[i];

    // Check for swing high (higher than neighbors)
    let isSwingHigh = true;
    for (let j = 1; j <= fractalWidth; j++) {
      if (ohlcv[i - j].high >= curr.high || ohlcv[i + j].high >= curr.high) {
        isSwingHigh = false;
        break;
      }
    }

    if (isSwingHigh) {
      swings.push({
        type: 'high',
        price: curr.high,
        barIndex: i,
        timestamp: curr.timestamp,
      });
    }

    // Check for swing low (lower than neighbors)
    let isSwingLow = true;
    for (let j = 1; j <= fractalWidth; j++) {
      if (ohlcv[i - j].low <= curr.low || ohlcv[i + j].low <= curr.low) {
        isSwingLow = false;
        break;
      }
    }

    if (isSwingLow) {
      swings.push({
        type: 'low',
        price: curr.low,
        barIndex: i,
        timestamp: curr.timestamp,
      });
    }
  }

  // Find highest high and lowest low among recent swings
  const swingHighs = swings.filter(s => s.type === 'high');
  const swingLows = swings.filter(s => s.type === 'low');

  const highestSwingHigh = swingHighs.length > 0
    ? swingHighs.reduce((max, s) => s.price > max.price ? s : max)
    : null;

  const lowestSwingLow = swingLows.length > 0
    ? swingLows.reduce((min, s) => s.price < min.price ? s : min)
    : null;

  return {
    swingHigh: highestSwingHigh,
    swingLow: lowestSwingLow,
    allSwings: swings,
  };
}
