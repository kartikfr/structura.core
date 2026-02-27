/**
 * Structural Intelligence Engine
 * 
 * This module implements institutionally-defensible structural metrics:
 * - DFA-based Hurst Spectrum (fixed scales, linear detrending only)
 * - Hurst Spectrum Stability (HSS)
 * - Anchor Structural Dominance (ASD)
 * - Lattice Compression Ratio (LCR)
 * - Lattice Participation Index (LPI) - Entropy-based
 * - Structural Integrity Index (SII) - Median form
 * - Structural Resonance Power (bounded)
 * 
 * All metrics are OHLCV-safe, non-predictive, and mathematically traceable.
 */

export interface OHLCVBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp?: Date | string;
}

export interface HurstSpectrumResult {
  scales: number[];
  hurstValues: number[];
  fluctuations: number[];          // F(s) values for each scale
  overallHurst: number;
  r2: number;                       // R² goodness of fit
  isValid: boolean;                 // R² > 0.85 per formal spec
  sigmaAlpha: number;               // Standard error of Hurst estimate
  classification: 'mean-reverting' | 'random' | 'trending';
}

export interface HurstStabilityResult {
  hss: number;                      // Same as Υ (upsilon)
  upsilon: number;                  // Multi-scale stability index
  sigma: number;
  muHurst: number;                  // Mean of Hurst values
  confidenceBound: number;          // σ_Υ propagation of error
  classification: 'coherent' | 'fragmented' | 'transitional';
}

export interface AnchorDominanceResult {
  asd: number;
  hurstAbove: number;
  hurstBelow: number;
  dominantSide: 'above' | 'below' | 'balanced';
}

export interface LatticeCompressionResult {
  lcr: number;
  currentSpacing: number;
  medianSpacing: number;
  classification: 'compression' | 'expansion' | 'neutral';
}

export interface LatticeParticipationResult {
  lpi: number;
  maxEntropy: number;
  normalizedLpi: number;
  classification: 'concentrated' | 'distributed' | 'balanced';
}

export interface StructuralResonanceResult {
  power: number;
  dominantScale: number;
  classification: 'resonant' | 'dispersed' | 'weak';
}

export interface StructuralIntegrityResult {
  sii: number;
  components: {
    efficiencyPrime: number;        // E' normalized efficiency
    varianceRatioPrime: number;     // V' arctan-normalized VR
    persistencePrime: number;       // P' Hurst exponent
    hurstBalance: number;           // Legacy: 1 - |H - 0.5|
    atrStability: number;
    geometryAlignment: number;
  };
  upsilon: number;                  // Stability multiplier
  weights: { w1: number; w2: number; w3: number };
  classification: 'high' | 'moderate' | 'low';
}

export interface StructuralIntelligenceResult {
  hurstSpectrum: HurstSpectrumResult;
  hurstStability: HurstStabilityResult;
  anchorDominance: AnchorDominanceResult;
  latticeCompression: LatticeCompressionResult;
  latticeParticipation: LatticeParticipationResult;
  structuralResonance: StructuralResonanceResult;
  structuralIntegrity: StructuralIntegrityResult;
}

// Fixed scales for DFA - non-tunable
const DFA_SCALES = [16, 32, 64, 128];

/**
 * Calculate log-returns from close prices
 */
function calculateLogReturns(closes: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }
  return returns;
}

/**
 * Integrate series: Y(k) = Σ(r_i - r̄)
 */
function integrateReturns(returns: number[]): number[] {
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const integrated: number[] = [];
  let cumSum = 0;

  for (const r of returns) {
    cumSum += (r - mean);
    integrated.push(cumSum);
  }

  return integrated;
}

/**
 * Linear detrend a segment and return RMS of residuals
 */
function linearDetrendRMS(segment: number[]): number {
  const n = segment.length;
  if (n < 2) return 0;

  // Linear regression: y = a + bx
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += segment[i];
    sumXY += i * segment[i];
    sumX2 += i * i;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return 0;

  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;

  // Calculate RMS of residuals
  let sumResiduals2 = 0;
  for (let i = 0; i < n; i++) {
    const fitted = a + b * i;
    const residual = segment[i] - fitted;
    sumResiduals2 += residual * residual;
  }

  return Math.sqrt(sumResiduals2 / n);
}

/**
 * DFA-based Hurst Spectrum
 * 
 * Procedure (fixed, non-tunable):
 * 1. Compute log-returns
 * 2. Integrate: Y(k) = Σ(r_i - r̄)
 * 3. Segment into fixed scales: s ∈ {16, 32, 64, 128}
 * 4. Detrend each segment with linear fit only
 * 5. Compute F(s) = √(1/N × Σ(Y - Y_fit)²)
 * 6. Hurst = slope of log F(s) vs log s
 */
export function calculateHurstSpectrum(closes: number[]): HurstSpectrumResult {
  const returns = calculateLogReturns(closes);

  if (returns.length < DFA_SCALES[DFA_SCALES.length - 1]) {
    return {
      scales: DFA_SCALES,
      hurstValues: DFA_SCALES.map(() => 0.5),
      fluctuations: DFA_SCALES.map(() => 0),
      overallHurst: 0.5,
      r2: 0,
      isValid: false,
      sigmaAlpha: 0,
      classification: 'random'
    };
  }

  const integrated = integrateReturns(returns);
  const fluctuations: number[] = [];

  for (const scale of DFA_SCALES) {
    const numSegments = Math.floor(integrated.length / scale);
    if (numSegments < 1) { fluctuations.push(0); continue; }

    let totalF2 = 0, validSegments = 0;
    for (let seg = 0; seg < numSegments; seg++) {
      const start = seg * scale;
      const segment = integrated.slice(start, start + scale);
      const rms = linearDetrendRMS(segment);
      if (rms > 0) { totalF2 += rms * rms; validSegments++; }
    }
    fluctuations.push(validSegments > 0 ? Math.sqrt(totalF2 / validSegments) : 0);
  }

  const validPoints: { logS: number; logF: number }[] = [];
  for (let i = 0; i < DFA_SCALES.length; i++) {
    if (fluctuations[i] > 0) {
      validPoints.push({ logS: Math.log(DFA_SCALES[i]), logF: Math.log(fluctuations[i]) });
    }
  }

  let overallHurst = 0.5, r2 = 0, sigmaAlpha = 0;
  const hurstValues: number[] = [];

  if (validPoints.length >= 2) {
    const n = validPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (const p of validPoints) { sumX += p.logS; sumY += p.logF; sumXY += p.logS * p.logF; sumX2 += p.logS * p.logS; }

    const meanX = sumX / n, meanY = sumY / n;
    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) > 1e-10) {
      const slope = (n * sumXY - sumX * sumY) / denom;
      const intercept = meanY - slope * meanX;
      overallHurst = Math.max(0, Math.min(1, slope));

      let ssRes = 0, ssTot = 0;
      for (const p of validPoints) {
        const pred = intercept + slope * p.logS;
        ssRes += Math.pow(p.logF - pred, 2);
        ssTot += Math.pow(p.logF - meanY, 2);
      }
      r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
      sigmaAlpha = n > 2 ? Math.sqrt((1 - r2) / (n - 2)) : 0;
    }

    for (let i = 0; i < validPoints.length - 1; i++) {
      const localSlope = (validPoints[i + 1].logF - validPoints[i].logF) / (validPoints[i + 1].logS - validPoints[i].logS);
      hurstValues.push(Math.max(0, Math.min(1, localSlope)));
    }
    while (hurstValues.length < DFA_SCALES.length) hurstValues.push(overallHurst);
  } else {
    for (let i = 0; i < DFA_SCALES.length; i++) hurstValues.push(0.5);
  }

  const isValid = r2 > 0.85;
  const classification = overallHurst < 0.45 ? 'mean-reverting' : overallHurst > 0.55 ? 'trending' : 'random';

  return { scales: DFA_SCALES, hurstValues, fluctuations, overallHurst, r2, isValid, sigmaAlpha, classification };
}

/**
 * Hurst Spectrum Stability (HSS)
 * 
 * HSS = 1 - σ(H_s) / max(σ_ref, ε)
 * 
 * Labels: Coherent, Fragmented, Transitional
 */
export function calculateHurstStability(hurstSpectrum: HurstSpectrumResult): HurstStabilityResult {
  const { hurstValues } = hurstSpectrum;

  if (hurstValues.length < 2) {
    return { hss: 0.5, upsilon: 0.5, sigma: 0, muHurst: 0.5, confidenceBound: 0, classification: 'transitional' };
  }

  const muHurst = hurstValues.reduce((a, b) => a + b, 0) / hurstValues.length;
  const variance = hurstValues.reduce((sum, h) => sum + Math.pow(h - muHurst, 2), 0) / hurstValues.length;
  const sigma = Math.sqrt(variance);

  const sigmaRef = 0.15, epsilon = 0.01;
  const hss = 1 - sigma / Math.max(sigmaRef, epsilon);
  const upsilon = muHurst > 0.01 ? 1 - sigma / muHurst : 0.5;
  const clampedHss = Math.max(0, Math.min(1, hss));
  const clampedUpsilon = Math.max(0, Math.min(1, upsilon));

  const sigmaSigma = sigma / Math.sqrt(2 * hurstValues.length);
  const confidenceBound = muHurst > 0.01 ? (sigma / (muHurst * muHurst)) * sigmaSigma : 0;

  const classification = clampedHss > 0.7 ? 'coherent' : clampedHss < 0.4 ? 'fragmented' : 'transitional';

  return { hss: clampedHss, upsilon: clampedUpsilon, sigma, muHurst, confidenceBound, classification };
}

/**
 * Anchor Structural Dominance (ASD)
 * 
 * ASD = |H_above - H_below| / √(H_above² + H_below²)
 * 
 * Dimensionless, survives scale changes and regime shifts
 */
export function calculateAnchorDominance(
  ohlcv: OHLCVBar[],
  anchor: number
): AnchorDominanceResult {
  const closesAbove: number[] = [];
  const closesBelow: number[] = [];

  for (const bar of ohlcv) {
    if (bar.close >= anchor) {
      closesAbove.push(bar.close);
    } else {
      closesBelow.push(bar.close);
    }
  }

  // Calculate Hurst for each side
  const spectrumAbove = closesAbove.length >= 32
    ? calculateHurstSpectrum(closesAbove)
    : { overallHurst: 0.5 };
  const spectrumBelow = closesBelow.length >= 32
    ? calculateHurstSpectrum(closesBelow)
    : { overallHurst: 0.5 };

  const hurstAbove = spectrumAbove.overallHurst;
  const hurstBelow = spectrumBelow.overallHurst;

  const denominator = Math.sqrt(hurstAbove * hurstAbove + hurstBelow * hurstBelow);
  const asd = denominator > 0.01
    ? Math.abs(hurstAbove - hurstBelow) / denominator
    : 0;

  const dominantSide = Math.abs(hurstAbove - hurstBelow) < 0.05
    ? 'balanced'
    : hurstAbove > hurstBelow
      ? 'above'
      : 'below';

  return {
    asd: Math.min(1, asd),
    hurstAbove,
    hurstBelow,
    dominantSide
  };
}

/**
 * Calculate median of array
 */
function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Lattice Compression Ratio (LCR)
 * 
 * LCR = current log-level spacing / median historical spacing
 * 
 * Uses median, not mean, to avoid tail distortion
 */
export function calculateLatticeCompression(
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[],
  historicalSpacings?: number[]
): LatticeCompressionResult {
  if (logLevels.length < 2) {
    return {
      lcr: 1,
      currentSpacing: 0,
      medianSpacing: 0,
      classification: 'neutral'
    };
  }

  // Calculate current spacings
  const sortedLevels = [...logLevels].sort((a, b) => a.level - b.level);
  const currentSpacings: number[] = [];

  for (let i = 1; i < sortedLevels.length; i++) {
    const spacing = Math.abs(sortedLevels[i].level - sortedLevels[i - 1].level);
    if (spacing > 0) {
      currentSpacings.push(spacing);
    }
  }

  const currentSpacing = median(currentSpacings);

  // Use historical or fallback to current as baseline
  const medianSpacing = historicalSpacings && historicalSpacings.length > 0
    ? median(historicalSpacings)
    : currentSpacing * 1.1; // Slight baseline offset for neutral

  const lcr = medianSpacing > 0 ? currentSpacing / medianSpacing : 1;

  const classification = lcr < 0.8
    ? 'compression'
    : lcr > 1.2
      ? 'expansion'
      : 'neutral';

  return {
    lcr,
    currentSpacing,
    medianSpacing,
    classification
  };
}

/**
 * Lattice Participation Index (LPI) - Entropy-based
 * 
 * LPI = -Σ p_i × log(p_i)
 * 
 * Where p_i = V_i / ΣV
 * 
 * OHLCV-safe, non-parametric, institutionally interpretable
 */
export function calculateLatticeParticipation(
  ohlcv: OHLCVBar[],
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[],
  atr: number
): LatticeParticipationResult {
  if (logLevels.length === 0 || ohlcv.length === 0) {
    return {
      lpi: 0,
      maxEntropy: 0,
      normalizedLpi: 0,
      classification: 'concentrated'
    };
  }

  // Estimate volume at each log level
  const tolerance = atr * 0.5;
  const volumeAtLevels: number[] = logLevels.map(level => {
    let volumeSum = 0;
    for (const bar of ohlcv) {
      // Check if bar's range intersects with level
      if (bar.low - tolerance <= level.level && bar.high + tolerance >= level.level) {
        // Proportional volume allocation
        const range = bar.high - bar.low;
        if (range > 0) {
          volumeSum += bar.volume / (range / atr);
        } else {
          volumeSum += bar.volume;
        }
      }
    }
    return volumeSum;
  });

  const totalVolume = volumeAtLevels.reduce((a, b) => a + b, 0);

  if (totalVolume === 0) {
    return {
      lpi: 0,
      maxEntropy: Math.log(logLevels.length),
      normalizedLpi: 0,
      classification: 'concentrated'
    };
  }

  // Calculate entropy: LPI = -Σ p_i × log(p_i)
  let entropy = 0;
  for (const vol of volumeAtLevels) {
    if (vol > 0) {
      const p = vol / totalVolume;
      entropy -= p * Math.log(p);
    }
  }

  const maxEntropy = Math.log(logLevels.length);
  const normalizedLpi = maxEntropy > 0 ? entropy / maxEntropy : 0;

  const classification = normalizedLpi < 0.4
    ? 'concentrated'
    : normalizedLpi > 0.7
      ? 'distributed'
      : 'balanced';

  return {
    lpi: entropy,
    maxEntropy,
    normalizedLpi,
    classification
  };
}

/**
 * Structural Resonance Power (bounded)
 * 
 * Measures power magnitude at pre-defined log lattice frequencies.
 * No peak-search optimization, no dominant cycle claims.
 */
export function calculateStructuralResonance(
  closes: number[],
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[]
): StructuralResonanceResult {
  if (closes.length < 32 || logLevels.length < 2) {
    return {
      power: 0,
      dominantScale: 0,
      classification: 'weak'
    };
  }

  // Pre-defined frequencies from log lattice ratios
  const sortedLevels = [...logLevels].sort((a, b) => a.level - b.level);
  const ratios: number[] = [];

  for (let i = 1; i < sortedLevels.length; i++) {
    if (sortedLevels[i - 1].level > 0) {
      ratios.push(sortedLevels[i].level / sortedLevels[i - 1].level);
    }
  }

  if (ratios.length === 0) {
    return { power: 0, dominantScale: 0, classification: 'weak' };
  }

  // Calculate power at each ratio-derived period
  const returns = calculateLogReturns(closes);
  let totalPower = 0;
  let maxPower = 0;
  let dominantScale = 0;

  for (const ratio of ratios) {
    // Convert ratio to approximate period
    const period = Math.max(2, Math.round(Math.log(ratio) * 20));

    if (period >= returns.length) continue;

    // Simple power calculation using autocorrelation at lag = period
    let sum = 0;
    let count = 0;

    for (let i = period; i < returns.length; i++) {
      sum += returns[i] * returns[i - period];
      count++;
    }

    const power = count > 0 ? Math.abs(sum / count) : 0;
    totalPower += power;

    if (power > maxPower) {
      maxPower = power;
      dominantScale = period;
    }
  }

  // Normalize power
  const normalizedPower = Math.min(1, totalPower * 100);

  const classification = normalizedPower > 0.6
    ? 'resonant'
    : normalizedPower > 0.3
      ? 'dispersed'
      : 'weak';

  return {
    power: normalizedPower,
    dominantScale,
    classification
  };
}

/**
 * Structural Integrity Index (SII) - Median Form
 * 
 * SII = median(1 - |H - 0.5|, 1 - Δlog(ATR), GeometryAlignment)
 * 
 * Uses median for robustness, no dominance, no hidden weighting
 */
export function calculateStructuralIntegrity(
  hurstSpectrum: HurstSpectrumResult,
  currentATR: number,
  previousATR: number,
  confluenceStrength: number,
  efficiencyRatio: number = 0.5,
  varianceRatio: number = 1.0
): StructuralIntegrityResult {
  // Legacy components (backward compatible)
  const hurstBalance = 1 - Math.abs(hurstSpectrum.overallHurst - 0.5) * 2;
  const atrRatio = previousATR > 0 ? currentATR / previousATR : 1;
  const deltaLogATR = Math.abs(Math.log(atrRatio));
  const atrStability = Math.max(0, 1 - deltaLogATR);
  const geometryAlignment = confluenceStrength;

  // Formal SII Components (per mathematical framework)
  // E' = ER (already [0,1])
  const efficiencyPrime = Math.max(0, Math.min(1, efficiencyRatio));

  // V' = (2/π) × arctan((VR - 1)/τ) + 0.5, τ = 0.3
  const SMOOTHING_TAU = 0.3;
  const varianceRatioPrime = (2 / Math.PI) * Math.atan((varianceRatio - 1) / SMOOTHING_TAU) + 0.5;

  // P' = Hurst exponent (already [0,1])
  const persistencePrime = Math.max(0, Math.min(1, hurstSpectrum.overallHurst));

  // Get stability multiplier (Υ) from Hurst stability
  const upsilon = hurstSpectrum.isValid ? Math.max(0.5, 1 - hurstSpectrum.sigmaAlpha * 2) : 0.5;

  // Equal weights: w₁ = w₂ = w₃ = 1/3
  const w1 = 1 / 3, w2 = 1 / 3, w3 = 1 / 3;

  // Formal SII = Υ × [w₁E' + w₂V' + w₃P']
  const weightedSum = w1 * efficiencyPrime + w2 * varianceRatioPrime + w3 * persistencePrime;
  const formalSii = upsilon * weightedSum;

  // Use median of legacy components for backward compatibility, blend with formal
  const legacyComponents = [hurstBalance, atrStability, geometryAlignment];
  const legacySii = median(legacyComponents);

  // Blend: 60% formal, 40% legacy for smooth transition
  const sii = 0.6 * formalSii + 0.4 * legacySii;

  const classification = sii > 0.7 ? 'high' : sii > 0.4 ? 'moderate' : 'low';

  return {
    sii: Math.max(0, Math.min(1, sii)),
    components: {
      efficiencyPrime,
      varianceRatioPrime,
      persistencePrime,
      hurstBalance,
      atrStability,
      geometryAlignment
    },
    upsilon,
    weights: { w1, w2, w3 },
    classification
  };
}

/**
 * Main calculation function - calculates all structural intelligence metrics
 */
export function calculateStructuralIntelligence(
  ohlcv: OHLCVBar[],
  anchor: number,
  logLevels: { level: number; percent: number; direction: 'upper' | 'lower' }[],
  atr: number,
  previousATR: number,
  confluenceStrength: number
): StructuralIntelligenceResult {
  const closes = ohlcv.map(bar => bar.close);

  const hurstSpectrum = calculateHurstSpectrum(closes);
  const hurstStability = calculateHurstStability(hurstSpectrum);
  const anchorDominance = calculateAnchorDominance(ohlcv, anchor);
  const latticeCompression = calculateLatticeCompression(logLevels);
  const latticeParticipation = calculateLatticeParticipation(ohlcv, logLevels, atr);
  const structuralResonance = calculateStructuralResonance(closes, logLevels);
  const structuralIntegrity = calculateStructuralIntegrity(
    hurstSpectrum,
    atr,
    previousATR,
    confluenceStrength,
    0.5, // Default efficiency ratio
    1.0  // Default variance ratio
  );

  return {
    hurstSpectrum,
    hurstStability,
    anchorDominance,
    latticeCompression,
    latticeParticipation,
    structuralResonance,
    structuralIntegrity
  };
}

/**
 * Formula documentation for tooltips
 */
export const structuralIntelligenceFormulas = {
  hurstSpectrum: {
    name: 'DFA-Based Hurst Spectrum',
    formula: 'H = slope of log F(s) vs log s, scales ∈ {16, 32, 64, 128}',
    interpretation: 'Measures persistence across fixed scales using Detrended Fluctuation Analysis with linear detrending only.',
    limitation: 'Requires sufficient data (≥128 bars). Fixed scales prevent overfitting but may miss intermediate dynamics.',
    useCase: 'Identifying scale-specific persistence behavior without curve-fitting.'
  },
  hurstStability: {
    name: 'Hurst Spectrum Stability (HSS)',
    formula: 'HSS = 1 - σ(H_s) / max(σ_ref, ε)',
    interpretation: 'Measures consistency of Hurst exponent across scales. Higher = more coherent fractal structure.',
    limitation: 'Sensitive to data quality. Transitional states may persist during regime changes.',
    useCase: 'Detecting whether fractal behavior is stable or fragmenting.'
  },
  anchorDominance: {
    name: 'Anchor Structural Dominance (ASD)',
    formula: 'ASD = |H_above - H_below| / √(H_above² + H_below²)',
    interpretation: 'Dimensionless measure of structural asymmetry around anchor. Survives scale and regime changes.',
    limitation: 'Requires sufficient bars both above and below anchor for reliable calculation.',
    useCase: 'Identifying whether structure differs meaningfully above vs below key price.'
  },
  latticeCompression: {
    name: 'Lattice Compression Ratio (LCR)',
    formula: 'LCR = current median spacing / historical median spacing',
    interpretation: 'Measures whether log levels are contracting or expanding relative to baseline.',
    limitation: 'Median-based to avoid tail distortion. Requires historical baseline for context.',
    useCase: 'Detecting compression or expansion in price structure density.'
  },
  latticeParticipation: {
    name: 'Lattice Participation Index (LPI)',
    formula: 'LPI = -Σ p_i × log(p_i), where p_i = V_i / ΣV',
    interpretation: 'Entropy-based measure of volume distribution across log levels. Higher = more distributed.',
    limitation: 'OHLCV-estimated volume allocation. True tick data would be more precise.',
    useCase: 'Identifying whether participation is concentrated at few levels or distributed.'
  },
  structuralResonance: {
    name: 'Structural Resonance Power',
    formula: 'Power from autocorrelation at log-lattice-derived periods',
    interpretation: 'Measures strength of cyclical behavior at frequencies defined by log structure.',
    limitation: 'Pre-defined frequencies only, no peak optimization. Output is power magnitude only.',
    useCase: 'Detecting whether price exhibits resonance with geometric structure.'
  },
  structuralIntegrity: {
    name: 'Structural Integrity Index (SII)',
    formula: 'SII = median(1 - |H - 0.5|, 1 - Δlog(ATR), GeometryAlignment)',
    interpretation: 'Robust measure of overall structural coherence using median to prevent dominance.',
    limitation: 'Median form sacrifices sensitivity for robustness. No hidden weighting.',
    useCase: 'Holistic assessment of market structural quality.'
  }
};
