// Centralized instrument-aware price precision and formatting.
// Goal: preserve FX pip precision (e.g., 1.35968) while keeping commodities/equities at 2 decimals.

export type InstrumentType = 'fx' | 'commodity' | 'index' | 'unknown';

// ISO 4217 currency codes (major + minor + exotic)
const CURRENCY_CODES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
  'SEK', 'NOK', 'DKK', 'CNY', 'CNH', 'INR', 'KRW', 'TWD',
  'ZAR', 'TRY', 'MXN', 'BRL', 'RUB', 'THB', 'IDR', 'MYR',
  'PLN', 'CZK', 'HUF', 'RON', 'ILS',
  'SGD', 'HKD', 'PHP',
]);

// Common commodity bases that appear in AAA/BBB style symbols
const COMMODITY_BASES = new Set([
  'XAU', 'XAG', 'XPT', 'XPD', // Precious metals
  'WTI', 'BRENT', 'NG', 'USOIL', 'UKOIL', // Energy
  'XCU', // Copper
]);

// Index symbols (not structured as pairs)
const INDEX_SYMBOLS = new Set([
  'SPX', 'SPY', 'ES', 'NQ', 'DJI', 'NDX', 'VIX',
  'FTSE', 'DAX', 'CAC', 'NIK', 'HSI', 'SSE',
]);

function normalizeSymbol(symbol?: string): string {
  return (symbol ?? '').trim().toUpperCase();
}

export function parseSymbolParts(symbol?: string): { base?: string; quote?: string } {
  const s = normalizeSymbol(symbol);
  if (!s) return {};

  // Prefer slash-separated pairs (e.g., GBP/USD, XAU/USD).
  if (s.includes('/')) {
    const [base, quote] = s.split('/').map(x => x.trim());
    return { base: base || undefined, quote: quote || undefined };
  }

  // Fallback: 6-character pairs like GBPUSD.
  const compact = s.replace(/[^A-Z0-9]/g, '');
  if (compact.length === 6) {
    return { base: compact.slice(0, 3), quote: compact.slice(3, 6) };
  }

  return {};
}

export function inferInstrumentType(symbol?: string): InstrumentType {
  const s = normalizeSymbol(symbol);
  if (INDEX_SYMBOLS.has(s)) return 'index';

  const { base, quote } = parseSymbolParts(symbol);
  if (base && COMMODITY_BASES.has(base)) return 'commodity';
  if (base && quote && CURRENCY_CODES.has(base) && CURRENCY_CODES.has(quote)) return 'fx';

  return 'unknown';
}

/**
 * Returns detailed instrument metadata for display and calculation purposes.
 */
export interface InstrumentMeta {
  type: InstrumentType;
  displayPrecision: number;
  srlUseIntegerSpace: boolean;
  base?: string;
  quote?: string;
}

export function getInstrumentMeta(args: { price: number; symbol?: string }): InstrumentMeta {
  const { price, symbol } = args;
  const type = inferInstrumentType(symbol);
  const { base, quote } = parseSymbolParts(symbol);

  // FX: use pip precision
  if (type === 'fx') {
    const isJpyQuoted = quote === 'JPY';
    return {
      type,
      displayPrecision: isJpyQuoted ? 3 : 5,
      srlUseIntegerSpace: true,
      base,
      quote,
    };
  }

  // Commodities: 2 decimals, no integer-space normalization
  if (type === 'commodity') {
    return {
      type,
      displayPrecision: 2,
      srlUseIntegerSpace: false,
      base,
      quote,
    };
  }

  // Index: 2 decimals
  if (type === 'index') {
    return {
      type,
      displayPrecision: 2,
      srlUseIntegerSpace: false,
    };
  }

  // Unknown: conservative heuristic based on price magnitude
  // Small prices (<10) likely need more precision
  const likelyFx = Number.isFinite(price) && price > 0 && price < 10;
  return {
    type,
    displayPrecision: likelyFx ? 5 : 2,
    srlUseIntegerSpace: likelyFx,
    base,
    quote,
  };
}

/**
 * FX should display at pip precision:
 * - JPY-quoted pairs: 3 decimals (e.g., 150.123)
 * - most other FX: 5 decimals (e.g., 1.35968)
 * Commodities/equities: 2 decimals.
 */
export function getInstrumentPricePrecision(args: { price: number; symbol?: string }): number {
  return getInstrumentMeta(args).displayPrecision;
}

export function formatInstrumentPrice(
  price: number,
  opts?: { symbol?: string; precision?: number }
): string {
  if (!Number.isFinite(price)) return '—';
  const precision = opts?.precision ?? getInstrumentPricePrecision({ price, symbol: opts?.symbol });
  return price.toFixed(precision);
}

/**
 * Compute SRL normalization details for debug/audit purposes.
 */
export interface SrlNormalizationInfo {
  needsNormalization: boolean;
  scaleFactor: number;
  decimals: number;
  anchorInt: number;
  sqrtAnchor: number;
}

export function getSrlNormalizationInfo(anchor: number): SrlNormalizationInfo {
  if (anchor <= 0) {
    return { needsNormalization: false, scaleFactor: 1, decimals: 0, anchorInt: 0, sqrtAnchor: 0 };
  }

  // Match geometry.ts logic exactly
  const rounded = Number(anchor.toFixed(5));
  const priceStr = rounded.toString();
  const decimalPart = priceStr.includes('.') ? priceStr.split('.')[1] : '';
  const decimals = Math.min(5, decimalPart.length);

  const needsNormalization = decimals >= 3 && anchor >= 0.01 && anchor < 1000;
  const scaleFactor = needsNormalization ? Math.pow(10, decimals) : 1;
  const anchorInt = needsNormalization ? Math.round(anchor * scaleFactor) : anchor;
  const sqrtAnchor = Math.sqrt(anchorInt);

  return { needsNormalization, scaleFactor, decimals, anchorInt, sqrtAnchor };
}
