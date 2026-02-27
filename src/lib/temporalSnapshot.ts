/**
 * TEMPORAL SYNCHRONIZATION MODULE
 * 
 * Ensures all price displays match the "Data Through" timestamp exactly.
 * Prevents temporal mismatch where LTP shows 1.19661 but analysis uses 1.19441.
 * 
 * PRINCIPLE: Single Source of Truth from Data Snapshot
 * - LTP = Close of last bar in dataset
 * - All calculations use this exact value
 * - No module may fetch "current price" from elsewhere
 */

import { OHLCVBar } from './mt5Parser';
import { formatInstrumentPrice } from './priceFormatting';

/**
 * Immutable data snapshot - the SINGLE SOURCE OF TRUTH for analysis.
 */
export interface DataSnapshot {
  /** Timestamp of the last bar in the dataset */
  timestamp: string;
  /** Close price of the last bar - THIS is the LTP for all analysis */
  price: number;
  /** Open of the last bar */
  open: number;
  /** High of the last bar */
  high: number;
  /** Low of the last bar */
  low: number;
  /** Full bar array for analysis */
  allBars: OHLCVBar[];
  /** Anchor price (first bar's open) */
  anchor: number;
  /** Anchor timestamp */
  anchorTimestamp: string;
  /** Symbol for formatting */
  symbol?: string;
}

/**
 * Create an immutable data snapshot from OHLCV data.
 * This is the ONLY place where LTP should be determined.
 */
export function createDataSnapshot(
  ohlcv: OHLCVBar[],
  symbol?: string
): DataSnapshot {
  if (ohlcv.length === 0) {
    throw new Error('Cannot create snapshot from empty dataset');
  }

  // Sort by timestamp to ensure chronological order
  const sortedBars = [...ohlcv].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );

  const lastBar = sortedBars[sortedBars.length - 1];
  const firstBar = sortedBars[0];

  return {
    timestamp: lastBar.timestamp,
    price: lastBar.close,
    open: lastBar.open,
    high: lastBar.high,
    low: lastBar.low,
    allBars: sortedBars,
    anchor: firstBar.open,
    anchorTimestamp: firstBar.timestamp,
    symbol,
  };
}

/**
 * Validate that the snapshot price matches the last bar's close.
 * This prevents the 1.19661 vs 1.19441 temporal mismatch bug.
 */
export interface SnapshotValidation {
  isValid: boolean;
  errors: string[];
  priceAtTimestamp: number;
  claimedPrice: number;
  timestampMatch: boolean;
}

export function validateSnapshot(snapshot: DataSnapshot): SnapshotValidation {
  const errors: string[] = [];
  const lastBar = snapshot.allBars[snapshot.allBars.length - 1];

  // Check 1: Price consistency
  const priceDiff = Math.abs(snapshot.price - lastBar.close);
  if (priceDiff > 0.00001) {
    errors.push(
      `TEMPORAL MISMATCH: Display Price ${snapshot.price} vs Last Bar Close ${lastBar.close} at ${lastBar.timestamp}`
    );
  }

  // Check 2: Timestamp consistency
  const timestampMatch = snapshot.timestamp === lastBar.timestamp;
  if (!timestampMatch) {
    errors.push(
      `TIMESTAMP MISMATCH: Snapshot time ${snapshot.timestamp} vs Bar time ${lastBar.timestamp}`
    );
  }

  // Check 3: Price actually existed at claimed time
  if (snapshot.price !== lastBar.close && snapshot.timestamp === lastBar.timestamp) {
    errors.push(
      `PRICE TIME TRAVEL: Price ${snapshot.price} claimed at ${snapshot.timestamp} but actual price was ${lastBar.close}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    priceAtTimestamp: lastBar.close,
    claimedPrice: snapshot.price,
    timestampMatch,
  };
}

/**
 * Format price for display with consistent precision.
 * 
 * RULE: All price displays use the EXACT same variable.
 * - Header: Full 5 decimal precision
 * - Quick Ref: Minimum 4 decimals to prevent 1.19441 → 1.20 rounding
 * - Detail: Full 5 decimal precision
 */
export type PriceDisplayContext = 'header' | 'quick_ref' | 'detail' | 'tooltip';

export function formatSnapshotPrice(
  snapshot: DataSnapshot,
  context: PriceDisplayContext = 'detail'
): string {
  const { price, symbol } = snapshot;

  // Always use instrument-aware formatting for consistency
  // This prevents "1.20" vs "1.19441" inconsistency
  switch (context) {
    case 'header':
    case 'detail':
    case 'tooltip':
      // Full precision for all primary displays
      return formatInstrumentPrice(price, { symbol });

    case 'quick_ref':
      // For quick reference, still use full precision to avoid confusion
      // The spec originally used 2 decimals but that caused the "1.20" bug
      return formatInstrumentPrice(price, { symbol });

    default:
      return formatInstrumentPrice(price, { symbol });
  }
}

/**
 * Extract the "Data Through" timestamp for display.
 */
export function getDataThroughDisplay(snapshot: DataSnapshot): {
  date: string;
  time: string;
  full: string;
  iso: string;
} {
  const ts = snapshot.timestamp;

  // Parse timestamp (format: YYYY-MM-DDTHH:mm:ss)
  const [datePart, timePart] = ts.split('T');

  return {
    date: datePart || ts.split(' ')[0] || ts,
    time: timePart || ts.split(' ')[1] || '00:00:00',
    full: ts.replace('T', ' '),
    iso: ts.includes('Z') ? ts : `${ts}Z`,
  };
}

/**
 * Calculate latency between snapshot and current time.
 */
export function calculateDataLatency(snapshot: DataSnapshot): {
  latencyMinutes: number;
  isStale: boolean;
  warningMessage: string | null;
} {
  const snapshotDate = new Date(snapshot.timestamp);
  const now = new Date();

  const latencyMs = now.getTime() - snapshotDate.getTime();
  const latencyMinutes = latencyMs / (1000 * 60);

  const isStale = latencyMinutes > 30;

  return {
    latencyMinutes,
    isStale,
    warningMessage: isStale
      ? `Data delayed — refresh from MT5 (${Math.round(latencyMinutes)} min old)`
      : null,
  };
}

/**
 * Get LTP display properties for the snapshot.
 * This ensures consistent formatting across all UI components.
 */
export interface LTPDisplayProperties {
  value: number;
  formatted: string;
  timestamp: string;
  timestampFormatted: string;
  isValid: boolean;
  validationErrors: string[];
}

export function getLTPDisplayProperties(snapshot: DataSnapshot): LTPDisplayProperties {
  const validation = validateSnapshot(snapshot);
  const dataThroughDisplay = getDataThroughDisplay(snapshot);

  return {
    value: snapshot.price,
    formatted: formatSnapshotPrice(snapshot, 'header'),
    timestamp: snapshot.timestamp,
    timestampFormatted: dataThroughDisplay.full,
    isValid: validation.isValid,
    validationErrors: validation.errors,
  };
}
