// ============= TIME-DOMAIN METRICS (PHASE-1) =============
// Deterministic, audit-friendly metrics derived from OHLC + timestamps.
// No volume logic. No optimization. No predictive claims.

export interface TimeDomainMetricStatus<T> {
  status: 'active' | 'disabled';
  value?: T;
  reason?: string;
  // Audit Mode: raw inputs used for the computation (auditor recomputation aid)
  inputs?: Record<string, number | string>;
}

export interface BasicOHLCBar {
  timestamp?: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Deterministic anchor containment rule:
// anchor_index = first bar where Low ≤ Anchor ≤ High
export function locateAnchorIndex(
  bars: BasicOHLCBar[],
  anchorPrice: number
): number | null {
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    if (!Number.isFinite(b.low) || !Number.isFinite(b.high)) continue;
    if (b.low <= anchorPrice && anchorPrice <= b.high) return i;
  }
  return null;
}

/**
 * Temporal Symmetry (Anchor-Based)
 * temporal_symmetry_ratio = min(bars_before, bars_after) / max(bars_before, bars_after)
 * Domain: [0, 1]
 */
export function computeTemporalSymmetry(
  bars: BasicOHLCBar[],
  anchorPrice: number,
  minimumBars: number = 50
): TimeDomainMetricStatus<number> {
  if (!bars || bars.length < minimumBars) {
    return {
      status: 'disabled',
      reason: 'Insufficient temporal context',
      inputs: { N: bars?.length ?? 0, minimumBars }
    };
  }

  const anchorIndex = locateAnchorIndex(bars, anchorPrice);
  if (anchorIndex === null) {
    return {
      status: 'disabled',
      reason: 'Anchor cannot be located in series',
      inputs: { N: bars.length, anchorPrice, minimumBars }
    };
  }

  const N = bars.length;
  const barsBefore = anchorIndex;
  const barsAfter = N - anchorIndex - 1;
  const denom = Math.max(barsBefore, barsAfter);
  const ratio = denom === 0 ? 0 : Math.min(barsBefore, barsAfter) / denom;

  return {
    status: 'active',
    value: ratio,
    inputs: {
      N,
      anchorPrice,
      anchor_index: anchorIndex,
      bars_before: barsBefore,
      bars_after: barsAfter
    }
  };
}

/**
 * Bar-Normalized Price Range
 * bar_normalized_range = (max(high) - min(low)) / N
 */
export function computeBarNormalizedRange(
  bars: BasicOHLCBar[],
  minimumBars: number = 50
): TimeDomainMetricStatus<number> {
  if (!bars || bars.length < minimumBars) {
    return {
      status: 'disabled',
      reason: 'Insufficient price history',
      inputs: { N: bars?.length ?? 0, minimumBars }
    };
  }

  let hMax = -Infinity;
  let lMin = Infinity;

  for (const b of bars) {
    if (!Number.isFinite(b.high) || !Number.isFinite(b.low)) {
      return {
        status: 'disabled',
        reason: 'High/Low missing',
        inputs: { N: bars.length, minimumBars }
      };
    }
    if (b.high > hMax) hMax = b.high;
    if (b.low < lMin) lMin = b.low;
  }

  const N = bars.length;
  const priceRange = hMax - lMin;
  return {
    status: 'active',
    value: priceRange / N,
    inputs: {
      N,
      H_max: hMax,
      L_min: lMin,
      price_range: priceRange
    }
  };
}

/**
 * Temporal–Price Compression Ratio (Phase-1 optional)
 * Locked definition:
 *   T_window = total time span in seconds
 *   temporal_density = N / T_window
 *   price_density    = price_range / T_window
 *   compression_ratio = price_density / temporal_density
 */
export function computeTemporalPriceCompressionRatio(
  bars: BasicOHLCBar[],
  minimumBars: number = 50
): TimeDomainMetricStatus<number> {
  if (!bars || bars.length < minimumBars) {
    return {
      status: 'disabled',
      reason: 'Undefined temporal window',
      inputs: { N: bars?.length ?? 0, minimumBars }
    };
  }

  const timestamps = bars
    .map(b => b.timestamp)
    .filter((t): t is string => typeof t === 'string' && t.length > 0);

  if (timestamps.length !== bars.length) {
    return {
      status: 'disabled',
      reason: 'Timestamps missing',
      inputs: { N: bars.length, minimumBars }
    };
  }

  const t0 = new Date(timestamps[0]).getTime();
  const tN = new Date(timestamps[timestamps.length - 1]).getTime();
  if (!Number.isFinite(t0) || !Number.isFinite(tN)) {
    return {
      status: 'disabled',
      reason: 'Timestamps invalid',
      inputs: { N: bars.length, minimumBars }
    };
  }

  const TwindowSeconds = (tN - t0) / 1000;
  if (!(TwindowSeconds > 0)) {
    return {
      status: 'disabled',
      reason: 'Undefined temporal window',
      inputs: { N: bars.length, minimumBars, T_window_seconds: TwindowSeconds }
    };
  }

  let hMax = -Infinity;
  let lMin = Infinity;
  for (const b of bars) {
    if (!Number.isFinite(b.high) || !Number.isFinite(b.low)) {
      return {
        status: 'disabled',
        reason: 'High/Low missing',
        inputs: { N: bars.length, minimumBars }
      };
    }
    if (b.high > hMax) hMax = b.high;
    if (b.low < lMin) lMin = b.low;
  }

  const N = bars.length;
  const priceRange = hMax - lMin;
  const temporalDensity = N / TwindowSeconds;
  const priceDensity = priceRange / TwindowSeconds;
  const ratio = temporalDensity > 0 ? priceDensity / temporalDensity : 0;

  return {
    status: 'active',
    value: ratio,
    inputs: {
      N,
      T_window_seconds: TwindowSeconds,
      H_max: hMax,
      L_min: lMin,
      price_range: priceRange,
      temporal_density: temporalDensity,
      price_density: priceDensity
    }
  };
}

/**
 * Reference implementations (for audit/manual verification)
 *
 * TypeScript (matches functions above):
 *   - computeTemporalSymmetry(bars, anchor, 50)
 *   - computeBarNormalizedRange(bars, 50)
 *   - computeTemporalPriceCompressionRatio(bars, 50)
 *
 * Python equivalents:
 *
 * def locate_anchor_index(bars, anchor):
 *     for i, b in enumerate(bars):
 *         if b['low'] <= anchor <= b['high']:
 *             return i
 *     return None
 *
 * def temporal_symmetry(bars, anchor, minimum_bars=50):
 *     if len(bars) < minimum_bars:
 *         return None
 *     idx = locate_anchor_index(bars, anchor)
 *     if idx is None:
 *         return None
 *     N = len(bars)
 *     before = idx
 *     after = N - idx - 1
 *     denom = max(before, after)
 *     return 0.0 if denom == 0 else min(before, after) / denom
 *
 * def bar_normalized_range(bars, minimum_bars=50):
 *     if len(bars) < minimum_bars:
 *         return None
 *     hmax = max(b['high'] for b in bars)
 *     lmin = min(b['low'] for b in bars)
 *     return (hmax - lmin) / len(bars)
 *
 * def temporal_price_compression_ratio(bars, minimum_bars=50):
 *     if len(bars) < minimum_bars:
 *         return None
 *     if any('timestamp' not in b or not b['timestamp'] for b in bars):
 *         return None
 *     from datetime import datetime
 *     t0 = datetime.fromisoformat(bars[0]['timestamp']).timestamp()
 *     tN = datetime.fromisoformat(bars[-1]['timestamp']).timestamp()
 *     Twindow = tN - t0
 *     if Twindow <= 0:
 *         return None
 *     hmax = max(b['high'] for b in bars)
 *     lmin = min(b['low'] for b in bars)
 *     price_range = hmax - lmin
 *     temporal_density = len(bars) / Twindow
 *     price_density = price_range / Twindow
 *     return price_density / temporal_density
 *
 * Boundary tests auditors will check:
 *   - Empty dataset -> disabled
 *   - Single bar -> disabled
 *   - Anchor at first/last bar (containment) -> symmetry = 0
 */
