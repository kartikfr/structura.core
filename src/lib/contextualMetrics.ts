// ============= Contextual Metrics Layer =============
// Read-only, non-predictive market structure annotations
// Now with SESSION ANCHORING for mathematical correctness

export interface OHLCVWithVolume {
  open?: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp?: string;
}

export interface ContextualMetricsResult {
  vwapDistance: { value: number; classification: string; vwap: number };
  efficiencyRatio: { value: number; classification: string };
  varianceRatio: { value: number; classification: string };
  zScoreStretch: { value: number; classification: string };
  sessionContext: { session: string; behavior: string };
  structureDensity: { count: number; classification: string };
}

// Session Detection - find session start
export function findSessionStartIndex(ohlcv: OHLCVWithVolume[]): number {
  if (ohlcv.length === 0) return 0;

  // If we have timestamps, find last session boundary
  if (ohlcv[0].timestamp) {
    for (let i = ohlcv.length - 1; i > 0; i--) {
      const currentDate = ohlcv[i].timestamp?.split('T')[0] || ohlcv[i].timestamp?.split(' ')[0];
      const previousDate = ohlcv[i - 1].timestamp?.split('T')[0] || ohlcv[i - 1].timestamp?.split(' ')[0];
      if (currentDate !== previousDate) {
        return i;
      }
    }
  }

  // If no timestamps or no session boundary found, use heuristic
  const minBarsForSession = Math.min(10, Math.floor(ohlcv.length * 0.2));
  return Math.max(0, ohlcv.length - minBarsForSession);
}

// 1. SESSION ANCHORED VWAP Distance
// D_vwap = (LTP - Session_VWAP) / ATR
export function calculateVWAPDistance(
  ohlcv: OHLCVWithVolume[],
  ltp: number,
  atr: number
): { value: number; classification: string; vwap: number } {
  const sessionStartIndex = findSessionStartIndex(ohlcv);
  const sessionData = ohlcv.slice(sessionStartIndex);

  if (sessionData.length === 0) {
    return { value: 0, classification: 'Insufficient data', vwap: ltp };
  }

  // Calculate SESSION VWAP: sum(TypicalPrice * Volume) / sum(Volume)
  let sumPV = 0;
  let sumV = 0;

  sessionData.forEach(bar => {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    const volume = bar.volume || 1; // Default to 1 if no volume data
    sumPV += typicalPrice * volume;
    sumV += volume;
  });

  const sessionVWAP = sumV > 0 ? sumPV / sumV : ltp;
  const distance = atr > 0 ? (ltp - sessionVWAP) / atr : 0;

  // Classification (fixed thresholds)
  let classification: string;
  const absDistance = Math.abs(distance);

  if (absDistance < 0.5) {
    classification = 'Balanced';
  } else if (absDistance < 1.5) {
    classification = 'Initiative';
  } else {
    classification = 'Extended';
  }

  return { value: distance, classification, vwap: sessionVWAP };
}

// 2. Efficiency Ratio (ER) - Formal Definition
// ER_t(n) = |C_t - C_{t-n}| / Σ|C_{t-i+1} - C_{t-i}|
// Properties: Bounded [0,1], Scale-invariant, Dimensionless
export function calculateEfficiencyRatio(
  closes: number[],
  lookback: number = 50
): { value: number; classification: string } {
  const n = Math.min(closes.length, lookback);
  if (n < 2) return { value: 0.5, classification: 'Insufficient data' };

  const subset = closes.slice(-n);

  // Net change: |C_t - C_{t-n}|
  const netChange = Math.abs(subset[subset.length - 1] - subset[0]);

  // Total path: Σ|C_{t-i+1} - C_{t-i}|
  let totalPath = 0;
  for (let i = 1; i < subset.length; i++) {
    totalPath += Math.abs(subset[i] - subset[i - 1]);
  }

  // Edge case handling per formal specification
  let er: number;
  if (totalPath === 0) {
    er = 1; // All closes equal - perfect efficiency
  } else if (netChange === 0) {
    er = 0; // No net movement despite path
  } else {
    er = netChange / totalPath;
  }

  // Formal classification (Rule 1: Efficiency Classification)
  let classification: string;
  if (er > 0.6) {
    classification = 'Structured';
  } else if (er >= 0.4) {
    classification = 'Diffusive';
  } else {
    classification = 'Noisy';
  }

  return { value: Math.max(0, Math.min(1, er)), classification };
}

// 3. Variance Ratio (VR) - Formal Definition with UNBIASED variance
// VR_t(k,n) = V[r^(k)] / (k × V[r])
// where V[X] = (1/(|X|-1)) × Σ(x - x̄)² (UNBIASED sample variance)
// Statistical Properties under random walk: E[VR] = 1, V[VR] ≈ 2(2k-1)(k-1)/(3kn)
export function calculateVarianceRatio(
  closes: number[],
  k: number = 5
): { value: number; classification: string } {
  if (closes.length < k + 10) return { value: 1, classification: 'Insufficient data' };

  // Calculate 1-period log returns
  const returns1: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns1.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  // Calculate k-period overlapping returns
  const returnsK: number[] = [];
  for (let i = k; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - k] > 0) {
      returnsK.push(Math.log(closes[i] / closes[i - k]));
    }
  }

  if (returns1.length < 2 || returnsK.length < 2) {
    return { value: 1, classification: 'Insufficient data' };
  }

  // UNBIASED sample variance: V[X] = (1/(|X|-1)) × Σ(x - x̄)²
  const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
  const var1 = returns1.reduce((sum, r) => sum + Math.pow(r - mean1, 2), 0) / (returns1.length - 1);

  const meanK = returnsK.reduce((a, b) => a + b, 0) / returnsK.length;
  const varK = returnsK.reduce((sum, r) => sum + Math.pow(r - meanK, 2), 0) / (returnsK.length - 1);

  // Variance ratio: VR = Var(k) / (k × Var(1))
  const vr = var1 > 0 ? varK / (k * var1) : 1;

  // Formal classification
  let classification: string;
  if (vr > 1.15) {
    classification = 'Trending';
  } else if (vr < 0.85) {
    classification = 'Mean-reverting';
  } else {
    classification = 'Random';
  }

  return { value: vr, classification };
}

// 4. Z-Score Stretch
// Z = (LTP - μ_20) / σ_20
export function calculateZScoreStretch(
  closes: number[],
  ltp: number,
  lookback: number = 20
): { value: number; classification: string } {
  const n = Math.min(closes.length, lookback);
  if (n < 5) return { value: 0, classification: 'Insufficient data' };

  const subset = closes.slice(-n);

  // Mean
  const mean = subset.reduce((a, b) => a + b, 0) / n;

  // Standard deviation
  const variance = subset.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / n;
  const std = Math.sqrt(variance);

  const z = std > 0 ? (ltp - mean) / std : 0;

  // Classification
  let classification: string;
  if (Math.abs(z) < 1.5) {
    classification = 'Neutral';
  } else {
    classification = 'Stretched';
  }

  return { value: z, classification };
}

// 5. Session Context
// Based on UTC time
export function getSessionContext(): { session: string; behavior: string } {
  const now = new Date();
  const utcHour = now.getUTCHours();

  if (utcHour >= 0 && utcHour < 6) {
    return { session: 'Asia', behavior: 'Range-bound' };
  } else if (utcHour >= 7 && utcHour < 13) {
    return { session: 'London', behavior: 'Breakout-prone' };
  } else if (utcHour >= 13 && utcHour < 20) {
    return { session: 'New York', behavior: 'Continuation-prone' };
  } else {
    return { session: 'Overnight', behavior: 'Thin/Volatile' };
  }
}

// 6. Structure Density
// Count of zones within ATR distance of LTP
export function calculateStructureDensity(
  allLevelPrices: number[],
  ltp: number,
  atr: number
): { count: number; classification: string } {
  const tolerance = atr > 0 ? atr : ltp * 0.01;

  const nearbyCount = allLevelPrices.filter(
    price => Math.abs(price - ltp) <= tolerance
  ).length;

  // Classification
  let classification: string;
  if (nearbyCount <= 2) {
    classification = 'Clean structure';
  } else if (nearbyCount <= 5) {
    classification = 'Moderate';
  } else {
    classification = 'High noise';
  }

  return { count: nearbyCount, classification };
}

// Main calculator function
export function calculateContextualMetrics(
  ohlcv: OHLCVWithVolume[],
  ltp: number,
  atr: number,
  allLevelPrices: number[]
): ContextualMetricsResult {
  const closes = ohlcv.map(b => b.close);

  return {
    vwapDistance: calculateVWAPDistance(ohlcv, ltp, atr),
    efficiencyRatio: calculateEfficiencyRatio(closes, 50),
    varianceRatio: calculateVarianceRatio(closes, 5),
    zScoreStretch: calculateZScoreStretch(closes, ltp, 20),
    sessionContext: getSessionContext(),
    structureDensity: calculateStructureDensity(allLevelPrices, ltp, atr)
  };
}

// Formula documentation for tooltips - Updated with formal definitions
export const metricFormulas = {
  vwapDistance: {
    name: 'Session VWAP Distance',
    formula: '(Price - Session_VWAP) / ATR',
    interpretation: 'Measures deviation from session volume-weighted fair price',
    limitation: 'Resets at session open, sensitive to volume spikes'
  },
  efficiencyRatio: {
    name: 'Price Efficiency Metric',
    formula: 'ER_t(n) = |C_t - C_{t-n}| / Σ|C_{t-i+1} - C_{t-i}|',
    interpretation: 'Bounded [0,1]. Structured (>0.6), Diffusive (0.4-0.6), Noisy (<0.4)',
    limitation: 'Path-dependent, sensitive to lookback period'
  },
  varianceRatio: {
    name: 'Variance Ratio (Lo-MacKinlay)',
    formula: 'VR = V[r^(k)] / (k × V[r]) using UNBIASED variance',
    interpretation: 'Tests random walk. Trending (>1.15), Mean-reverting (<0.85), Random',
    limitation: 'Assumes log-normal returns, E[VR]=1 under random walk'
  },
  zScoreStretch: {
    name: 'Z-Score Stretch',
    formula: '(Price - μ₂₀) / σ₂₀',
    interpretation: 'Statistical extension from recent mean in standard deviations',
    limitation: 'Assumes normal distribution, may miss regime changes'
  },
  sessionContext: {
    name: 'Session Context',
    formula: 'UTC time-based classification',
    interpretation: 'Labels typical behavior patterns by trading session',
    limitation: 'Generalized patterns, individual sessions may vary'
  },
  structureDensity: {
    name: 'Structure Density',
    formula: 'Count(zones within ATR of price)',
    interpretation: 'Measures zone congestion near current price',
    limitation: 'Dependent on geometry engine zone count'
  }
};
