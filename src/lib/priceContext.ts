// ============= Price Context Layer =============
// For Forex and Commodities - No Volume Data
// Mathematical observations of price distribution and session context

export interface OHLCBar {
  timestamp?: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PriceContextResult {
  sessionOpen: number;
  priceVsOpen: number;  // (LTP - sessionOpen) / ATR
  sessionHigh: number;
  sessionLow: number;
  sessionRange: number;
  rangePosition: number; // Where LTP sits in range (0-1)
  sessionStartIndex: number;
}

// Session Detection
export function isNewSession(
  currentTimestamp: string | undefined,
  previousTimestamp: string | undefined
): boolean {
  if (!currentTimestamp || !previousTimestamp) return false;

  const currentDate = currentTimestamp.split('T')[0] || currentTimestamp.split(' ')[0];
  const previousDate = previousTimestamp.split('T')[0] || previousTimestamp.split(' ')[0];

  return currentDate !== previousDate;
}

// Find session start index
export function findSessionStartIndex(ohlc: OHLCBar[]): number {
  if (ohlc.length === 0) return 0;

  if (ohlc[0].timestamp) {
    for (let i = ohlc.length - 1; i > 0; i--) {
      if (isNewSession(ohlc[i].timestamp, ohlc[i - 1].timestamp)) {
        return i;
      }
    }
  }

  const minBarsForSession = Math.min(10, Math.floor(ohlc.length * 0.2));
  return Math.max(0, ohlc.length - minBarsForSession);
}

// Calculate price context (no volume required)
export function calculatePriceContext(
  ohlc: OHLCBar[],
  ltp: number,
  atr: number
): PriceContextResult {
  const sessionStartIndex = findSessionStartIndex(ohlc);
  const sessionData = ohlc.slice(sessionStartIndex);

  const sessionOpen = sessionData.length > 0 ? sessionData[0].open : ltp;
  const sessionHigh = sessionData.length > 0 ? Math.max(...sessionData.map(b => b.high)) : ltp;
  const sessionLow = sessionData.length > 0 ? Math.min(...sessionData.map(b => b.low)) : ltp;
  const sessionRange = sessionHigh - sessionLow;

  const priceVsOpen = atr > 0 ? (ltp - sessionOpen) / atr : 0;
  const rangePosition = sessionRange > 0 ? (ltp - sessionLow) / sessionRange : 0.5;

  return {
    sessionOpen,
    priceVsOpen,
    sessionHigh,
    sessionLow,
    sessionRange,
    rangePosition,
    sessionStartIndex
  };
}

// Price distribution statistics
export interface PriceStats {
  mean: number;
  median: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  n: number;
}

export function calculatePriceStats(closes: number[]): PriceStats | null {
  if (closes.length < 3) return null;

  const n = closes.length;
  const sorted = [...closes].sort((a, b) => a - b);

  const mean = closes.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const variance = closes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const skewness = stdDev > 0
    ? closes.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n
    : 0;

  const kurtosis = stdDev > 0
    ? (closes.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n) - 3
    : 0;

  return {
    mean,
    median,
    stdDev,
    skewness,
    kurtosis,
    min: sorted[0],
    max: sorted[n - 1],
    n
  };
}

// Formula documentation
export const priceContextFormulas = {
  mean: {
    name: 'Mean (μ)',
    formula: 'Σ(close) / n',
    interpretation: 'Average closing price over the period',
    limitation: 'Sensitive to outliers'
  },
  median: {
    name: 'Median',
    formula: 'Middle value when sorted',
    interpretation: 'Central tendency resistant to outliers',
    limitation: 'May not reflect recent price action'
  },
  stdDev: {
    name: 'Standard Deviation (σ)',
    formula: '√(Σ(x - μ)² / n)',
    interpretation: 'Measure of price dispersion around the mean',
    limitation: 'Assumes roughly normal distribution'
  },
  skewness: {
    name: 'Skewness',
    formula: 'Σ((x - μ)/σ)³ / n',
    interpretation: 'Asymmetry of distribution (+ve = right tail, -ve = left tail)',
    limitation: 'Sensitive to sample size'
  },
  kurtosis: {
    name: 'Excess Kurtosis',
    formula: 'Σ((x - μ)/σ)⁴ / n - 3',
    interpretation: 'Tail heaviness (+ve = fat tails, -ve = thin tails)',
    limitation: 'Normal distribution has kurtosis of 0'
  },
  zScore: {
    name: 'Z-Score',
    formula: '(LTP - μ) / σ',
    interpretation: 'How many standard deviations LTP is from mean',
    limitation: 'Assumes stable distribution'
  }
};
