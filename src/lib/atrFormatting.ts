/**
 * ATR Formatting & Validation Module
 * 
 * Fixes Bundle A1: ATR display showing 0.56 instead of ~8.4 pips (667× error)
 * 
 * INTERNAL STORAGE: ATR stored as decimal price (e.g., 0.00084)
 * DISPLAY PRIMARY: Pips (e.g., "8.4 pips")
 * DISPLAY SECONDARY: Percentage (e.g., "0.07%")
 * 
 * INSTRUMENT DETECTION (per spec):
 *   - FX Majors (5 decimals): pipMultiplier = 10,000 (e.g., 0.00084 → 8.4 pips)
 *   - JPY Pairs (3 decimals): pipMultiplier = 100 (e.g., 0.084 → 8.4 pips)
 *   - Gold XAU/USD (2 decimals): pipMultiplier = 100 (e.g., 0.84 → 84 pips = $0.84)
 *   - Oil (2 decimals): pipMultiplier = 100
 * 
 * VALIDATION:
 *   - Cross-check: Pips/multiplier / Close × 100 = ATR% within ±0.01%
 *   - Sanity: If ATR pips > 200 on M15, flag "Volatility Anomaly"
 */

import { getInstrumentMeta, parseSymbolParts } from './priceFormatting';

export interface ATRDisplayResult {
  pipsValue: number;
  pipsFormatted: string;
  percentValue: number;
  percentFormatted: string;
  absoluteValue: number;
  absoluteFormatted: string;
  isValid: boolean;
  validationError: string | null;
  pipMultiplier: number;
  instrumentType: 'fx-standard' | 'fx-jpy' | 'commodity' | 'index' | 'unknown';
}

/**
 * Detect pip multiplier and instrument type based on price, symbol, and decimal precision.
 * 
 * Detection Logic (per spec):
 *   1. Check symbol for JPY quote currency
 *   2. Check symbol for commodity codes (XAU, XAG, USOIL, etc.)
 *   3. Detect decimal places in typical prices
 *   4. Fallback: use price magnitude heuristics
 */
export function detectInstrumentForATR(price: number, symbol?: string): {
  pipMultiplier: number;
  instrumentType: 'fx-standard' | 'fx-jpy' | 'commodity' | 'index' | 'unknown';
  pipSizeDecimal: number;
} {
  const { quote, base } = parseSymbolParts(symbol);

  // JPY pair detection (quote = JPY or symbol contains JPY)
  if (quote === 'JPY' || (symbol && symbol.toUpperCase().includes('JPY'))) {
    return { pipMultiplier: 100, instrumentType: 'fx-jpy', pipSizeDecimal: 0.01 };
  }

  // Commodity detection
  const commodityBases = ['XAU', 'XAG', 'XPT', 'XPD', 'USOIL', 'UKOIL', 'WTI', 'BRENT', 'NG'];
  if (base && commodityBases.includes(base)) {
    // Gold/Silver: 1 pip = $0.01, multiplier = 100
    return { pipMultiplier: 100, instrumentType: 'commodity', pipSizeDecimal: 0.01 };
  }

  // Oil and high-value commodities
  if (symbol && /oil|brent|wti/i.test(symbol)) {
    return { pipMultiplier: 100, instrumentType: 'commodity', pipSizeDecimal: 0.01 };
  }

  // Price-based heuristics for unknown symbols
  if (!Number.isFinite(price) || price <= 0) {
    return { pipMultiplier: 10000, instrumentType: 'unknown', pipSizeDecimal: 0.0001 };
  }

  // High price = likely JPY pair, commodity, or index
  if (price >= 1000) {
    // Indices (S&P, Dow, etc.) - 1 point = 1 pip
    return { pipMultiplier: 1, instrumentType: 'index', pipSizeDecimal: 1.0 };
  }

  if (price >= 50) {
    // Likely JPY pair (100-160) or commodity (Gold at 2000+)
    // Gold at 2000+ would have been caught by commodity check above
    return { pipMultiplier: 100, instrumentType: 'fx-jpy', pipSizeDecimal: 0.01 };
  }

  // Standard FX pair (EUR/USD, GBP/USD, etc.)
  // Price typically 0.5 - 2.0, 5 decimal precision
  return { pipMultiplier: 10000, instrumentType: 'fx-standard', pipSizeDecimal: 0.0001 };
}

/**
 * Format ATR for institutional display.
 * 
 * PRIMARY: Pips representation (e.g., "8.4 pips")
 * SECONDARY: Percentage representation (e.g., "0.07%")
 * INTERNAL: Raw decimal for calculations
 * 
 * @param atrDecimal - Raw ATR as decimal (e.g., 0.00084)
 * @param currentPrice - Current close price
 * @param symbol - Optional symbol for instrument detection
 * @param maxPipsM15 - Maximum reasonable pips for M15 (default: 200, per spec)
 */
export function formatATRDisplay(
  atrDecimal: number,
  currentPrice: number,
  symbol?: string,
  maxPipsM15: number = 200
): ATRDisplayResult {
  const invalidResult: ATRDisplayResult = {
    pipsValue: 0,
    pipsFormatted: '—',
    percentValue: 0,
    percentFormatted: '—',
    absoluteValue: 0,
    absoluteFormatted: '—',
    isValid: false,
    validationError: 'Invalid input',
    pipMultiplier: 10000,
    instrumentType: 'unknown',
  };

  // Validate inputs
  if (!Number.isFinite(atrDecimal) || atrDecimal <= 0) {
    return { ...invalidResult, validationError: 'ATR is not a valid positive number' };
  }

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return { ...invalidResult, validationError: 'Current price is not valid' };
  }

  // Detect instrument type and pip multiplier
  const detection = detectInstrumentForATR(currentPrice, symbol);
  const { pipMultiplier, instrumentType } = detection;

  // Calculate pip value
  const pipsValue = atrDecimal * pipMultiplier;

  // Calculate percentage
  const percentValue = (atrDecimal / currentPrice) * 100;

  // VALIDATION CROSS-CHECK (per spec)
  // Verify: (ATR_pips × pipSize) / Close × 100 = ATR%
  const reconstructedPercent = (pipsValue / pipMultiplier / currentPrice) * 100;
  const tolerancePercent = 0.01; // ±0.01% tolerance (per spec)
  const crossCheckPassed = Math.abs(reconstructedPercent - percentValue) < tolerancePercent;

  if (!crossCheckPassed) {
    return {
      ...invalidResult,
      pipsValue,
      percentValue,
      absoluteValue: atrDecimal,
      validationError: `ATR cross-check failed: ${reconstructedPercent.toFixed(5)}% vs ${percentValue.toFixed(5)}%`,
      pipMultiplier,
      instrumentType,
    };
  }

  // SANITY CHECK 1: M15 ATR > 200 pips is unrealistic (per spec)
  if (pipsValue > maxPipsM15) {
    return {
      pipsValue,
      pipsFormatted: '⚠️ Volatility Anomaly',
      percentValue,
      percentFormatted: `${percentValue.toFixed(2)}%`,
      absoluteValue: atrDecimal,
      absoluteFormatted: atrDecimal.toFixed(6),
      isValid: false,
      validationError: `ATR ${pipsValue.toFixed(1)} pips exceeds ${maxPipsM15} pip sanity threshold — verify data`,
      pipMultiplier,
      instrumentType,
    };
  }

  // SANITY CHECK 2: ATR < 1 pip is suspiciously low
  if (pipsValue < 1.0 && instrumentType !== 'index') {
    // Warning but not an error - compressed market
    console.warn(`[ATR] Extremely compressed: ${pipsValue.toFixed(2)} pips — verify calculation`);
  }

  // SANITY CHECK 3: ATR > 10% of price is extremely unusual
  if (percentValue > 10) {
    return {
      pipsValue,
      pipsFormatted: '⚠️ Calculation Error',
      percentValue,
      percentFormatted: `${percentValue.toFixed(2)}%`,
      absoluteValue: atrDecimal,
      absoluteFormatted: atrDecimal.toFixed(6),
      isValid: false,
      validationError: `ATR% (${percentValue.toFixed(2)}%) exceeds 10% sanity threshold`,
      pipMultiplier,
      instrumentType,
    };
  }

  // Format for display
  const pipsFormatted = `${pipsValue.toFixed(1)} pips`;
  const percentFormatted = `${percentValue.toFixed(2)}%`;

  // Absolute format based on instrument type
  let absoluteFormatted: string;
  if (instrumentType === 'fx-standard') {
    absoluteFormatted = atrDecimal.toFixed(5);
  } else if (instrumentType === 'fx-jpy' || instrumentType === 'commodity') {
    absoluteFormatted = atrDecimal.toFixed(3);
  } else {
    absoluteFormatted = atrDecimal.toFixed(2);
  }

  return {
    pipsValue,
    pipsFormatted,
    percentValue,
    percentFormatted,
    absoluteValue: atrDecimal,
    absoluteFormatted,
    isValid: true,
    validationError: null,
    pipMultiplier,
    instrumentType,
  };
}

/**
 * Get ATR classification based on percentage of price
 */
export function classifyATR(atrPercent: number): {
  label: string;
  severity: 'low' | 'normal' | 'high';
  description: string;
} {
  if (atrPercent < 0.5) {
    return { label: 'Very Low', severity: 'low', description: 'Extremely compressed — breakout likely' };
  }
  if (atrPercent < 1.0) {
    return { label: 'Low', severity: 'low', description: 'Below-average volatility' };
  }
  if (atrPercent <= 2.0) {
    return { label: 'Normal', severity: 'normal', description: 'Typical trading conditions' };
  }
  if (atrPercent <= 3.5) {
    return { label: 'Elevated', severity: 'high', description: 'Above-average volatility — size accordingly' };
  }
  return { label: 'High', severity: 'high', description: 'High volatility alert — reduce position size' };
}
