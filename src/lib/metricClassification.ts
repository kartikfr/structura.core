// ============= METRIC CLASSIFICATION SYSTEM =============
// Audit-compliant metric classification per institutional standards
// Three immutable metric classes with strict separation

/**
 * CLASS A - DIRECT OHLC METRICS
 * Computable via basic OHLC arithmetic, no transforms, no assumptions
 */
export type ClassAMetric =
  | 'lastPrice'
  | 'anchorPrice'
  | 'mean'
  | 'median'
  | 'stdDev'
  | 'atr'
  | 'volatility'
  | 'range'
  | 'temporalSymmetry'
  | 'barNormalizedRange'
  | 'srlLevels'
  | 'fibLevels'
  | 'logLevels';

/**
 * CLASS B - DETERMINISTIC STATISTICAL TRANSFORMS
 * Derived ONLY from price & time, deterministic, reproducible
 */
export type ClassBMetric =
  | 'hurstExponent'
  | 'entropyMetrics'
  | 'efficiencyRatio'
  | 'varianceRatio'
  | 'compressionRatio'
  | 'temporalPriceCompressionRatio'
  | 'structuralIntegrity'
  | 'hurstStability'
  | 'anchorDominance'
  | 'latticeCompression'
  | 'zScoreStretch';

/**
 * CLASS C - AUCTION & VOLUME METRICS
 * Require REAL volume data, invalid if volume = 0 or missing
 */
export type ClassCMetric =
  | 'participation'
  | 'volumeEntropy'
  | 'poc'
  | 'valueArea'
  | 'volumeAtGeometry'
  | 'vwap'
  | 'volumeConcentration'
  | 'effortResult';

export type MetricClass = 'A' | 'B' | 'C';

export interface MetricDefinition {
  id: string;
  name: string;
  class: MetricClass;
  formula: string;
  method?: string;
  window?: string;
  inputs: string[];
  interpretation: string;
  limitation: string;
  precision: number; // Max decimal places for display
}

// ============= METRIC DEFINITIONS =============

export const metricDefinitions: Record<string, MetricDefinition> = {
  // CLASS A - Direct OHLC Metrics
  lastPrice: {
    id: 'lastPrice',
    name: 'Last Price',
    class: 'A',
    formula: 'LTP = Close[n]',
    inputs: ['Close price'],
    interpretation: 'Most recent closing price from data',
    limitation: 'None - direct observation',
    precision: 2
  },
  anchorPrice: {
    id: 'anchorPrice',
    name: 'Anchor Price',
    class: 'A',
    formula: 'Anchor = Open[0] (Session/First Bar)',
    inputs: ['Open price'],
    interpretation: 'Reference price for session-anchored calculations',
    limitation: 'Depends on session detection',
    precision: 2
  },
  mean: {
    id: 'mean',
    name: 'Mean',
    class: 'A',
    formula: 'Mean = Sum(Close) / n',
    inputs: ['Close prices'],
    interpretation: 'Arithmetic average of closing prices',
    limitation: 'Sensitive to outliers',
    precision: 2
  },
  stdDev: {
    id: 'stdDev',
    name: 'Standard Deviation',
    class: 'A',
    formula: 'Std = sqrt(Sum((Close - Mean)^2) / n)',
    inputs: ['Close prices'],
    interpretation: 'Dispersion of prices around the mean',
    limitation: 'Assumes normal distribution',
    precision: 2
  },
  atr: {
    id: 'atr',
    name: 'Average True Range',
    class: 'A',
    formula: 'ATR = SMA(TrueRange, 14)',
    method: 'Simple Moving Average',
    window: '14 periods (structural constant)',
    inputs: ['High', 'Low', 'Close'],
    interpretation: 'Average volatility over lookback period',
    limitation: '14-period is non-tunable structural constant',
    precision: 2
  },
  temporalSymmetry: {
    id: 'temporalSymmetry',
    name: 'Temporal Symmetry (Anchor-Based)',
    class: 'A',
    formula: 'min(bars_before, bars_after) / max(bars_before, bars_after)',
    method: 'Anchor index located by price containment (Low ≤ Anchor ≤ High)',
    window: 'Full series',
    inputs: ['Anchor price', 'Bar highs/lows', 'Bar count'],
    interpretation: 'Ratio of bars before vs after the anchor price. Measures temporal balance only. Non-predictive.',
    limitation: 'Disabled if anchor cannot be located or bar count is insufficient',
    precision: 2
  },
  barNormalizedRange: {
    id: 'barNormalizedRange',
    name: 'Bar-Normalized Price Range',
    class: 'A',
    formula: '(max(High) - min(Low)) / N',
    window: 'Full series',
    inputs: ['High', 'Low', 'Bar count'],
    interpretation: 'Average price range contribution per bar across the observed window. Descriptive only.',
    limitation: 'Disabled if High/Low is missing or bar count is insufficient',
    precision: 2
  },
  srlLevels: {
    id: 'srlLevels',
    name: 'Square-Root Lattice Levels',
    class: 'A',
    formula: 'SRL(n) = (sqrt(Anchor) + n)^2',
    inputs: ['Anchor price'],
    interpretation: 'Price levels derived from root-space transformation',
    limitation: 'Geometric relationship, not predictive',
    precision: 2
  },
  fibLevels: {
    id: 'fibLevels',
    name: 'Fibonacci Levels',
    class: 'A',
    formula: 'Fib(r) = Low + (High - Low) x r',
    inputs: ['Swing High', 'Swing Low'],
    interpretation: 'Retracement and extension levels',
    limitation: 'Ratio is mathematical constant, not optimized',
    precision: 2
  },

  // CLASS B - Deterministic Statistical Transforms
  hurstExponent: {
    id: 'hurstExponent',
    name: 'Hurst Exponent (DFA)',
    class: 'B',
    formula: 'H = slope(log F(s) vs log s); R² > 0.85 required',
    method: 'Detrended Fluctuation Analysis with R² validation',
    window: 'Scales: {16, 32, 64, 128}',
    inputs: ['Close prices'],
    interpretation: 'Trending (>0.55), Mean-reverting (<0.45), Random. Requires R² > 0.85 for validity.',
    limitation: 'Fixed scales, linear detrending only. Invalid if R² ≤ 0.85.',
    precision: 2
  },
  efficiencyRatio: {
    id: 'efficiencyRatio',
    name: 'Price Efficiency Metric',
    class: 'B',
    formula: 'ER_t(n) = |C_t - C_{t-n}| / Σ|C_{t-i+1} - C_{t-i}|',
    method: 'Kaufman Efficiency (formal)',
    window: 'Full series',
    inputs: ['Close prices'],
    interpretation: 'Structured (>0.6), Diffusive (0.4-0.6), Noisy (<0.4). Bounded [0,1], scale-invariant.',
    limitation: 'Path-dependent, edge cases: ER=1 if all closes equal, ER=0 if no net movement.',
    precision: 2
  },
  varianceRatio: {
    id: 'varianceRatio',
    name: 'Variance Ratio (Lo-MacKinlay)',
    class: 'B',
    formula: 'VR = V[r^(k)] / (k × V[r]) using UNBIASED variance',
    method: 'Lo-MacKinlay with unbiased estimator',
    window: 'k = 5 periods',
    inputs: ['Log returns'],
    interpretation: 'Trending (>1.15), Mean-reverting (<0.85), Random. E[VR]=1 under random walk.',
    limitation: 'V[VR] ≈ 2(2k-1)(k-1)/(3kn). Assumes log-normal returns.',
    precision: 2
  },
  multiScaleStability: {
    id: 'multiScaleStability',
    name: 'Multi-Scale Stability Index (Υ)',
    class: 'B',
    formula: 'Υ = 1 - σ(A)/μ(A) where A = {α(s_1), ..., α(s_m)}',
    method: 'Cross-scale variance analysis',
    window: 'Scales: {16, 32, 64, 128}',
    inputs: ['DFA exponents across scales'],
    interpretation: 'Coherent (>0.7), Transitional (0.4-0.7), Fragmented (<0.4). Measures fractal consistency.',
    limitation: 'Confidence bound: σ_Υ ≈ σ(A)/μ²(A) × σ_σ(A)',
    precision: 2
  },
  zScoreStretch: {
    id: 'zScoreStretch',
    name: 'Z-Score Stretch',
    class: 'B',
    formula: 'Z = (P - Mean) / StdDev',
    method: 'Standard normalization',
    window: 'Full series',
    inputs: ['Close prices'],
    interpretation: 'Standard deviations from mean',
    limitation: 'Assumes stationarity',
    precision: 2
  },
  temporalPriceCompressionRatio: {
    id: 'temporalPriceCompressionRatio',
    name: 'Temporal–Price Compression Ratio',
    class: 'B',
    formula: '((price_range/T_window) / (N/T_window)) = price_range / N',
    method: 'Time-normalized density comparison',
    window: 'Full series (T_window from timestamps)',
    inputs: ['High', 'Low', 'Timestamps', 'Bar count'],
    interpretation: 'Compares price change density relative to time density. Descriptive scaling metric only.',
    limitation: 'Disabled if timestamps are missing/invalid or temporal window is undefined',
    precision: 2
  },
  structuralIntegrity: {
    id: 'structuralIntegrity',
    name: 'Structural Integrity Index (SII)',
    class: 'B',
    formula: 'SII = Υ × [w₁E\' + w₂V\' + w₃P\'], w = 1/3 each',
    method: 'Formal composite with arctan normalization',
    window: 'Full series',
    inputs: ['Efficiency Ratio', 'Variance Ratio', 'Hurst Exponent', 'Stability (Υ)'],
    interpretation: 'High (>0.7 & κ>0.8), Medium (0.5-0.7), Low (<0.5). Bounded [0,1], symmetric.',
    limitation: 'V\' = (2/π)arctan((VR-1)/0.3)+0.5. Equal weighting reduces component sensitivity.',
    precision: 2
  },
  participationDensity: {
    id: 'participationDensity',
    name: 'Volume-Aware Normalization',
    class: 'B',
    formula: 'V̂_t = V_t/Med(V); Δ^(w) = |ΔC| × min(V̂_t, 3)',
    method: 'Robust median estimator with 3σ cap',
    window: '20 periods',
    inputs: ['Volume', 'Price changes'],
    interpretation: 'Low (<0.5), Normal (0.5-1.5), Elevated (1.5-3), Extreme (>3, capped).',
    limitation: 'Uses tick volume as proxy in OTC markets. 3σ cap prevents outlier domination.',
    precision: 2
  },

  // CLASS C - Auction & Volume Metrics
  vwap: {
    id: 'vwap',
    name: 'VWAP',
    class: 'C',
    formula: 'VWAP = Sum((O+H+L+C)/4 x Vol) / Sum(Vol)',
    method: 'Volume-weighted typical price',
    window: 'Session-anchored',
    inputs: ['OHLC prices', 'Volume'],
    interpretation: 'Volume-weighted fair value',
    limitation: 'REQUIRES REAL VOLUME DATA',
    precision: 2
  },
  poc: {
    id: 'poc',
    name: 'Point of Control',
    class: 'C',
    formula: 'POC = price_bin with max(Volume)',
    method: 'Volume profile peak',
    window: 'Session',
    inputs: ['Price bins', 'Volume distribution'],
    interpretation: 'Price with highest volume concentration',
    limitation: 'REQUIRES REAL VOLUME DATA',
    precision: 2
  },
  valueArea: {
    id: 'valueArea',
    name: 'Value Area',
    class: 'C',
    formula: 'VA = min_range containing 70% of Volume',
    method: 'Volume aggregation',
    window: 'Session',
    inputs: ['Volume profile'],
    interpretation: 'Price range of value acceptance',
    limitation: 'REQUIRES REAL VOLUME DATA',
    precision: 2
  },
  volumeConcentration: {
    id: 'volumeConcentration',
    name: 'Volume Concentration',
    class: 'C',
    formula: 'Conc = top_3_bins_vol / total_vol',
    inputs: ['Volume profile'],
    interpretation: 'How focused volume is at specific levels',
    limitation: 'REQUIRES REAL VOLUME DATA',
    precision: 2
  },
  effortResult: {
    id: 'effortResult',
    name: 'Effort vs Result',
    class: 'C',
    formula: 'Ratio = (deltaP / ATR) / (vol / avg_vol)',
    inputs: ['Price change', 'Volume'],
    interpretation: 'Volume effort relative to price result',
    limitation: 'REQUIRES REAL VOLUME DATA',
    precision: 2
  }
};

// ============= CLASSIFICATION LABELS =============

export const classLabels: Record<MetricClass, { name: string; description: string; icon: 'check' | 'activity' | 'bar-chart' }> = {
  A: {
    name: 'Direct OHLC Metrics',
    description: 'Directly derived from OHLC data',
    icon: 'check'
  },
  B: {
    name: 'Deterministic Statistical Transforms (Price-Only)',
    description: 'Derived via deterministic statistical transformation of price series. Non-predictive.',
    icon: 'activity'
  },
  C: {
    name: 'Auction Context Metrics',
    description: 'Require REAL volume data. Invalid if volume = 0 or missing.',
    icon: 'bar-chart'
  }
};

// ============= VOLUME DATA VALIDATION =============

export interface VolumeDataStatus {
  hasVolume: boolean;
  totalVolume: number;
  zeroVolumeBarCount: number;
  totalBarCount: number;
  zeroVolumePercent: number;
  status: 'valid' | 'partial' | 'disabled';
  message: string;
}

export function validateVolumeData(bars: { volume: number }[]): VolumeDataStatus {
  if (!bars || bars.length === 0) {
    return {
      hasVolume: false,
      totalVolume: 0,
      zeroVolumeBarCount: 0,
      totalBarCount: 0,
      zeroVolumePercent: 100,
      status: 'disabled',
      message: 'No data available'
    };
  }

  const totalVolume = bars.reduce((sum, b) => sum + (b.volume || 0), 0);
  const zeroVolumeBarCount = bars.filter(b => !b.volume || b.volume === 0).length;
  const totalBarCount = bars.length;
  const zeroVolumePercent = (zeroVolumeBarCount / totalBarCount) * 100;

  // HARD FAILURE: If total volume is 0 or all bars have 0 volume
  if (totalVolume === 0 || zeroVolumePercent === 100) {
    return {
      hasVolume: false,
      totalVolume: 0,
      zeroVolumeBarCount,
      totalBarCount,
      zeroVolumePercent: 100,
      status: 'disabled',
      message: 'DISABLED - Volume data unavailable'
    };
  }

  // Partial: More than 50% zero volume bars
  if (zeroVolumePercent > 50) {
    return {
      hasVolume: true,
      totalVolume,
      zeroVolumeBarCount,
      totalBarCount,
      zeroVolumePercent,
      status: 'partial',
      message: `WARNING - ${zeroVolumePercent.toFixed(0)}% of bars have zero volume`
    };
  }

  return {
    hasVolume: true,
    totalVolume,
    zeroVolumeBarCount,
    totalBarCount,
    zeroVolumePercent,
    status: 'valid',
    message: 'Volume data available'
  };
}

// ============= DATA INTEGRITY VALIDATION =============

export interface DataIntegrityStatus {
  isComplete: boolean;
  hasOpenPrice: boolean;
  hasVolume: boolean;
  barCount: number;
  minimumBars: number;
  missingFields: string[];
  affectedLayers: string[];
  message: string;
}

export function validateDataIntegrity(
  bars: { open?: number; high?: number; low?: number; close?: number; volume?: number }[],
  minimumBars: number = 50
): DataIntegrityStatus {
  const missingFields: string[] = [];
  const affectedLayers: string[] = [];

  if (!bars || bars.length === 0) {
    return {
      isComplete: false,
      hasOpenPrice: false,
      hasVolume: false,
      barCount: 0,
      minimumBars,
      missingFields: ['All data'],
      affectedLayers: ['All layers'],
      message: 'STRUCTURAL ANALYSIS INCOMPLETE - No data provided'
    };
  }

  const barCount = bars.length;

  // Check Open price (MANDATORY)
  const hasOpenPrice = bars.every(b => b.open !== undefined && b.open !== null);
  if (!hasOpenPrice) {
    missingFields.push('Open price');
    affectedLayers.push('Session Anchor', 'Price Context', 'Geometry Engine');
  }

  // Check Volume
  const volumeStatus = validateVolumeData(bars as { volume: number }[]);
  const hasVolume = volumeStatus.status !== 'disabled';
  if (!hasVolume) {
    missingFields.push('Volume data');
    affectedLayers.push('Auction Context', 'VWAP', 'POC', 'Value Area', 'Volume Profile');
  }

  // Check minimum bars
  if (barCount < minimumBars) {
    missingFields.push(`Minimum ${minimumBars} bars (have ${barCount})`);
    affectedLayers.push('Statistical Transforms', 'Hurst Analysis');
  }

  const isComplete = missingFields.length === 0;

  return {
    isComplete,
    hasOpenPrice,
    hasVolume,
    barCount,
    minimumBars,
    missingFields,
    affectedLayers,
    message: isComplete
      ? 'Data integrity verified'
      : `STRUCTURAL ANALYSIS INCOMPLETE - ${missingFields.join(', ')}`
  };
}

// ============= PRECISION FORMATTING =============

/**
 * Format a number with audit-compliant precision (max 2 decimal places)
 * Internal calculations retain full precision
 */
export function formatPrecision(value: number, maxDecimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '-';

  // Clamp to max 2 decimals for display
  const precision = Math.min(maxDecimals, 2);
  return value.toFixed(precision);
}

/**
 * Format a percentage with audit-compliant precision
 */
export function formatPercent(value: number, maxDecimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) return '-';
  return `${formatPrecision(value, Math.min(maxDecimals, 2))}%`;
}

// ============= TIMESTAMP VALIDATION =============

export interface TimestampStatus {
  reportTimestamp: Date;
  dataTimestamp: Date;
  isValid: boolean;
  message: string;
}

export function validateTimestamp(
  dataTimestamps: (string | Date)[]
): TimestampStatus {
  const now = new Date();

  if (!dataTimestamps || dataTimestamps.length === 0) {
    return {
      reportTimestamp: now,
      dataTimestamp: now,
      isValid: false,
      message: 'No timestamp data available'
    };
  }

  // Get max timestamp from data
  const maxTimestamp = dataTimestamps.reduce((max, ts) => {
    const date = typeof ts === 'string' ? new Date(ts) : ts;
    return date > max ? date : max;
  }, new Date(0));

  // Report timestamp must equal max data timestamp
  const isValid = maxTimestamp <= now;

  return {
    reportTimestamp: new Date(maxTimestamp),
    dataTimestamp: new Date(maxTimestamp),
    isValid,
    message: isValid
      ? `Report date: ${new Date(maxTimestamp).toISOString().split('T')[0]}`
      : 'Report date adjusted to match latest available data'
  };
}

// ============= FORBIDDEN LANGUAGE CHECK =============

const FORBIDDEN_WORDS = [
  'buy', 'sell', 'signal', 'confirmed', 'setup',
  'probability', 'forecast', 'edge', 'win', 'loss',
  'bullish', 'bearish', 'spring', 'upthrust', 'sos', 'sow'
];

export function containsForbiddenLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lower.includes(word));
}

export function sanitizeLanguage(text: string): string {
  let result = text;
  FORBIDDEN_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, '[REDACTED]');
  });
  return result;
}
