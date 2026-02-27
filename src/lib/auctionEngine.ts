// ============= Auction & Volume Context Engine =============
// Mathematical volume distribution from OHLCV data
// Session-anchored, formula-transparent, non-predictive
// 
// INSTITUTIONAL-GRADE IMPLEMENTATION:
// - VWAP uses Typical Price = (Open + High + Low + Close) / 4
// - All volume metrics are session-anchored
// - POC and Value Area explicitly defined
// - Volume at Geometry Levels with significance ratios

import { OHLCVBar, detectSessions, SessionInfo } from './mt5Parser';

// ============= Interfaces =============

export interface VolumeAtPriceBin {
  priceCenter: number;
  volume: number;
  percentage: number;  // % of total session volume
}

export interface ValueAreaResult {
  vah: number;       // Value Area High
  val: number;       // Value Area Low
  width: number;     // VAH - VAL
  percentage: number; // Actual % of volume contained
  targetPercent: number; // Requested % (default 70%)
}

export interface POCResult {
  price: number;
  volume: number;
  percentage: number; // % of session volume at POC
}

export interface VWAPResult {
  price: number;
  deviation: number;      // (LTP - VWAP) / ATR
  classification: string;
  formula: string;        // For transparency
}

export interface RangeResult {
  sessionHigh: number;
  sessionLow: number;
  sessionRange: number;
  rangePosition: number;     // (LTP - low) / range
  initialBalance: {
    high: number;
    low: number;
    width: number;
    barsUsed: number;
  };
}

export interface VolumeAtLevelResult {
  level: number;
  volume: number;
  significance: number;    // volume / avgVolumePerBin
  classification: string;
}

export interface CompressionResult {
  ratio: number;           // currentRange / averageRange
  percentOfAverage: number;
  trend: 'contracting' | 'expanding' | 'stable';
  unit: string;            // "% of 20-bar average range"
}

export interface EffortResultMetric {
  ratio: number;           // priceChange / normalizedVolume
  classification: string;
}

export interface AuctionEngineResult {
  // Session Context (MANDATORY)
  session: SessionInfo;
  sessionOpen: number;
  priceVsOpen: number;     // (LTP - sessionOpen) / ATR

  // VWAP (with formula transparency)
  vwap: VWAPResult;

  // Range Analysis (from Open)
  range: RangeResult;

  // Volume Profile
  volumeProfile: VolumeAtPriceBin[];
  poc: POCResult;
  valueArea: ValueAreaResult;
  volumeConcentration: number; // top3bins / totalVolume

  // Volume at Geometry Levels
  volumeAtLevels: VolumeAtLevelResult[];

  // Compression Metric (with units)
  compression: CompressionResult;

  // Effort vs Result
  effortResult: EffortResultMetric;

  // Disclaimers and formulas
  formulas: typeof auctionFormulas;
}

// ============= Core Calculations =============

// Build Volume Profile using proportional distribution
// Formula: If High ≠ Low: Volume_per_price = Volume / (High - Low)
export function buildVolumeProfile(
  bars: OHLCVBar[],
  atr: number
): VolumeAtPriceBin[] {
  if (bars.length === 0) return [];

  // Calculate bin size: max(ATR × 0.25, tickSize × 5)
  const minTick = 0.01;
  const binSize = Math.max(0.25 * atr, minTick * 5);

  const bins = new Map<number, number>();

  bars.forEach(bar => {
    const range = bar.high - bar.low;

    if (range === 0) {
      // All volume at single price
      const binCenter = Math.floor(bar.close / binSize) * binSize + binSize / 2;
      bins.set(binCenter, (bins.get(binCenter) || 0) + bar.volume);
    } else {
      // Distribute volume uniformly across price bins
      const volumePerUnit = bar.volume / range;

      for (let price = bar.low; price <= bar.high; price += binSize) {
        const binCenter = Math.floor(price / binSize) * binSize + binSize / 2;
        const contribution = volumePerUnit * binSize;
        bins.set(binCenter, (bins.get(binCenter) || 0) + contribution);
      }
    }
  });

  // Calculate total volume
  let totalVolume = 0;
  bins.forEach(v => totalVolume += v);

  // Convert to array with percentages
  const result: VolumeAtPriceBin[] = [];
  bins.forEach((volume, priceCenter) => {
    result.push({
      priceCenter,
      volume,
      percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0
    });
  });

  return result.sort((a, b) => a.priceCenter - b.priceCenter);
}

// Calculate POC - Point of Control
// Formula: POC = price_bin with maximum accumulated volume
export function calculatePOC(volumeProfile: VolumeAtPriceBin[]): POCResult {
  if (volumeProfile.length === 0) {
    return { price: 0, volume: 0, percentage: 0 };
  }

  let maxBin = volumeProfile[0];
  volumeProfile.forEach(bin => {
    if (bin.volume > maxBin.volume) {
      maxBin = bin;
    }
  });

  return {
    price: maxBin.priceCenter,
    volume: maxBin.volume,
    percentage: maxBin.percentage
  };
}

// Calculate Value Area
// Formula: Smallest price range containing target% of total volume
export function calculateValueArea(
  volumeProfile: VolumeAtPriceBin[],
  targetPercent: number = 70
): ValueAreaResult {
  if (volumeProfile.length === 0) {
    return { vah: 0, val: 0, width: 0, percentage: 0, targetPercent };
  }

  const totalVolume = volumeProfile.reduce((sum, b) => sum + b.volume, 0);
  const targetVolume = totalVolume * (targetPercent / 100);

  // Sort by volume descending
  const sortedByVolume = [...volumeProfile].sort((a, b) => b.volume - a.volume);

  // Accumulate until target reached
  let accumulated = 0;
  const includedPrices: number[] = [];

  for (const bin of sortedByVolume) {
    if (accumulated >= targetVolume) break;
    accumulated += bin.volume;
    includedPrices.push(bin.priceCenter);
  }

  if (includedPrices.length === 0) {
    return { vah: 0, val: 0, width: 0, percentage: 0, targetPercent };
  }

  const vah = Math.max(...includedPrices);
  const val = Math.min(...includedPrices);

  return {
    vah,
    val,
    width: vah - val,
    percentage: (accumulated / totalVolume) * 100,
    targetPercent
  };
}

// Calculate Session-Anchored VWAP
// CRITICAL: Typical Price = (Open + High + Low + Close) / 4
export function calculateSessionVWAP(
  bars: OHLCVBar[],
  ltp: number,
  atr: number
): VWAPResult {
  if (bars.length === 0) {
    return {
      price: ltp,
      deviation: 0,
      classification: 'Insufficient data',
      formula: 'VWAP = Σ(TypicalPrice × Volume) / Σ(Volume)'
    };
  }

  let sumPV = 0;
  let sumV = 0;

  bars.forEach(bar => {
    // INSTITUTIONAL FORMULA: TypicalPrice = (O + H + L + C) / 4
    const typicalPrice = (bar.open + bar.high + bar.low + bar.close) / 4;
    const volume = bar.volume > 0 ? bar.volume : 1;
    sumPV += typicalPrice * volume;
    sumV += volume;
  });

  const vwap = sumV > 0 ? sumPV / sumV : ltp;
  const deviation = atr > 0 ? (ltp - vwap) / atr : 0;

  // Classification
  const absDeviation = Math.abs(deviation);
  let classification: string;
  if (absDeviation < 0.5) {
    classification = 'At Value';
  } else if (absDeviation < 1.5) {
    classification = 'Moderate Deviation';
  } else {
    classification = 'Extended';
  }

  return {
    price: vwap,
    deviation,
    classification,
    formula: 'VWAP = Σ((O+H+L+C)/4 × Vol) / Σ(Vol)'
  };
}

// Calculate Session Range with Initial Balance
export function calculateSessionRange(
  bars: OHLCVBar[],
  ltp: number,
  initialBalanceBars: number = 4
): RangeResult {
  if (bars.length === 0) {
    return {
      sessionHigh: ltp,
      sessionLow: ltp,
      sessionRange: 0,
      rangePosition: 0.5,
      initialBalance: { high: ltp, low: ltp, width: 0, barsUsed: 0 }
    };
  }

  const sessionHigh = Math.max(...bars.map(b => b.high));
  const sessionLow = Math.min(...bars.map(b => b.low));
  const sessionRange = sessionHigh - sessionLow;

  // Range position: (LTP - low) / range
  const rangePosition = sessionRange > 0 ? (ltp - sessionLow) / sessionRange : 0.5;

  // Initial Balance: First N bars of session
  const ibBars = bars.slice(0, Math.min(initialBalanceBars, bars.length));
  const ibHigh = Math.max(...ibBars.map(b => b.high));
  const ibLow = Math.min(...ibBars.map(b => b.low));

  return {
    sessionHigh,
    sessionLow,
    sessionRange,
    rangePosition,
    initialBalance: {
      high: ibHigh,
      low: ibLow,
      width: ibHigh - ibLow,
      barsUsed: ibBars.length
    }
  };
}

// Calculate Volume Concentration
// Formula: top_3_bins_volume / total_volume
export function calculateVolumeConcentration(volumeProfile: VolumeAtPriceBin[]): number {
  if (volumeProfile.length === 0) return 0;

  const totalVolume = volumeProfile.reduce((sum, b) => sum + b.volume, 0);
  if (totalVolume === 0) return 0;

  const sorted = [...volumeProfile].sort((a, b) => b.volume - a.volume);
  const top3Volume = sorted.slice(0, 3).reduce((sum, b) => sum + b.volume, 0);

  return top3Volume / totalVolume;
}

// Calculate Volume at Geometry Levels
export function calculateVolumeAtLevels(
  volumeProfile: VolumeAtPriceBin[],
  geometryLevels: number[],
  atr: number
): VolumeAtLevelResult[] {
  if (volumeProfile.length === 0 || geometryLevels.length === 0) return [];

  // Threshold: max(ATR × 0.25, tick × 3)
  const minTick = 0.01;
  const threshold = Math.max(atr * 0.25, minTick * 3);

  // Average volume per bin
  const totalVolume = volumeProfile.reduce((sum, b) => sum + b.volume, 0);
  const avgVolumePerBin = totalVolume / volumeProfile.length;

  return geometryLevels.map(level => {
    // Sum volume near level
    const volumeNear = volumeProfile
      .filter(bin => Math.abs(bin.priceCenter - level) <= threshold)
      .reduce((sum, b) => sum + b.volume, 0);

    const significance = avgVolumePerBin > 0 ? volumeNear / avgVolumePerBin : 0;

    // Classification
    let classification: string;
    if (significance > 1.5) {
      classification = 'High participation';
    } else if (significance < 0.5) {
      classification = 'Low participation';
    } else {
      classification = 'Moderate';
    }

    return { level, volume: volumeNear, significance, classification };
  });
}

// Calculate Compression Metric
// Formula: compression_ratio = current_range / average_range[n]
export function calculateCompression(
  bars: OHLCVBar[],
  lookback: number = 20
): CompressionResult {
  if (bars.length < 3) {
    return {
      ratio: 1,
      percentOfAverage: 100,
      trend: 'stable',
      unit: '% of 20-bar average range'
    };
  }

  // Calculate ranges for each bar
  const ranges = bars.map(b => b.high - b.low);

  // Current range (last bar)
  const currentRange = ranges[ranges.length - 1];

  // Average range (last N bars)
  const lookbackRanges = ranges.slice(-lookback);
  const avgRange = lookbackRanges.reduce((a, b) => a + b, 0) / lookbackRanges.length;

  if (avgRange === 0) {
    return { ratio: 1, percentOfAverage: 100, trend: 'stable', unit: '% of 20-bar average range' };
  }

  const ratio = currentRange / avgRange;
  const percentOfAverage = ratio * 100;

  // Trend detection
  const recentRanges = ranges.slice(-5);
  const olderRanges = ranges.slice(-10, -5);

  const recentAvg = recentRanges.length > 0
    ? recentRanges.reduce((a, b) => a + b, 0) / recentRanges.length
    : avgRange;
  const olderAvg = olderRanges.length > 0
    ? olderRanges.reduce((a, b) => a + b, 0) / olderRanges.length
    : avgRange;

  let trend: 'contracting' | 'expanding' | 'stable';
  if (recentAvg < olderAvg * 0.8) {
    trend = 'contracting';
  } else if (recentAvg > olderAvg * 1.2) {
    trend = 'expanding';
  } else {
    trend = 'stable';
  }

  return {
    ratio,
    percentOfAverage,
    trend,
    unit: `% of ${lookback}-bar average range`
  };
}

// Calculate Effort vs Result
// Formula: effort_ratio = price_change / normalized_volume
export function calculateEffortResult(
  bars: OHLCVBar[],
  atr: number
): EffortResultMetric {
  if (bars.length < 2 || atr === 0) {
    return { ratio: 1, classification: 'Insufficient data' };
  }

  // Get last few bars
  const recentBars = bars.slice(-5);

  // Price change (absolute)
  const priceChange = Math.abs(recentBars[recentBars.length - 1].close - recentBars[0].open);
  const normalizedPriceChange = priceChange / atr;

  // Volume (average)
  const avgVolume = recentBars.reduce((sum, b) => sum + b.volume, 0) / recentBars.length;

  // Normalize volume against overall average
  const overallAvgVolume = bars.reduce((sum, b) => sum + b.volume, 0) / bars.length;
  const normalizedVolume = overallAvgVolume > 0 ? avgVolume / overallAvgVolume : 1;

  const ratio = normalizedVolume > 0 ? normalizedPriceChange / normalizedVolume : 0;

  // Classification
  let classification: string;
  if (ratio < 0.5) {
    classification = 'High effort, small result';
  } else if (ratio > 2) {
    classification = 'Low effort, large result';
  } else {
    classification = 'Proportional';
  }

  return { ratio, classification };
}

// ============= Main Engine Function =============

export function calculateAuctionEngine(
  allBars: OHLCVBar[],
  ltp: number,
  atr: number,
  geometryLevels: number[],
  valueAreaPercent: number = 70
): AuctionEngineResult {
  // Detect sessions
  const session = detectSessions(allBars);
  const sessionBars = allBars.slice(session.sessionStartIndex);
  const sessionOpen = session.sessionOpen;

  // Price vs Open
  const priceVsOpen = atr > 0 ? (ltp - sessionOpen) / atr : 0;

  // Build volume profile (session only)
  const volumeProfile = buildVolumeProfile(sessionBars, atr);

  // Calculate all metrics
  const poc = calculatePOC(volumeProfile);
  const valueArea = calculateValueArea(volumeProfile, valueAreaPercent);
  const vwap = calculateSessionVWAP(sessionBars, ltp, atr);
  const range = calculateSessionRange(sessionBars, ltp);
  const volumeConcentration = calculateVolumeConcentration(volumeProfile);
  const volumeAtLevels = calculateVolumeAtLevels(volumeProfile, geometryLevels.slice(0, 10), atr);
  const compression = calculateCompression(allBars, 20);
  const effortResult = calculateEffortResult(sessionBars, atr);

  return {
    session,
    sessionOpen,
    priceVsOpen,
    vwap,
    range,
    volumeProfile,
    poc,
    valueArea,
    volumeConcentration,
    volumeAtLevels,
    compression,
    effortResult,
    formulas: auctionFormulas
  };
}

// ============= Formula Documentation =============

export const auctionFormulas = {
  vwap: {
    name: 'Session VWAP',
    formula: 'VWAP = Σ((O+H+L+C)/4 × Volume) / Σ(Volume)',
    interpretation: 'Volume-weighted average price anchored to session open',
    limitation: 'Resets at session open; sensitive to volume spikes',
    useCase: 'Measures fair value based on volume participation'
  },
  poc: {
    name: 'Point of Control (POC)',
    formula: 'POC = price_bin with maximum accumulated volume',
    interpretation: 'The price level where most trading activity occurred this session',
    limitation: 'Bar-based proxy for tick volume distribution',
    useCase: 'Identifies the "fairest" price of the session'
  },
  valueArea: {
    name: 'Value Area (VA)',
    formula: 'Smallest price range containing target% of session volume',
    interpretation: 'The range where market found price acceptance this session',
    limitation: 'Percentage threshold is configurable (default 70%)',
    useCase: 'Defines accepted vs rejected price zones'
  },
  rangePosition: {
    name: 'Range Position',
    formula: 'Position = (LTP - session_low) / session_range',
    interpretation: 'Where price sits within the session range (0% = low, 100% = high)',
    limitation: 'Only considers current session',
    useCase: 'Contextualizes price location within session extremes'
  },
  initialBalance: {
    name: 'Initial Balance (IB)',
    formula: 'IB = High(first N bars) - Low(first N bars)',
    interpretation: 'Early session range that often sets the day\'s context',
    limitation: 'N is configurable (default 4 bars)',
    useCase: 'Reference for session expansion/contraction'
  },
  volumeConcentration: {
    name: 'Volume Concentration',
    formula: 'Concentration = top_3_bins_volume / total_session_volume',
    interpretation: 'How concentrated trading is at specific price levels',
    limitation: 'High concentration may indicate acceptance or rejection',
    useCase: 'Identifies whether volume is focused or distributed'
  },
  compression: {
    name: 'Compression Ratio',
    formula: 'Ratio = current_range / average_range[N bars]',
    interpretation: 'Measures range contraction or expansion vs historical norm',
    limitation: 'Lookback-dependent (default 20 bars)',
    useCase: 'Identifies potential volatility expansion/contraction'
  },
  effortResult: {
    name: 'Effort vs Result',
    formula: 'Ratio = (price_change / ATR) / (volume / avg_volume)',
    interpretation: 'Compares price movement to volume effort',
    limitation: 'Uses normalized values for comparability',
    useCase: 'Identifies divergence between effort and outcome'
  },
  priceVsOpen: {
    name: 'Price vs Open',
    formula: '(LTP - Session_Open) / ATR',
    interpretation: 'Normalized distance from session opening price',
    limitation: 'Resets daily; session detection may vary',
    useCase: 'Core directional context anchor'
  }
};