// ============= Market Structure Context Scanner =============
// Mathematical context layer - OHLCV-derived metrics only
// No pattern recognition, no predictions, no Wyckoff terminology
// Every output traceable to a formula using only OHLCV data

export interface OHLCVBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RangeMetrics {
  width: number;
  widthATR: number;
  position: number; // 0-100% from bottom
  boundaryProximity: { distance: number; boundary: 'support' | 'resistance' };
}

export interface VolumeMetrics {
  currentVsAverage: number; // Percentage
  supportBias: number; // Ratio of volume near support vs resistance
  biasLabel: 'support' | 'resistance' | 'neutral';
}

export interface TestMetrics {
  depth: number; // ATR units
  barsSince: number;
  recovery: 'immediate' | 'gradual' | 'none';
  boundary: 'support' | 'resistance';
}

export interface CompressionMetrics {
  ratio: number; // Current range / average range
  trend: 'contracting' | 'expanding' | 'stable';
  previousRatio: number;
}

export interface EffortResultMetrics {
  ratio: number;
  interpretation: 'high-effort-small-move' | 'low-effort-large-move' | 'proportional';
}

export interface MarketStructureContextResult {
  rangeMetrics: RangeMetrics;
  volumeMetrics: VolumeMetrics;
  testMetrics: TestMetrics | null;
  compressionMetrics: CompressionMetrics;
  effortResultMetrics: EffortResultMetrics;
}

// 1. RANGE STATE ANALYSIS
// Formula: range_width = max(high[lookback]) - min(low[lookback])
// Formula: range_position = (current_price - range_low) / range_width × 100
export function calculateRangeMetrics(
  ohlcv: OHLCVBar[],
  ltp: number,
  atr: number,
  lookback: number = 20
): RangeMetrics {
  const subset = ohlcv.slice(-lookback);

  const rangeHigh = Math.max(...subset.map(b => b.high));
  const rangeLow = Math.min(...subset.map(b => b.low));
  const width = rangeHigh - rangeLow;

  const position = width > 0 ? ((ltp - rangeLow) / width) * 100 : 50;

  const distanceToSupport = ltp - rangeLow;
  const distanceToResistance = rangeHigh - ltp;

  const boundaryProximity = distanceToSupport < distanceToResistance
    ? { distance: atr > 0 ? distanceToSupport / atr : distanceToSupport, boundary: 'support' as const }
    : { distance: atr > 0 ? distanceToResistance / atr : distanceToResistance, boundary: 'resistance' as const };

  return {
    width,
    widthATR: atr > 0 ? width / atr : 0,
    position: Math.round(position * 10) / 10,
    boundaryProximity
  };
}

// 2. VOLUME CONTEXT
// Formula: volume_ratio_at_level = volume[current] / average_volume × 100
// Formula: volume_support_ratio = volume[near_support] / volume[near_resistance]
export function calculateVolumeMetrics(
  ohlcv: OHLCVBar[],
  lookback: number = 20
): VolumeMetrics {
  const subset = ohlcv.slice(-lookback);
  const hasVolume = subset.some(b => b.volume && b.volume > 0);

  if (!hasVolume) {
    return {
      currentVsAverage: 100,
      supportBias: 1,
      biasLabel: 'neutral'
    };
  }

  const volumes = subset.map(b => b.volume || 0);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentVolume = volumes[volumes.length - 1] || avgVolume;

  const currentVsAverage = avgVolume > 0 ? (currentVolume / avgVolume) * 100 : 100;

  // Calculate volume bias using typical price
  // Typical Price = (High + Low + Close) / 3
  const rangeHigh = Math.max(...subset.map(b => b.high));
  const rangeLow = Math.min(...subset.map(b => b.low));
  const midpoint = (rangeHigh + rangeLow) / 2;

  let volumeNearSupport = 0;
  let volumeNearResistance = 0;

  subset.forEach(bar => {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    const vol = bar.volume || 1;
    if (typicalPrice < midpoint) {
      volumeNearSupport += vol;
    } else {
      volumeNearResistance += vol;
    }
  });

  const supportBias = volumeNearResistance > 0
    ? volumeNearSupport / volumeNearResistance
    : 1;

  let biasLabel: 'support' | 'resistance' | 'neutral';
  if (supportBias > 1.3) {
    biasLabel = 'support';
  } else if (supportBias < 0.7) {
    biasLabel = 'resistance';
  } else {
    biasLabel = 'neutral';
  }

  return {
    currentVsAverage: Math.round(currentVsAverage),
    supportBias: Math.round(supportBias * 100) / 100,
    biasLabel
  };
}

// 3. TEST QUALITY METRIC
// Formula: test_depth = |price - boundary| / ATR
// Recovery assessed by price movement after test
export function calculateTestMetrics(
  ohlcv: OHLCVBar[],
  ltp: number,
  atr: number,
  lookback: number = 20
): TestMetrics | null {
  if (ohlcv.length < lookback) return null;

  const subset = ohlcv.slice(-lookback);
  const rangeHigh = Math.max(...subset.map(b => b.high));
  const rangeLow = Math.min(...subset.map(b => b.low));

  // Test threshold: within 0.5 ATR of boundary
  const testThreshold = atr > 0 ? atr * 0.5 : (rangeHigh - rangeLow) * 0.1;

  let lastTestBar = -1;
  let testBoundary: 'support' | 'resistance' = 'support';
  let testDepth = 0;

  // Scan from most recent backwards
  for (let i = subset.length - 1; i >= 0; i--) {
    const bar = subset[i];
    const distToSupport = bar.low - rangeLow;
    const distToResistance = rangeHigh - bar.high;

    if (distToSupport <= testThreshold) {
      lastTestBar = subset.length - 1 - i;
      testBoundary = 'support';
      testDepth = atr > 0 ? distToSupport / atr : 0;
      break;
    }

    if (distToResistance <= testThreshold) {
      lastTestBar = subset.length - 1 - i;
      testBoundary = 'resistance';
      testDepth = atr > 0 ? distToResistance / atr : 0;
      break;
    }
  }

  if (lastTestBar === -1) return null;

  // Calculate recovery distance
  const priceChange = testBoundary === 'support'
    ? ltp - rangeLow
    : rangeHigh - ltp;

  const recoveryATR = atr > 0 ? priceChange / atr : 0;

  let recovery: 'immediate' | 'gradual' | 'none';
  if (lastTestBar <= 3 && recoveryATR > 1) {
    recovery = 'immediate';
  } else if (recoveryATR > 0.5) {
    recovery = 'gradual';
  } else {
    recovery = 'none';
  }

  return {
    depth: Math.round(testDepth * 100) / 100,
    barsSince: lastTestBar,
    recovery,
    boundary: testBoundary
  };
}

// 4. COMPRESSION ANALYSIS
// Formula: compression_ratio = current_range / average_range[lookback] × 100
export function calculateCompressionMetrics(
  ohlcv: OHLCVBar[],
  shortLookback: number = 5,
  longLookback: number = 20
): CompressionMetrics {
  if (ohlcv.length < longLookback) {
    return { ratio: 100, trend: 'stable', previousRatio: 100 };
  }

  // Calculate True Range for each bar (more accurate than H-L)
  const trueRanges = ohlcv.slice(1).map((bar, i) => {
    const prevClose = ohlcv[i].close;
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - prevClose),
      Math.abs(bar.low - prevClose)
    );
  });

  // Current short-term average true range
  const recentRanges = trueRanges.slice(-shortLookback);
  const currentAvgRange = recentRanges.reduce((a, b) => a + b, 0) / recentRanges.length;

  // Historical average true range
  const historicalRanges = trueRanges.slice(-longLookback);
  const historicalAvgRange = historicalRanges.reduce((a, b) => a + b, 0) / historicalRanges.length;

  const ratio = historicalAvgRange > 0
    ? (currentAvgRange / historicalAvgRange) * 100
    : 100;

  // Previous ratio (shifted by 1 bar)
  const prevRecentRanges = trueRanges.slice(-shortLookback - 1, -1);
  const prevAvgRange = prevRecentRanges.length > 0
    ? prevRecentRanges.reduce((a, b) => a + b, 0) / prevRecentRanges.length
    : currentAvgRange;
  const previousRatio = historicalAvgRange > 0
    ? (prevAvgRange / historicalAvgRange) * 100
    : 100;

  let trend: 'contracting' | 'expanding' | 'stable';
  if (ratio < previousRatio - 5) {
    trend = 'contracting';
  } else if (ratio > previousRatio + 5) {
    trend = 'expanding';
  } else {
    trend = 'stable';
  }

  return {
    ratio: Math.round(ratio),
    trend,
    previousRatio: Math.round(previousRatio)
  };
}

// 5. EFFORT vs RESULT
// Formula: ratio = |price_change| / normalized_effort
// Uses volume if available, otherwise uses total bar ranges as effort proxy
export function calculateEffortResultMetrics(
  ohlcv: OHLCVBar[],
  lookback: number = 5
): EffortResultMetrics {
  if (ohlcv.length < lookback) {
    return { ratio: 1, interpretation: 'proportional' };
  }

  const subset = ohlcv.slice(-lookback);

  // Price change (result)
  const priceChange = Math.abs(
    subset[subset.length - 1].close - subset[0].open
  );

  // Volume effort (normalized)
  const hasVolume = subset.some(b => b.volume && b.volume > 0);

  if (!hasVolume) {
    // Without volume, use total true range as proxy for effort
    const totalRange = subset.reduce((sum, b) => sum + (b.high - b.low), 0);
    const ratio = totalRange > 0 ? priceChange / totalRange : 1;

    return {
      ratio: Math.round(ratio * 100) / 100,
      interpretation: ratio < 0.3 ? 'high-effort-small-move'
        : ratio > 0.7 ? 'low-effort-large-move'
          : 'proportional'
    };
  }

  const totalVolume = subset.reduce((sum, b) => sum + (b.volume || 0), 0);
  const avgPrice = subset.reduce((sum, b) => sum + b.close, 0) / subset.length;

  // Normalize: price change per unit of normalized volume
  const normalizedVolume = totalVolume / avgPrice;
  const ratio = normalizedVolume > 0 ? priceChange / (normalizedVolume / 1000) : 1;

  let interpretation: 'high-effort-small-move' | 'low-effort-large-move' | 'proportional';
  if (ratio < 0.5) {
    interpretation = 'high-effort-small-move';
  } else if (ratio > 2) {
    interpretation = 'low-effort-large-move';
  } else {
    interpretation = 'proportional';
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    interpretation
  };
}

// Main calculator function
export function calculateMarketStructureContext(
  ohlcv: OHLCVBar[],
  ltp: number,
  atr: number
): MarketStructureContextResult {
  return {
    rangeMetrics: calculateRangeMetrics(ohlcv, ltp, atr),
    volumeMetrics: calculateVolumeMetrics(ohlcv),
    testMetrics: calculateTestMetrics(ohlcv, ltp, atr),
    compressionMetrics: calculateCompressionMetrics(ohlcv),
    effortResultMetrics: calculateEffortResultMetrics(ohlcv)
  };
}

// Formula documentation for tooltips
export const structureFormulas = {
  rangeAnalysis: {
    name: 'Range State Analysis',
    formula: 'width = max(H) - min(L); position = (LTP - low) / width × 100',
    interpretation: 'Measures current price position within the observable trading range',
    limitation: 'Lookback-dependent; range boundaries shift as new data arrives',
    useCase: 'Understand where price sits relative to recent extremes. Position near 0% indicates proximity to range bottom; near 100% indicates proximity to range top. Width in ATR units contextualizes range significance.'
  },
  volumeContext: {
    name: 'Volume Context',
    formula: 'current_vs_avg = V_current / V_avg × 100; bias = V_support_zone / V_resistance_zone',
    interpretation: 'Compares current volume to average and measures volume distribution across price zones',
    limitation: 'Requires volume data; bias calculation assumes range-bound context',
    useCase: 'Volume above average may indicate increased participation. Bias toward support suggests more activity in lower price zones; bias toward resistance suggests more activity in upper zones. This is observational, not predictive.'
  },
  testMetrics: {
    name: 'Boundary Test Quality',
    formula: 'depth = |price - boundary| / ATR; recovery = price_movement / bars_since_test',
    interpretation: 'Quantifies how close price approached a boundary and subsequent price action',
    limitation: 'Test detection threshold is fixed; recovery classification is categorical',
    useCase: 'Shallow tests (low depth) with immediate recovery may indicate boundary holding. Deep tests with no recovery may indicate boundary weakness. These are structural observations, not predictions.'
  },
  compression: {
    name: 'Range Compression',
    formula: 'ratio = avg_range_recent / avg_range_historical × 100',
    interpretation: 'Measures current volatility contraction or expansion relative to historical norm',
    limitation: 'Sensitive to lookback periods; compression can persist indefinitely',
    useCase: 'Ratio below 100% indicates compression (current ranges smaller than average). Contracting trend suggests ongoing compression; expanding trend suggests volatility returning. No prediction of breakout timing is implied.'
  },
  effortResult: {
    name: 'Effort vs Result',
    formula: 'ratio = |price_change| / normalized_effort',
    interpretation: 'Compares price displacement to effort (volume or range) expended',
    limitation: 'Without volume, uses range as effort proxy; ratio interpretation is relative',
    useCase: 'High effort with small movement suggests absorption or resistance. Low effort with large movement suggests ease of price travel. This describes observed price/volume dynamics, not future direction.'
  }
};
