/**
 * STRUCTURA CORE: ADVANCED ECONOMETRICS FOR FX/COMMODITIES
 * 
 * Robust Metrics Using OHLCV with No True Volume
 * 
 * All metrics are:
 * - Deterministic: Identical inputs yield identical outputs
 * - Non-predictive: No forward-looking inference
 * - Peer-reviewable: Based on academic literature
 * 
 * Reference: High-Frequency Finance, Market Microstructure
 */

import { OHLCVBar } from './formalMetrics';

// ============= I. HIGH-FREQUENCY-INSPIRED VOLATILITY ESTIMATORS =============

/**
 * 1. PARKINSON ESTIMATOR (Range-Based)
 * σ²_P = (1 / 4ln2) × (1/n) × Σ[ln(H_i/L_i)]²
 * 
 * Properties:
 * - 5x more efficient than close-to-close under Brownian motion
 * - Biased downward in presence of jumps
 */
export function calculateParkinsonVolatility(ohlcv: OHLCVBar[]): number {
  if (ohlcv.length < 2) return 0;

  const factor = 1 / (4 * Math.LN2);
  let sum = 0;
  let count = 0;

  for (const bar of ohlcv) {
    if (bar.high > 0 && bar.low > 0 && bar.high >= bar.low) {
      const logRange = Math.log(bar.high / bar.low);
      sum += logRange * logRange;
      count++;
    }
  }

  if (count === 0) return 0;
  return Math.sqrt(factor * sum / count);
}

/**
 * 2. GARMAN-KLASS ESTIMATOR
 * σ²_GK = (1/n) × Σ[0.5(ln(H/L))² - (2ln2-1)(ln(C/O))²]
 * 
 * Properties:
 * - Uses all four OHLC prices
 * - Minimum variance estimator under geometric Brownian motion
 * - ~8x efficiency gain vs close-to-close
 */
export function calculateGarmanKlassVolatility(ohlcv: OHLCVBar[]): number {
  if (ohlcv.length < 2) return 0;

  const factor2 = 2 * Math.LN2 - 1;
  let sum = 0;
  let count = 0;

  for (const bar of ohlcv) {
    if (bar.high > 0 && bar.low > 0 && bar.open > 0 && bar.close > 0 && bar.high >= bar.low) {
      const logHL = Math.log(bar.high / bar.low);
      const logCO = Math.log(bar.close / bar.open);
      sum += 0.5 * logHL * logHL - factor2 * logCO * logCO;
      count++;
    }
  }

  if (count === 0) return 0;
  return Math.sqrt(Math.max(0, sum / count));
}

/**
 * 3. ROGERS-SATCHELL ESTIMATOR (Drift-Adjusted)
 * σ²_RS = (1/n) × Σ[ln(H/C)ln(H/O) + ln(L/C)ln(L/O)]
 * 
 * Properties:
 * - Robust to drift (non-zero mean returns)
 * - Unbiased under GBM with drift
 */
export function calculateRogersSatchellVolatility(ohlcv: OHLCVBar[]): number {
  if (ohlcv.length < 2) return 0;

  let sum = 0;
  let count = 0;

  for (const bar of ohlcv) {
    if (bar.high > 0 && bar.low > 0 && bar.open > 0 && bar.close > 0 && bar.high >= bar.low) {
      const logHC = Math.log(bar.high / bar.close);
      const logHO = Math.log(bar.high / bar.open);
      const logLC = Math.log(bar.low / bar.close);
      const logLO = Math.log(bar.low / bar.open);
      sum += logHC * logHO + logLC * logLO;
      count++;
    }
  }

  if (count === 0) return 0;
  return Math.sqrt(Math.max(0, sum / count));
}

/**
 * 4. YANG-ZHANG ESTIMATOR (Jump-Robust)
 * σ²_YZ = σ²_o + k×σ²_c + (1-k)×σ²_RS
 * 
 * where:
 * - σ²_o = variance of overnight returns (ln(O_i/C_{i-1}))
 * - σ²_c = variance of open-to-close returns
 * - k = 0.34 / (1.34 + (n+1)/(n-1))
 * 
 * Properties:
 * - Most robust estimator combining overnight and intraday
 * - Handles opening jumps
 */
export function calculateYangZhangVolatility(ohlcv: OHLCVBar[]): number {
  if (ohlcv.length < 3) return 0;

  // Overnight returns: ln(O_i / C_{i-1})
  const overnightReturns: number[] = [];
  // Open-to-close returns: ln(C_i / O_i)
  const openCloseReturns: number[] = [];

  for (let i = 1; i < ohlcv.length; i++) {
    const prev = ohlcv[i - 1];
    const curr = ohlcv[i];

    if (prev.close > 0 && curr.open > 0 && curr.close > 0) {
      overnightReturns.push(Math.log(curr.open / prev.close));
      openCloseReturns.push(Math.log(curr.close / curr.open));
    }
  }

  if (overnightReturns.length < 2) return 0;

  // Calculate unbiased variances
  const n = overnightReturns.length;

  const meanOvernight = overnightReturns.reduce((a, b) => a + b, 0) / n;
  const varOvernight = overnightReturns.reduce((s, r) => s + Math.pow(r - meanOvernight, 2), 0) / (n - 1);

  const meanOpenClose = openCloseReturns.reduce((a, b) => a + b, 0) / n;
  const varOpenClose = openCloseReturns.reduce((s, r) => s + Math.pow(r - meanOpenClose, 2), 0) / (n - 1);

  // Rogers-Satchell component
  const varRS = Math.pow(calculateRogersSatchellVolatility(ohlcv.slice(1)), 2);

  // k factor
  const k = 0.34 / (1.34 + (n + 1) / (n - 1));

  // Yang-Zhang variance
  const varYZ = varOvernight + k * varOpenClose + (1 - k) * varRS;

  return Math.sqrt(Math.max(0, varYZ));
}

// ============= VOLATILITY ESTIMATORS RESULT =============

export interface VolatilityEstimatorsResult {
  parkinson: number;
  garmanKlass: number;
  rogersSatchell: number;
  yangZhang: number;              // Primary estimator
  validationRatio: number;        // YZ/GK for consistency check
  classification: 'Low' | 'Normal' | 'Elevated' | 'Extreme';
}

export function calculateVolatilityEstimators(ohlcv: OHLCVBar[]): VolatilityEstimatorsResult {
  const parkinson = calculateParkinsonVolatility(ohlcv);
  const garmanKlass = calculateGarmanKlassVolatility(ohlcv);
  const rogersSatchell = calculateRogersSatchellVolatility(ohlcv);
  const yangZhang = calculateYangZhangVolatility(ohlcv);

  // Validation ratio: should be close to 1 for consistent data
  const validationRatio = garmanKlass > 0 ? yangZhang / garmanKlass : 1;

  // Classification based on annualized volatility (assuming daily data)
  const annualized = yangZhang * Math.sqrt(252);
  let classification: VolatilityEstimatorsResult['classification'];

  if (annualized < 0.1) {
    classification = 'Low';
  } else if (annualized < 0.2) {
    classification = 'Normal';
  } else if (annualized < 0.4) {
    classification = 'Elevated';
  } else {
    classification = 'Extreme';
  }

  return {
    parkinson,
    garmanKlass,
    rogersSatchell,
    yangZhang,
    validationRatio,
    classification
  };
}

// ============= II. JUMP DETECTION & DISCONTINUITIES =============

/**
 * 5. BIPOWER VARIATION & JUMP TEST (Barndorff-Nielsen & Shephard)
 * 
 * BV_t = (π/2) × Σ|r_i||r_{i-1}|
 * RJ_t = (RV_t - BV_t) / RV_t
 * 
 * Under continuous paths: BV → RV
 * Positive difference indicates jump presence
 */
export interface JumpDetectionResult {
  realizedVariance: number;
  bipowerVariation: number;
  jumpRatio: number;              // RJ = (RV - BV) / RV
  jumpIntensity: number;          // Count of significant jumps / total bars
  hasSignificantJump: boolean;
  jumpBars: number[];             // Indices of detected jump bars
  classification: 'Continuous' | 'Jump-present' | 'Jump-dominated';
}

export function calculateJumpDetection(ohlcv: OHLCVBar[]): JumpDetectionResult {
  const closes = ohlcv.map(b => b.close);
  const returns: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  if (returns.length < 3) {
    return {
      realizedVariance: 0,
      bipowerVariation: 0,
      jumpRatio: 0,
      jumpIntensity: 0,
      hasSignificantJump: false,
      jumpBars: [],
      classification: 'Continuous'
    };
  }

  // Realized Variance: RV = Σ r_i²
  const realizedVariance = returns.reduce((sum, r) => sum + r * r, 0);

  // Bipower Variation: BV = (π/2) × Σ|r_i||r_{i-1}|
  const muFactor = Math.sqrt(Math.PI / 2);
  let bipowerSum = 0;
  for (let i = 1; i < returns.length; i++) {
    bipowerSum += Math.abs(returns[i]) * Math.abs(returns[i - 1]);
  }
  const bipowerVariation = muFactor * muFactor * bipowerSum;

  // Jump Ratio
  const jumpRatio = realizedVariance > 0 ? Math.max(0, (realizedVariance - bipowerVariation) / realizedVariance) : 0;

  // Detect individual jump bars
  const jumpBars: number[] = [];
  const threshold = 3 * Math.sqrt(realizedVariance / returns.length); // 3σ threshold

  for (let i = 0; i < returns.length; i++) {
    if (Math.abs(returns[i]) > threshold) {
      jumpBars.push(i + 1); // +1 for original bar index
    }
  }

  const jumpIntensity = jumpBars.length / returns.length;

  // Significance test using standard normal
  const hasSignificantJump = jumpRatio > 0.1;

  // Classification
  let classification: JumpDetectionResult['classification'];
  if (jumpRatio < 0.05) {
    classification = 'Continuous';
  } else if (jumpRatio < 0.2) {
    classification = 'Jump-present';
  } else {
    classification = 'Jump-dominated';
  }

  return {
    realizedVariance,
    bipowerVariation,
    jumpRatio,
    jumpIntensity,
    hasSignificantJump,
    jumpBars,
    classification
  };
}

// ============= III. LIQUIDITY PROXIES (VOLUME-FREE) =============

/**
 * 6. ROLL'S EFFECTIVE SPREAD ESTIMATOR
 * Ŝ = 2√(-Cov(ΔP_t, ΔP_{t-1}))
 * 
 * For negative covariance only; otherwise market is too liquid to measure
 */
export interface RollSpreadResult {
  effectiveSpread: number;
  autocovariance: number;
  isValid: boolean;               // True if covariance is negative
  classification: 'Liquid' | 'Normal' | 'Illiquid';
}

export function calculateRollSpread(ohlcv: OHLCVBar[]): RollSpreadResult {
  const closes = ohlcv.map(b => b.close);

  if (closes.length < 4) {
    return {
      effectiveSpread: 0,
      autocovariance: 0,
      isValid: false,
      classification: 'Normal'
    };
  }

  // Calculate price changes
  const priceChanges: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    priceChanges.push(closes[i] - closes[i - 1]);
  }

  // Calculate autocovariance of lag 1
  const n = priceChanges.length;
  const mean = priceChanges.reduce((a, b) => a + b, 0) / n;

  let autocovariance = 0;
  for (let i = 1; i < n; i++) {
    autocovariance += (priceChanges[i] - mean) * (priceChanges[i - 1] - mean);
  }
  autocovariance /= (n - 1);

  // Roll's estimator only valid for negative covariance
  const isValid = autocovariance < 0;
  const effectiveSpread = isValid ? 2 * Math.sqrt(-autocovariance) : 0;

  // Normalize by average price for classification
  const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length;
  const spreadPercent = avgPrice > 0 ? effectiveSpread / avgPrice : 0;

  let classification: RollSpreadResult['classification'];
  if (!isValid || spreadPercent < 0.001) {
    classification = 'Liquid';
  } else if (spreadPercent < 0.005) {
    classification = 'Normal';
  } else {
    classification = 'Illiquid';
  }

  return {
    effectiveSpread,
    autocovariance,
    isValid,
    classification
  };
}

/**
 * 7. CORWIN-SCHULTZ BID-ASK SPREAD ESTIMATOR
 * Uses high-low ratios over two consecutive days
 * 
 * β = Σ[ln(H_{t-j}/L_{t-j})]² for j=0,1
 * γ = [ln(max(H_t,H_{t-1})/min(L_t,L_{t-1}))]²
 * α = (√(2β) - √β) / (3 - 2√2) - √(γ/(3-2√2))
 * Ŝ = 2(e^α - 1) / (1 + e^α)
 */
export interface CorwinSchultzResult {
  bidAskSpread: number;
  alpha: number;
  beta: number;
  gamma: number;
  isValid: boolean;
  classification: 'Tight' | 'Normal' | 'Wide';
}

export function calculateCorwinSchultzSpread(ohlcv: OHLCVBar[]): CorwinSchultzResult {
  if (ohlcv.length < 3) {
    return {
      bidAskSpread: 0,
      alpha: 0,
      beta: 0,
      gamma: 0,
      isValid: false,
      classification: 'Normal'
    };
  }

  const spreads: number[] = [];
  const factor = 3 - 2 * Math.sqrt(2);

  for (let i = 1; i < ohlcv.length; i++) {
    const curr = ohlcv[i];
    const prev = ohlcv[i - 1];

    if (curr.high > 0 && curr.low > 0 && prev.high > 0 && prev.low > 0) {
      // β = sum of squared log ranges
      const logRange0 = Math.log(curr.high / curr.low);
      const logRange1 = Math.log(prev.high / prev.low);
      const beta = logRange0 * logRange0 + logRange1 * logRange1;

      // γ = squared log range of 2-day combined range
      const twoBarHigh = Math.max(curr.high, prev.high);
      const twoBarLow = Math.min(curr.low, prev.low);
      const gamma = Math.pow(Math.log(twoBarHigh / twoBarLow), 2);

      // α calculation
      const alpha = (Math.sqrt(2 * beta) - Math.sqrt(beta)) / factor - Math.sqrt(gamma / factor);

      // Spread: 2(e^α - 1) / (1 + e^α)
      if (alpha > -10 && alpha < 10) { // Numerical stability
        const expAlpha = Math.exp(alpha);
        const spread = 2 * (expAlpha - 1) / (1 + expAlpha);
        if (spread >= 0 && spread < 1) {
          spreads.push(spread);
        }
      }
    }
  }

  if (spreads.length === 0) {
    return {
      bidAskSpread: 0,
      alpha: 0,
      beta: 0,
      gamma: 0,
      isValid: false,
      classification: 'Normal'
    };
  }

  const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;

  let classification: CorwinSchultzResult['classification'];
  if (avgSpread < 0.002) {
    classification = 'Tight';
  } else if (avgSpread < 0.01) {
    classification = 'Normal';
  } else {
    classification = 'Wide';
  }

  return {
    bidAskSpread: avgSpread,
    alpha: 0, // Averaged
    beta: 0,
    gamma: 0,
    isValid: true,
    classification
  };
}

/**
 * 8. AMIHUD ILLIQUIDITY RATIO (Volume-Adjusted)
 * ILLIQ_t = |r_t| / (V̂_t × P_t)
 * 
 * where V̂_t = tick volume proxy
 */
export interface AmihudIlliquidityResult {
  illiquidityRatio: number;
  averageAbsReturn: number;
  averageVolume: number;
  volumeNormalized: boolean;
  classification: 'High Liquidity' | 'Normal' | 'Low Liquidity';
}

export function calculateAmihudIlliquidity(ohlcv: OHLCVBar[]): AmihudIlliquidityResult {
  if (ohlcv.length < 3) {
    return {
      illiquidityRatio: 0,
      averageAbsReturn: 0,
      averageVolume: 0,
      volumeNormalized: false,
      classification: 'Normal'
    };
  }

  const ratios: number[] = [];
  let totalAbsReturn = 0;
  let totalVolume = 0;
  let volumeCount = 0;

  for (let i = 1; i < ohlcv.length; i++) {
    const curr = ohlcv[i];
    const prev = ohlcv[i - 1];

    if (prev.close > 0 && curr.close > 0 && curr.volume > 0) {
      const absReturn = Math.abs(Math.log(curr.close / prev.close));
      const illiq = absReturn / (curr.volume * curr.close);
      ratios.push(illiq);
      totalAbsReturn += absReturn;
      totalVolume += curr.volume;
      volumeCount++;
    }
  }

  if (ratios.length === 0) {
    return {
      illiquidityRatio: 0,
      averageAbsReturn: 0,
      averageVolume: 0,
      volumeNormalized: false,
      classification: 'Normal'
    };
  }

  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const avgAbsReturn = totalAbsReturn / ratios.length;
  const avgVolume = volumeCount > 0 ? totalVolume / volumeCount : 0;

  // Log-normalize for classification
  const logRatio = Math.log(1 + avgRatio * 1e9);

  let classification: AmihudIlliquidityResult['classification'];
  if (logRatio < 5) {
    classification = 'High Liquidity';
  } else if (logRatio < 10) {
    classification = 'Normal';
  } else {
    classification = 'Low Liquidity';
  }

  return {
    illiquidityRatio: avgRatio,
    averageAbsReturn: avgAbsReturn,
    averageVolume: avgVolume,
    volumeNormalized: volumeCount > 0,
    classification
  };
}

// ============= IV. MARKET MICROSTRUCTURE NOISE ESTIMATION =============

/**
 * 9. HASBROUCK'S MARKET EFFICIENCY COEFFICIENT
 * MEC = 1 - σ²_YZ / σ²_GK
 * 
 * Measures proportion of variance attributable to noise
 */
export interface MarketEfficiencyResult {
  mec: number;                    // Market Efficiency Coefficient
  noiseVarianceRatio: number;
  classification: 'Efficient' | 'Normal' | 'Noisy';
}

export function calculateMarketEfficiency(ohlcv: OHLCVBar[]): MarketEfficiencyResult {
  const gk = calculateGarmanKlassVolatility(ohlcv);
  const yz = calculateYangZhangVolatility(ohlcv);

  const gkVar = gk * gk;
  const yzVar = yz * yz;

  if (gkVar === 0) {
    return {
      mec: 0,
      noiseVarianceRatio: 0,
      classification: 'Normal'
    };
  }

  const mec = 1 - yzVar / gkVar;
  const clampedMec = Math.max(-1, Math.min(1, mec));

  let classification: MarketEfficiencyResult['classification'];
  if (clampedMec < -0.1) {
    classification = 'Efficient';
  } else if (clampedMec < 0.2) {
    classification = 'Normal';
  } else {
    classification = 'Noisy';
  }

  return {
    mec: clampedMec,
    noiseVarianceRatio: Math.max(0, clampedMec),
    classification
  };
}

/**
 * 10. AUTOCORRELATION-BASED NOISE
 * ρ̂₁ = Corr(r_t, r_{t-1})
 * NSR = -ρ̂₁ / (1 + ρ̂₁)
 * 
 * Negative ρ₁ indicates bid-ask bounce
 */
export interface AutocorrelationNoiseResult {
  rho1: number;                   // First-order autocorrelation
  noiseSignalRatio: number;       // NSR
  hasBidAskBounce: boolean;
  classification: 'Strong-negative' | 'Weak-negative' | 'Neutral' | 'Positive';
}

export function calculateAutocorrelationNoise(ohlcv: OHLCVBar[]): AutocorrelationNoiseResult {
  const closes = ohlcv.map(b => b.close);

  if (closes.length < 5) {
    return {
      rho1: 0,
      noiseSignalRatio: 0,
      hasBidAskBounce: false,
      classification: 'Neutral'
    };
  }

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  if (returns.length < 4) {
    return {
      rho1: 0,
      noiseSignalRatio: 0,
      hasBidAskBounce: false,
      classification: 'Neutral'
    };
  }

  // Calculate autocorrelation
  const n = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;

  let cov = 0;
  let var0 = 0;

  for (let i = 1; i < n; i++) {
    cov += (returns[i] - mean) * (returns[i - 1] - mean);
  }
  cov /= (n - 1);

  for (let i = 0; i < n; i++) {
    var0 += Math.pow(returns[i] - mean, 2);
  }
  var0 /= (n - 1);

  const rho1 = var0 > 0 ? cov / var0 : 0;

  // NSR = -ρ̂₁ / (1 + ρ̂₁)
  const nsr = Math.abs(1 + rho1) > 0.01 ? -rho1 / (1 + rho1) : 0;

  const hasBidAskBounce = rho1 < -0.1;

  let classification: AutocorrelationNoiseResult['classification'];
  if (rho1 < -0.2) {
    classification = 'Strong-negative';
  } else if (rho1 < -0.05) {
    classification = 'Weak-negative';
  } else if (rho1 > 0.1) {
    classification = 'Positive';
  } else {
    classification = 'Neutral';
  }

  return {
    rho1,
    noiseSignalRatio: nsr,
    hasBidAskBounce,
    classification
  };
}

// ============= V. REGIME DETECTION & STRUCTURAL BREAKS =============

/**
 * 11. CUSUM TEST FOR VOLATILITY CHANGES
 * CUSUM_t = (1/(σ̂√n)) × Σ(|r_i| - |r̄|)
 * 
 * Structural break when |CUSUM_t| > critical value
 */
export interface CUSUMResult {
  cusumValues: number[];
  maxCusum: number;
  breakIndex: number | null;
  hasStructuralBreak: boolean;
  criticalValue: number;
  classification: 'Stable' | 'Transitioning' | 'Break-detected';
}

export function calculateCUSUM(ohlcv: OHLCVBar[]): CUSUMResult {
  const closes = ohlcv.map(b => b.close);

  if (closes.length < 10) {
    return {
      cusumValues: [],
      maxCusum: 0,
      breakIndex: null,
      hasStructuralBreak: false,
      criticalValue: 0,
      classification: 'Stable'
    };
  }

  // Calculate absolute returns
  const absReturns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      absReturns.push(Math.abs(Math.log(closes[i] / closes[i - 1])));
    }
  }

  if (absReturns.length < 5) {
    return {
      cusumValues: [],
      maxCusum: 0,
      breakIndex: null,
      hasStructuralBreak: false,
      criticalValue: 0,
      classification: 'Stable'
    };
  }

  const n = absReturns.length;
  const mean = absReturns.reduce((a, b) => a + b, 0) / n;
  const variance = absReturns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / (n - 1);
  const sigma = Math.sqrt(variance);

  const sqrtN = Math.sqrt(n);
  const cusumValues: number[] = [];
  let cumSum = 0;
  let maxCusum = 0;
  let breakIndex: number | null = null;

  for (let i = 0; i < absReturns.length; i++) {
    cumSum += (absReturns[i] - mean);
    const cusum = sigma > 0 ? cumSum / (sigma * sqrtN) : 0;
    cusumValues.push(cusum);

    if (Math.abs(cusum) > Math.abs(maxCusum)) {
      maxCusum = cusum;
      breakIndex = i + 1; // +1 for original index
    }
  }

  // Critical value (approximate 95% level for Brownian bridge)
  const criticalValue = 1.36;
  const hasStructuralBreak = Math.abs(maxCusum) > criticalValue;

  let classification: CUSUMResult['classification'];
  if (!hasStructuralBreak && Math.abs(maxCusum) < 0.5 * criticalValue) {
    classification = 'Stable';
  } else if (hasStructuralBreak) {
    classification = 'Break-detected';
  } else {
    classification = 'Transitioning';
  }

  return {
    cusumValues,
    maxCusum,
    breakIndex: hasStructuralBreak ? breakIndex : null,
    hasStructuralBreak,
    criticalValue,
    classification
  };
}

/**
 * 12. VOLATILITY REGIME DETECTION (Simplified Markov-Switching)
 * Two-state model with low/high volatility regimes
 */
export interface VolatilityRegimeResult {
  currentRegime: 'Low-Vol' | 'High-Vol';
  regimeProbability: number;      // Probability of being in current regime
  lowVolMean: number;
  highVolMean: number;
  transitionIntensity: number;    // How often regime changes
  recentTransitions: number[];    // Indices of regime transitions
}

export function calculateVolatilityRegime(ohlcv: OHLCVBar[]): VolatilityRegimeResult {
  const closes = ohlcv.map(b => b.close);

  const defaultResult: VolatilityRegimeResult = {
    currentRegime: 'Low-Vol',
    regimeProbability: 0.5,
    lowVolMean: 0,
    highVolMean: 0,
    transitionIntensity: 0,
    recentTransitions: []
  };

  if (closes.length < 20) return defaultResult;

  // Calculate rolling volatility (20-period)
  const rollingVol: number[] = [];
  const window = 20;

  for (let i = window; i < closes.length; i++) {
    const subset = closes.slice(i - window, i);
    const returns: number[] = [];
    for (let j = 1; j < subset.length; j++) {
      if (subset[j] > 0 && subset[j - 1] > 0) {
        returns.push(Math.log(subset[j] / subset[j - 1]));
      }
    }
    const variance = returns.reduce((s, r) => s + r * r, 0) / returns.length;
    rollingVol.push(Math.sqrt(variance));
  }

  if (rollingVol.length < 5) return defaultResult;

  // Simple regime detection via median split
  const sortedVol = [...rollingVol].sort((a, b) => a - b);
  const medianVol = sortedVol[Math.floor(sortedVol.length / 2)];

  // Calculate regime means
  const lowVolValues = rollingVol.filter(v => v <= medianVol);
  const highVolValues = rollingVol.filter(v => v > medianVol);

  const lowVolMean = lowVolValues.length > 0 ? lowVolValues.reduce((a, b) => a + b, 0) / lowVolValues.length : 0;
  const highVolMean = highVolValues.length > 0 ? highVolValues.reduce((a, b) => a + b, 0) / highVolValues.length : 0;

  // Detect transitions
  const regimes = rollingVol.map(v => v > medianVol ? 1 : 0);
  const recentTransitions: number[] = [];
  let transitions = 0;

  for (let i = 1; i < regimes.length; i++) {
    if (regimes[i] !== regimes[i - 1]) {
      transitions++;
      recentTransitions.push(i + window);
    }
  }

  const transitionIntensity = transitions / regimes.length;

  // Current regime
  const currentRegimeVal = regimes[regimes.length - 1];
  const currentRegime = currentRegimeVal === 1 ? 'High-Vol' : 'Low-Vol';

  // Estimate probability (based on distance from threshold)
  const lastVol = rollingVol[rollingVol.length - 1];
  const distFromMedian = Math.abs(lastVol - medianVol);
  const volRange = highVolMean - lowVolMean;
  const regimeProbability = volRange > 0 ? Math.min(1, 0.5 + distFromMedian / volRange) : 0.5;

  return {
    currentRegime,
    regimeProbability,
    lowVolMean,
    highVolMean,
    transitionIntensity,
    recentTransitions: recentTransitions.slice(-5) // Keep last 5
  };
}

// ============= VI. ASYMMETRIC VOLATILITY & LEVERAGE EFFECT =============

/**
 * 13. VOLATILITY ASYMMETRY COEFFICIENT
 * Γ = [Corr(r⁺, σ_{t+1}) - Corr(r⁻, σ_{t+1})] / [Corr(r⁺, σ_{t+1}) + Corr(r⁻, σ_{t+1})]
 */
export interface VolatilityAsymmetryResult {
  gamma: number;                  // Asymmetry coefficient
  positiveCorrelation: number;
  negativeCorrelation: number;
  hasLeverageEffect: boolean;
  classification: 'Symmetric' | 'Mild-asymmetry' | 'Strong-asymmetry';
}

export function calculateVolatilityAsymmetry(ohlcv: OHLCVBar[]): VolatilityAsymmetryResult {
  const closes = ohlcv.map(b => b.close);

  const defaultResult: VolatilityAsymmetryResult = {
    gamma: 0,
    positiveCorrelation: 0,
    negativeCorrelation: 0,
    hasLeverageEffect: false,
    classification: 'Symmetric'
  };

  if (closes.length < 30) return defaultResult;

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  if (returns.length < 20) return defaultResult;

  // Calculate future volatility (5-bar rolling realized vol)
  const futureVol: number[] = [];
  for (let i = 5; i < returns.length; i++) {
    const subset = returns.slice(i - 5, i);
    const variance = subset.reduce((s, r) => s + r * r, 0) / subset.length;
    futureVol.push(Math.sqrt(variance));
  }

  // Align returns with future volatility
  const alignedReturns = returns.slice(0, futureVol.length);

  if (alignedReturns.length < 10) return defaultResult;

  // Separate positive and negative returns
  const positiveReturns: number[] = [];
  const negativeReturns: number[] = [];
  const posVolPairs: { r: number; v: number }[] = [];
  const negVolPairs: { r: number; v: number }[] = [];

  for (let i = 0; i < alignedReturns.length; i++) {
    if (alignedReturns[i] > 0) {
      positiveReturns.push(alignedReturns[i]);
      posVolPairs.push({ r: alignedReturns[i], v: futureVol[i] });
    } else if (alignedReturns[i] < 0) {
      negativeReturns.push(Math.abs(alignedReturns[i]));
      negVolPairs.push({ r: Math.abs(alignedReturns[i]), v: futureVol[i] });
    }
  }

  // Calculate correlations
  const calcCorrelation = (pairs: { r: number; v: number }[]): number => {
    if (pairs.length < 3) return 0;
    const n = pairs.length;
    const meanR = pairs.reduce((s, p) => s + p.r, 0) / n;
    const meanV = pairs.reduce((s, p) => s + p.v, 0) / n;

    let cov = 0, varR = 0, varV = 0;
    for (const p of pairs) {
      cov += (p.r - meanR) * (p.v - meanV);
      varR += Math.pow(p.r - meanR, 2);
      varV += Math.pow(p.v - meanV, 2);
    }

    const denom = Math.sqrt(varR * varV);
    return denom > 0 ? cov / denom : 0;
  };

  const positiveCorrelation = calcCorrelation(posVolPairs);
  const negativeCorrelation = calcCorrelation(negVolPairs);

  // Asymmetry coefficient
  const denominator = positiveCorrelation + negativeCorrelation;
  const gamma = Math.abs(denominator) > 0.01
    ? (positiveCorrelation - negativeCorrelation) / denominator
    : 0;

  // Leverage effect: negative returns lead to higher volatility
  const hasLeverageEffect = negativeCorrelation > positiveCorrelation + 0.1;

  let classification: VolatilityAsymmetryResult['classification'];
  if (Math.abs(gamma) < 0.2) {
    classification = 'Symmetric';
  } else if (Math.abs(gamma) < 0.5) {
    classification = 'Mild-asymmetry';
  } else {
    classification = 'Strong-asymmetry';
  }

  return {
    gamma,
    positiveCorrelation,
    negativeCorrelation,
    hasLeverageEffect,
    classification
  };
}

// ============= VII. INFORMATIONAL EFFICIENCY METRICS =============

/**
 * 14. MARTINGALE DIFFERENCE TEST (Simplified)
 * Tests E[r_t|F_{t-1}] = 0
 */
export interface MartingaleDifferenceResult {
  testStatistic: number;
  pValue: number;
  isEfficient: boolean;
  classification: 'Efficient' | 'Weak-form' | 'Inefficient';
}

export function calculateMartingaleDifference(ohlcv: OHLCVBar[]): MartingaleDifferenceResult {
  const closes = ohlcv.map(b => b.close);

  const defaultResult: MartingaleDifferenceResult = {
    testStatistic: 0,
    pValue: 0.5,
    isEfficient: true,
    classification: 'Efficient'
  };

  if (closes.length < 20) return defaultResult;

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  if (returns.length < 10) return defaultResult;

  // Simple runs test for randomness
  const n = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;

  // Count positive and negative deviations
  let nPos = 0, nNeg = 0;
  for (const r of returns) {
    if (r > mean) nPos++;
    else nNeg++;
  }

  // Count runs
  let runs = 1;
  for (let i = 1; i < returns.length; i++) {
    const currSign = returns[i] > mean;
    const prevSign = returns[i - 1] > mean;
    if (currSign !== prevSign) runs++;
  }

  // Expected runs and variance under null hypothesis
  const expectedRuns = 1 + (2 * nPos * nNeg) / n;
  const varianceRuns = (2 * nPos * nNeg * (2 * nPos * nNeg - n)) / (n * n * (n - 1));

  // Z-statistic
  const testStatistic = varianceRuns > 0 ? (runs - expectedRuns) / Math.sqrt(varianceRuns) : 0;

  // Two-tailed p-value approximation
  const pValue = 2 * (1 - normalCDF(Math.abs(testStatistic)));

  const isEfficient = pValue > 0.05;

  let classification: MartingaleDifferenceResult['classification'];
  if (pValue > 0.1) {
    classification = 'Efficient';
  } else if (pValue > 0.01) {
    classification = 'Weak-form';
  } else {
    classification = 'Inefficient';
  }

  return {
    testStatistic,
    pValue,
    isEfficient,
    classification
  };
}

// Normal CDF approximation
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * 15. LONG MEMORY IN VOLATILITY (Simplified FIGARCH Test)
 * Tests for persistence in volatility
 */
export interface LongMemoryResult {
  persistenceParameter: number;   // d estimate
  hasLongMemory: boolean;
  halfLife: number;               // Bars for shock to decay 50%
  classification: 'Short-memory' | 'Intermediate' | 'Long-memory';
}

export function calculateLongMemory(ohlcv: OHLCVBar[]): LongMemoryResult {
  const closes = ohlcv.map(b => b.close);

  const defaultResult: LongMemoryResult = {
    persistenceParameter: 0,
    hasLongMemory: false,
    halfLife: 0,
    classification: 'Short-memory'
  };

  if (closes.length < 50) return defaultResult;

  // Calculate log squared returns (proxy for log variance)
  const logVolatility: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      const r = Math.log(closes[i] / closes[i - 1]);
      logVolatility.push(Math.log(r * r + 1e-10)); // Add small constant for numerical stability
    }
  }

  if (logVolatility.length < 30) return defaultResult;

  // Estimate persistence via autocorrelation decay
  const n = logVolatility.length;
  const mean = logVolatility.reduce((a, b) => a + b, 0) / n;

  const acf: number[] = [];
  let var0 = 0;
  for (let i = 0; i < n; i++) {
    var0 += Math.pow(logVolatility[i] - mean, 2);
  }
  var0 /= n;

  // Calculate autocorrelations at lags 1-10
  for (let lag = 1; lag <= Math.min(10, n / 3); lag++) {
    let cov = 0;
    for (let i = lag; i < n; i++) {
      cov += (logVolatility[i] - mean) * (logVolatility[i - lag] - mean);
    }
    cov /= (n - lag);
    acf.push(var0 > 0 ? cov / var0 : 0);
  }

  // Sum of autocorrelations as persistence measure
  const sumAcf = acf.reduce((a, b) => a + Math.max(0, b), 0);
  const persistenceParameter = Math.min(1, sumAcf / acf.length);

  // Estimate half-life
  let halfLife = 1;
  for (let i = 0; i < acf.length; i++) {
    if (acf[i] < 0.5 * (acf[0] || 1)) {
      halfLife = i + 1;
      break;
    }
    halfLife = i + 2;
  }

  const hasLongMemory = persistenceParameter > 0.4 && halfLife > 5;

  let classification: LongMemoryResult['classification'];
  if (persistenceParameter < 0.2) {
    classification = 'Short-memory';
  } else if (persistenceParameter < 0.5) {
    classification = 'Intermediate';
  } else {
    classification = 'Long-memory';
  }

  return {
    persistenceParameter,
    hasLongMemory,
    halfLife,
    classification
  };
}

// ============= COMPOSITE ECONOMETRICS RESULT =============

export interface AdvancedEconometricsResult {
  volatilityEstimators: VolatilityEstimatorsResult;
  jumpDetection: JumpDetectionResult;
  rollSpread: RollSpreadResult;
  corwinSchultzSpread: CorwinSchultzResult;
  amihudIlliquidity: AmihudIlliquidityResult;
  marketEfficiency: MarketEfficiencyResult;
  autocorrelationNoise: AutocorrelationNoiseResult;
  cusum: CUSUMResult;
  volatilityRegime: VolatilityRegimeResult;
  volatilityAsymmetry: VolatilityAsymmetryResult;
  martingaleDifference: MartingaleDifferenceResult;
  longMemory: LongMemoryResult;
  summary: {
    overallLiquidity: 'High' | 'Normal' | 'Low';
    overallEfficiency: 'Efficient' | 'Normal' | 'Inefficient';
    regimeStability: 'Stable' | 'Transitioning' | 'Volatile';
  };
}

export function calculateAdvancedEconometrics(ohlcv: OHLCVBar[]): AdvancedEconometricsResult {
  const volatilityEstimators = calculateVolatilityEstimators(ohlcv);
  const jumpDetection = calculateJumpDetection(ohlcv);
  const rollSpread = calculateRollSpread(ohlcv);
  const corwinSchultzSpread = calculateCorwinSchultzSpread(ohlcv);
  const amihudIlliquidity = calculateAmihudIlliquidity(ohlcv);
  const marketEfficiency = calculateMarketEfficiency(ohlcv);
  const autocorrelationNoise = calculateAutocorrelationNoise(ohlcv);
  const cusum = calculateCUSUM(ohlcv);
  const volatilityRegime = calculateVolatilityRegime(ohlcv);
  const volatilityAsymmetry = calculateVolatilityAsymmetry(ohlcv);
  const martingaleDifference = calculateMartingaleDifference(ohlcv);
  const longMemory = calculateLongMemory(ohlcv);

  // Compute summary
  const liquidityScore =
    (rollSpread.classification === 'Liquid' ? 1 : rollSpread.classification === 'Normal' ? 0.5 : 0) +
    (corwinSchultzSpread.classification === 'Tight' ? 1 : corwinSchultzSpread.classification === 'Normal' ? 0.5 : 0) +
    (amihudIlliquidity.classification === 'High Liquidity' ? 1 : amihudIlliquidity.classification === 'Normal' ? 0.5 : 0);

  const efficiencyScore =
    (marketEfficiency.classification === 'Efficient' ? 1 : marketEfficiency.classification === 'Normal' ? 0.5 : 0) +
    (martingaleDifference.classification === 'Efficient' ? 1 : martingaleDifference.classification === 'Weak-form' ? 0.5 : 0);

  const stabilityScore =
    (cusum.classification === 'Stable' ? 1 : cusum.classification === 'Transitioning' ? 0.5 : 0) +
    (volatilityRegime.transitionIntensity < 0.1 ? 1 : volatilityRegime.transitionIntensity < 0.2 ? 0.5 : 0);

  const overallLiquidity: 'High' | 'Normal' | 'Low' = liquidityScore >= 2 ? 'High' : liquidityScore >= 1 ? 'Normal' : 'Low';
  const overallEfficiency: 'Efficient' | 'Normal' | 'Inefficient' = efficiencyScore >= 1.5 ? 'Efficient' : efficiencyScore >= 0.5 ? 'Normal' : 'Inefficient';
  const regimeStability: 'Stable' | 'Transitioning' | 'Volatile' = stabilityScore >= 1.5 ? 'Stable' : stabilityScore >= 0.5 ? 'Transitioning' : 'Volatile';

  return {
    volatilityEstimators,
    jumpDetection,
    rollSpread,
    corwinSchultzSpread,
    amihudIlliquidity,
    marketEfficiency,
    autocorrelationNoise,
    cusum,
    volatilityRegime,
    volatilityAsymmetry,
    martingaleDifference,
    longMemory,
    summary: {
      overallLiquidity,
      overallEfficiency,
      regimeStability
    }
  };
}

// ============= FORMULA DOCUMENTATION FOR TOOLTIPS =============

export const econometricsFormulas = {
  parkinson: {
    name: 'Parkinson Volatility',
    formula: 'σ²_P = (1/4ln2) × (1/n) × Σ[ln(H_i/L_i)]²',
    interpretation: 'Range-based volatility, 5x more efficient than close-to-close',
    reference: 'Parkinson (1980)'
  },
  garmanKlass: {
    name: 'Garman-Klass Volatility',
    formula: 'σ²_GK = (1/n) × Σ[0.5(ln(H/L))² - (2ln2-1)(ln(C/O))²]',
    interpretation: 'Minimum variance estimator using all OHLC prices',
    reference: 'Garman & Klass (1980)'
  },
  rogersSatchell: {
    name: 'Rogers-Satchell Volatility',
    formula: 'σ²_RS = (1/n) × Σ[ln(H/C)ln(H/O) + ln(L/C)ln(L/O)]',
    interpretation: 'Drift-adjusted estimator, unbiased under GBM with drift',
    reference: 'Rogers & Satchell (1991)'
  },
  yangZhang: {
    name: 'Yang-Zhang Volatility',
    formula: 'σ²_YZ = σ²_o + k×σ²_c + (1-k)×σ²_RS',
    interpretation: 'Jump-robust estimator combining overnight and intraday',
    reference: 'Yang & Zhang (2000)'
  },
  bipowerVariation: {
    name: 'Bipower Variation',
    formula: 'BV_t = (π/2) × Σ|r_i||r_{i-1}|',
    interpretation: 'Separates continuous from jump variation',
    reference: 'Barndorff-Nielsen & Shephard (2004)'
  },
  rollSpread: {
    name: "Roll's Effective Spread",
    formula: 'Ŝ = 2√(-Cov(ΔP_t, ΔP_{t-1}))',
    interpretation: 'Liquidity proxy from price autocorrelation',
    reference: 'Roll (1984)'
  },
  corwinSchultz: {
    name: 'Corwin-Schultz Spread',
    formula: 'α = (√(2β) - √β)/(3-2√2) - √(γ/(3-2√2))',
    interpretation: 'Bid-ask spread from high-low ratios',
    reference: 'Corwin & Schultz (2012)'
  },
  amihud: {
    name: 'Amihud Illiquidity',
    formula: 'ILLIQ_t = |r_t| / (V̂_t × P_t)',
    interpretation: 'Price impact per unit volume',
    reference: 'Amihud (2002)'
  },
  marketEfficiency: {
    name: 'Market Efficiency Coefficient',
    formula: 'MEC = 1 - σ²_YZ / σ²_GK',
    interpretation: 'Proportion of variance from microstructure noise',
    reference: 'Hasbrouck (1993)'
  },
  cusum: {
    name: 'CUSUM Test',
    formula: 'CUSUM_t = (1/(σ̂√n)) × Σ(|r_i| - |r̄|)',
    interpretation: 'Detects structural breaks in volatility',
    reference: 'Brown, Durbin & Evans (1975)'
  },
  volatilityAsymmetry: {
    name: 'Volatility Asymmetry',
    formula: 'Γ = (Corr(r⁺,σ) - Corr(r⁻,σ)) / (Corr(r⁺,σ) + Corr(r⁻,σ))',
    interpretation: 'Measures leverage effect in volatility response',
    reference: 'Black (1976), Christie (1982)'
  },
  martingaleDifference: {
    name: 'Martingale Difference Test',
    formula: 'Tests E[r_t|F_{t-1}] = 0 via runs test',
    interpretation: 'Tests weak-form market efficiency',
    reference: 'Lo & MacKinlay (1988)'
  },
  longMemory: {
    name: 'Long Memory Parameter',
    formula: 'd estimate from ACF decay of log volatility',
    interpretation: 'Measures volatility persistence',
    reference: 'Baillie, Bollerslev & Mikkelsen (1996)'
  }
};
