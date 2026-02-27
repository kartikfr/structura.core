// ============= Auction & Volume Context Layer =============
// Mathematical observations of volume distribution and price acceptance
// Read-only, non-predictive, descriptive only
// Now with SESSION ANCHORING for mathematical correctness

export interface VolumeAtPriceBin {
  priceCenter: number;
  volume: number;
}

export interface SessionContext {
  sessionOpen: number;
  priceVsOpen: number;  // (LTP - sessionOpen) / ATR
  sessionVWAP: number;
  vwapDeviation: number;  // (LTP - sessionVWAP) / ATR
  overnightGap: number;  // (sessionOpen - prevClose) / ATR
  sessionStartIndex: number;
}

export interface AuctionContextResult {
  poc: number; // Point of Control
  valueArea: { vah: number; val: number; percent: number };
  volumeSkew: { raw: number; normalized: number };
  vwapDeviation: { value: number; classification: string; vwap: number };
  volumeConcentration: number;
  valueMigration: { shift: number; classification: string };
  volumeAtGeometryLevels: Array<{
    level: number;
    volume: number;
    significance: number;
    classification: string;
  }>;
  sessionContext: SessionContext;
  volumeProfile: VolumeAtPriceBin[];
}

export interface OHLCVBar {
  timestamp?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Session Detection
// Detects if a new session has started based on date change
export function isNewSession(
  currentTimestamp: string | undefined,
  previousTimestamp: string | undefined
): boolean {
  if (!currentTimestamp || !previousTimestamp) return false;

  // Extract date portion (YYYY-MM-DD)
  const currentDate = currentTimestamp.split('T')[0] || currentTimestamp.split(' ')[0];
  const previousDate = previousTimestamp.split('T')[0] || previousTimestamp.split(' ')[0];

  return currentDate !== previousDate;
}

// Find session start index in OHLCV array
export function findSessionStartIndex(ohlcv: OHLCVBar[]): number {
  if (ohlcv.length === 0) return 0;

  // If we have timestamps, find last session boundary
  if (ohlcv[0].timestamp) {
    for (let i = ohlcv.length - 1; i > 0; i--) {
      if (isNewSession(ohlcv[i].timestamp, ohlcv[i - 1].timestamp)) {
        return i;
      }
    }
  }

  // If no timestamps or no session boundary found, use heuristic:
  // For intraday data, assume last 20% is current session
  // For daily data, use entire dataset
  const minBarsForSession = Math.min(10, Math.floor(ohlcv.length * 0.2));
  return Math.max(0, ohlcv.length - minBarsForSession);
}

// 1. Volume-at-Price Distribution (SESSION ANCHORED)
// Since tick data is unavailable, distribute volume proportionally across each bar's price range
export function buildVolumeProfile(
  ohlcv: OHLCVBar[],
  atr: number,
  sessionStartIndex: number = 0
): VolumeAtPriceBin[] {
  const sessionData = ohlcv.slice(sessionStartIndex);
  if (sessionData.length === 0) return [];

  // Calculate bin size: max(0.25 × ATR, minimum_tick)
  const minTick = 0.01;
  const binSize = Math.max(0.25 * atr, minTick * 5);

  // Create bins
  const bins: Map<number, number> = new Map();

  sessionData.forEach(bar => {
    const range = bar.high - bar.low;

    if (range === 0) {
      // All volume at single price
      const binCenter = Math.floor(bar.close / binSize) * binSize + binSize / 2;
      bins.set(binCenter, (bins.get(binCenter) || 0) + bar.volume);
    } else {
      // Distribute volume across range
      const volumePerUnit = bar.volume / range;

      for (let price = bar.low; price <= bar.high; price += binSize) {
        const binCenter = Math.floor(price / binSize) * binSize + binSize / 2;
        const contribution = volumePerUnit * binSize;
        bins.set(binCenter, (bins.get(binCenter) || 0) + contribution);
      }
    }
  });

  // Convert to array and sort by price
  const result: VolumeAtPriceBin[] = [];
  bins.forEach((volume, priceCenter) => {
    result.push({ priceCenter, volume });
  });

  return result.sort((a, b) => a.priceCenter - b.priceCenter);
}

// 2. Point of Control (POC)
// POC = price_bin with maximum accumulated volume
export function calculatePOC(volumeProfile: VolumeAtPriceBin[]): number {
  if (volumeProfile.length === 0) return 0;

  let maxVolume = 0;
  let poc = volumeProfile[0].priceCenter;

  volumeProfile.forEach(bin => {
    if (bin.volume > maxVolume) {
      maxVolume = bin.volume;
      poc = bin.priceCenter;
    }
  });

  return poc;
}

// 3. Value Area (VA) - SESSION BOUNDED
// Price range containing a fixed percentage of total volume (default 70%)
export function calculateValueArea(
  volumeProfile: VolumeAtPriceBin[],
  targetPercent: number = 0.70
): { vah: number; val: number; percent: number } {
  if (volumeProfile.length === 0) {
    return { vah: 0, val: 0, percent: 0 };
  }

  const totalVolume = volumeProfile.reduce((sum, b) => sum + b.volume, 0);
  const targetVolume = totalVolume * targetPercent;

  // Sort bins by volume descending
  const sortedByVolume = [...volumeProfile].sort((a, b) => b.volume - a.volume);

  // Accumulate bins until target percentage reached
  let accumulatedVolume = 0;
  const includedPrices: number[] = [];

  for (const bin of sortedByVolume) {
    if (accumulatedVolume >= targetVolume) break;
    accumulatedVolume += bin.volume;
    includedPrices.push(bin.priceCenter);
  }

  if (includedPrices.length === 0) {
    return { vah: 0, val: 0, percent: 0 };
  }

  const vah = Math.max(...includedPrices);
  const val = Math.min(...includedPrices);
  const actualPercent = accumulatedVolume / totalVolume;

  return { vah, val, percent: actualPercent };
}

// 4. Volume Skew (Normalized)
export function calculateVolumeSkew(
  volumeProfile: VolumeAtPriceBin[],
  poc: number,
  priceRange: number,
  atr: number
): { raw: number; normalized: number } {
  if (volumeProfile.length === 0 || atr === 0) {
    return { raw: 0, normalized: 0 };
  }

  let volumeUp = 0;
  let volumeDown = 0;

  volumeProfile.forEach(bin => {
    if (bin.priceCenter > poc) {
      volumeUp += bin.volume;
    } else if (bin.priceCenter < poc) {
      volumeDown += bin.volume;
    }
  });

  const totalSideVolume = volumeUp + volumeDown;
  const rawSkew = totalSideVolume > 0
    ? (volumeUp - volumeDown) / totalSideVolume
    : 0;

  const normalizedSkew = rawSkew * (priceRange / atr);

  return { raw: rawSkew, normalized: normalizedSkew };
}

// 5. SESSION ANCHORED VWAP
// VWAP = Σ(typical_price × volume) / Σ(volume), reset at session start
export function calculateSessionVWAP(
  ohlcv: OHLCVBar[],
  sessionStartIndex: number
): number {
  const sessionData = ohlcv.slice(sessionStartIndex);
  if (sessionData.length === 0) return 0;

  let sumPV = 0;
  let sumV = 0;

  sessionData.forEach(bar => {
    // Typical Price = (High + Low + Close) / 3
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    sumPV += typicalPrice * bar.volume;
    sumV += bar.volume;
  });

  return sumV > 0 ? sumPV / sumV : sessionData[sessionData.length - 1].close;
}

// 5b. Session VWAP Deviation
export function calculateVWAPDeviation(
  sessionVWAP: number,
  ltp: number,
  atr: number
): { value: number; classification: string; vwap: number } {
  if (atr === 0) {
    return { value: 0, classification: 'Insufficient data', vwap: sessionVWAP };
  }

  const deviation = (ltp - sessionVWAP) / atr;

  // Classification
  const absDeviation = Math.abs(deviation);
  let classification: string;
  if (absDeviation < 0.5) {
    classification = 'At Value';
  } else if (absDeviation < 1.5) {
    classification = 'Moderate';
  } else {
    classification = 'Extended';
  }

  return { value: deviation, classification, vwap: sessionVWAP };
}

// 6. Volume Concentration Ratio
// top_3_bins_volume / total_volume
export function calculateVolumeConcentration(
  volumeProfile: VolumeAtPriceBin[]
): number {
  if (volumeProfile.length === 0) return 0;

  const totalVolume = volumeProfile.reduce((sum, b) => sum + b.volume, 0);
  if (totalVolume === 0) return 0;

  const sortedByVolume = [...volumeProfile].sort((a, b) => b.volume - a.volume);
  const top3Volume = sortedByVolume
    .slice(0, 3)
    .reduce((sum, b) => sum + b.volume, 0);

  return top3Volume / totalVolume;
}

// 7. Value Migration (SESSION BOUNDED)
// POC_shift = (POC_current - POC_previous) / ATR
export function calculateValueMigration(
  ohlcv: OHLCVBar[],
  atr: number,
  sessionStartIndex: number
): { shift: number; classification: string } {
  const sessionData = ohlcv.slice(sessionStartIndex);
  if (sessionData.length < 6 || atr === 0) {
    return { shift: 0, classification: 'Insufficient data' };
  }

  // Split session data into two halves
  const midpoint = Math.floor(sessionData.length / 2);
  const firstHalf = sessionData.slice(0, midpoint);
  const secondHalf = sessionData.slice(midpoint);

  const profile1 = buildVolumeProfile(firstHalf, atr, 0);
  const profile2 = buildVolumeProfile(secondHalf, atr, 0);

  const poc1 = calculatePOC(profile1);
  const poc2 = calculatePOC(profile2);

  const shift = (poc2 - poc1) / atr;

  // Classification
  const absShift = Math.abs(shift);
  let classification: string;
  if (absShift < 0.5) {
    classification = 'Stable';
  } else if (absShift < 1.5) {
    classification = 'Migrating';
  } else {
    classification = 'Shifting';
  }

  return { shift, classification };
}

// 8. Volume at Geometry Levels
export function calculateVolumeAtGeometryLevels(
  volumeProfile: VolumeAtPriceBin[],
  geometryLevels: number[],
  atr: number
): Array<{
  level: number;
  volume: number;
  significance: number;
  classification: string;
}> {
  if (volumeProfile.length === 0 || geometryLevels.length === 0) {
    return [];
  }

  // Dynamic threshold: max(tick_size × 3, ATR × 0.25)
  const minTick = 0.01;
  const threshold = Math.max(minTick * 3, atr * 0.25);

  // Average volume per bin
  const totalVolume = volumeProfile.reduce((sum, b) => sum + b.volume, 0);
  const avgVolumePerBin = totalVolume / volumeProfile.length;

  return geometryLevels.map(level => {
    // Sum volume near level
    const volumeNearLevel = volumeProfile
      .filter(bin => Math.abs(bin.priceCenter - level) <= threshold)
      .reduce((sum, b) => sum + b.volume, 0);

    const significance = avgVolumePerBin > 0
      ? volumeNearLevel / avgVolumePerBin
      : 0;

    // Classification
    let classification: string;
    if (significance > 1.5) {
      classification = 'High acceptance';
    } else if (significance < 0.5) {
      classification = 'Low participation';
    } else {
      classification = 'Moderate';
    }

    return { level, volume: volumeNearLevel, significance, classification };
  });
}

// Session Context Calculator
export function calculateSessionContext(
  ohlcv: OHLCVBar[],
  ltp: number,
  atr: number,
  sessionStartIndex: number
): SessionContext {
  // Session Open = first bar open of current session
  const sessionOpen = sessionStartIndex < ohlcv.length
    ? ohlcv[sessionStartIndex].open
    : ltp;

  // Price vs Open = (LTP - sessionOpen) / ATR
  const priceVsOpen = atr > 0 ? (ltp - sessionOpen) / atr : 0;

  // Session VWAP
  const sessionVWAP = calculateSessionVWAP(ohlcv, sessionStartIndex);

  // VWAP Deviation = (LTP - sessionVWAP) / ATR
  const vwapDeviation = atr > 0 ? (ltp - sessionVWAP) / atr : 0;

  // Overnight Gap = (sessionOpen - previousClose) / ATR
  const prevClose = sessionStartIndex > 0
    ? ohlcv[sessionStartIndex - 1].close
    : sessionOpen;
  const overnightGap = atr > 0 ? (sessionOpen - prevClose) / atr : 0;

  return {
    sessionOpen,
    priceVsOpen,
    sessionVWAP,
    vwapDeviation,
    overnightGap,
    sessionStartIndex
  };
}

// Main calculator function (SESSION ANCHORED)
export function calculateAuctionContext(
  ohlcv: OHLCVBar[],
  ltp: number,
  atr: number,
  geometryLevels: number[]
): AuctionContextResult {
  // Find session boundary
  const sessionStartIndex = findSessionStartIndex(ohlcv);

  // Build session-anchored volume profile
  const volumeProfile = buildVolumeProfile(ohlcv, atr, sessionStartIndex);
  const poc = calculatePOC(volumeProfile);
  const valueArea = calculateValueArea(volumeProfile, 0.70);

  // Calculate session context
  const sessionContext = calculateSessionContext(ohlcv, ltp, atr, sessionStartIndex);

  // Price range (session only)
  const sessionData = ohlcv.slice(sessionStartIndex);
  const allHighs = sessionData.map(b => b.high);
  const allLows = sessionData.map(b => b.low);
  const priceRange = sessionData.length > 0
    ? Math.max(...allHighs) - Math.min(...allLows)
    : 0;

  const volumeSkew = calculateVolumeSkew(volumeProfile, poc, priceRange, atr);
  const vwapDeviation = calculateVWAPDeviation(sessionContext.sessionVWAP, ltp, atr);
  const volumeConcentration = calculateVolumeConcentration(volumeProfile);
  const valueMigration = calculateValueMigration(ohlcv, atr, sessionStartIndex);

  // Take top geometry levels for volume analysis
  const topGeometryLevels = geometryLevels.slice(0, 10);
  const volumeAtGeometryLevels = calculateVolumeAtGeometryLevels(
    volumeProfile,
    topGeometryLevels,
    atr
  );

  return {
    poc,
    valueArea,
    volumeSkew,
    vwapDeviation,
    volumeConcentration,
    valueMigration,
    volumeAtGeometryLevels,
    sessionContext,
    volumeProfile
  };
}

// Formula documentation for tooltips
export const auctionFormulas = {
  poc: {
    name: 'Point of Control (POC)',
    formula: 'Price bin with maximum accumulated volume (session-anchored)',
    interpretation: 'The price level where most trading activity occurred this session',
    limitation: 'Bar-based proxy for tick volume distribution'
  },
  valueArea: {
    name: 'Value Area',
    formula: 'Price range containing 70% of session volume (VAH/VAL)',
    interpretation: 'The range where market found price acceptance this session',
    limitation: 'Percentage threshold is fixed, not adaptive'
  },
  volumeSkew: {
    name: 'Volume Skew',
    formula: '(V_up - V_down) / (V_up + V_down) × (range/ATR)',
    interpretation: 'Measures volume distribution bias above/below POC',
    limitation: 'Normalized skew depends on price range context'
  },
  vwapDeviation: {
    name: 'Session VWAP Deviation',
    formula: '(LTP - Session_VWAP) / ATR',
    interpretation: 'Distance from session volume-weighted average price',
    limitation: 'Resets at each session open'
  },
  volumeConcentration: {
    name: 'Volume Concentration',
    formula: 'Top 3 bins volume / Total session volume',
    interpretation: 'How concentrated trading is at specific price levels',
    limitation: 'High concentration may indicate acceptance or rejection'
  },
  valueMigration: {
    name: 'Value Migration',
    formula: '(POC_current - POC_previous) / ATR',
    interpretation: 'Direction and magnitude of value area shift within session',
    limitation: 'Session-split based calculation'
  },
  volumeAtLevels: {
    name: 'Volume at Geometry Levels',
    formula: 'Volume near level / Average volume per bin',
    interpretation: 'Significance of volume activity at structural levels',
    limitation: 'Threshold-dependent, uses ATR-based proximity'
  },
  sessionOpen: {
    name: 'Session Open',
    formula: 'First bar open price of current session',
    interpretation: 'The anchor price for session-based calculations',
    limitation: 'Requires proper session detection'
  },
  priceVsOpen: {
    name: 'Price vs Session Open',
    formula: '(LTP - Session_Open) / ATR',
    interpretation: 'Current price position relative to session opening price',
    limitation: 'Session boundary detection affects accuracy'
  },
  overnightGap: {
    name: 'Overnight Gap',
    formula: '(Session_Open - Previous_Close) / ATR',
    interpretation: 'Size of gap between sessions in ATR units',
    limitation: 'Only meaningful with multiple sessions in data'
  }
};
