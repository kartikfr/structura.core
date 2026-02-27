/**
 * STRUCTURA CORE: FORMAL MATHEMATICAL FRAMEWORK
 * 
 * Deterministic Market Structure Observables
 * 
 * All metrics are:
 * - Deterministic: f(D, Θ) is unique and reproducible
 * - Non-predictive: No forward-looking inference
 * - Bounded: Closed temporal window only
 * 
 * Reference: STRUCTURA CORE Formal Mathematical Framework v1.0
 */

// ============= AXIOMATIC FOUNDATIONS =============

/**
 * Observable Universe Tuple
 * D_t = (O_t, H_t, L_t, C_t, V̂_t)
 * where V̂_t represents participation density (not traded volume)
 */
export interface OHLCVBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp?: Date | string;
}

// ============= FORMAL METRIC DEFINITIONS =============

/**
 * 1. PRICE EFFICIENCY METRIC (Structural Cleanliness)
 * 
 * Definition:
 * ER_t(n) = |C_t - C_{t-n}| / Σ|C_{t-i+1} - C_{t-i}|
 * 
 * Mathematical Properties:
 * - Boundedness: 0 ≤ ER_t(n) ≤ 1
 * - Scale Invariance: ER_t(n) is dimensionless
 * - Symmetry: ER_t(n) = ER_t(n) under time reversal of stationary series
 * 
 * Edge Cases:
 * - ER = 1 if denominator = 0 (all closes equal)
 * - ER = 0 if numerator = 0 and denominator > 0
 */
export interface EfficiencyRatioResult {
  value: number;
  netChange: number;
  totalPath: number;
  classification: 'Structured' | 'Diffusive' | 'Noisy' | 'Insufficient data';
}

export function calculateEfficiencyRatio(
  closes: number[],
  lookback: number = 50
): EfficiencyRatioResult {
  const n = Math.min(closes.length, lookback);

  if (n < 2) {
    return {
      value: 0.5,
      netChange: 0,
      totalPath: 0,
      classification: 'Insufficient data'
    };
  }

  const subset = closes.slice(-n);

  // Net change: |C_t - C_{t-n}|
  const netChange = Math.abs(subset[subset.length - 1] - subset[0]);

  // Total path: Σ|C_{t-i+1} - C_{t-i}|
  let totalPath = 0;
  for (let i = 1; i < subset.length; i++) {
    totalPath += Math.abs(subset[i] - subset[i - 1]);
  }

  // Edge case handling
  let er: number;
  if (totalPath === 0) {
    // All closes equal - perfect efficiency
    er = 1;
  } else if (netChange === 0) {
    // No net movement despite path
    er = 0;
  } else {
    er = netChange / totalPath;
  }

  // Formal classification (Rule 1)
  let classification: EfficiencyRatioResult['classification'];
  if (er > 0.6) {
    classification = 'Structured';
  } else if (er >= 0.4) {
    classification = 'Diffusive';
  } else {
    classification = 'Noisy';
  }

  return {
    value: Math.max(0, Math.min(1, er)), // Enforce boundedness
    netChange,
    totalPath,
    classification
  };
}

/**
 * 2. VARIANCE RATIO (Aggregation Structure)
 * 
 * Definition:
 * Let r_t = ln(C_t) - ln(C_{t-1}) be log returns
 * r^(k)_t = ln(C_t) - ln(C_{t-k}) be k-period overlapping returns
 * 
 * VR_t(k, n) = V[{r^(k)_i}] / (k × V[{r_i}])
 * 
 * where V[X] is UNBIASED sample variance:
 * V[X] = (1/(|X|-1)) × Σ(x - x̄)²
 * 
 * Statistical Properties:
 * Under random walk null hypothesis:
 * - E[VR_t(k, n)] = 1
 * - V[VR_t(k, n)] ≈ 2(2k-1)(k-1) / (3kn)
 */
export interface VarianceRatioResult {
  value: number;
  var1: number;           // Variance of 1-period returns
  varK: number;           // Variance of k-period returns
  k: number;              // Aggregation period
  n: number;              // Sample size
  theoreticalVariance: number; // V[VR] under random walk
  classification: 'Trending' | 'Mean-reverting' | 'Random' | 'Insufficient data';
}

export function calculateVarianceRatio(
  closes: number[],
  k: number = 5,
  n?: number
): VarianceRatioResult {
  const sampleSize = n ?? closes.length;

  if (sampleSize < k + 10) {
    return {
      value: 1,
      var1: 0,
      varK: 0,
      k,
      n: sampleSize,
      theoreticalVariance: 0,
      classification: 'Insufficient data'
    };
  }

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
    return {
      value: 1,
      var1: 0,
      varK: 0,
      k,
      n: sampleSize,
      theoreticalVariance: 0,
      classification: 'Insufficient data'
    };
  }

  // UNBIASED sample variance: V[X] = (1/(|X|-1)) × Σ(x - x̄)²
  const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
  const var1 = returns1.reduce((sum, r) => sum + Math.pow(r - mean1, 2), 0) / (returns1.length - 1);

  const meanK = returnsK.reduce((a, b) => a + b, 0) / returnsK.length;
  const varK = returnsK.reduce((sum, r) => sum + Math.pow(r - meanK, 2), 0) / (returnsK.length - 1);

  // Variance ratio: VR = Var(k) / (k × Var(1))
  const vr = var1 > 0 ? varK / (k * var1) : 1;

  // Theoretical variance under random walk: V[VR] ≈ 2(2k-1)(k-1) / (3kn)
  const theoreticalVariance = (2 * (2 * k - 1) * (k - 1)) / (3 * k * sampleSize);

  // Classification
  let classification: VarianceRatioResult['classification'];
  if (vr > 1.15) {
    classification = 'Trending';
  } else if (vr < 0.85) {
    classification = 'Mean-reverting';
  } else {
    classification = 'Random';
  }

  return {
    value: vr,
    var1,
    varK,
    k,
    n: sampleSize,
    theoreticalVariance,
    classification
  };
}

/**
 * 3. DETRENDED FLUCTUATION ANALYSIS (Fractal Persistence)
 * 
 * Algorithm (Formal):
 * 1. Integration: Y(i) = Σ(C_j - C̄) for j=1 to i
 * 2. Segmentation: Partition into N_s = ⌊N/s⌋ segments
 * 3. Detrending: Linear least-squares fit in each segment
 * 4. Fluctuation: F(s) = √((1/N_s) × Σ F²(v,s))
 * 5. Scaling Law: F(s) ∝ s^α (OLS regression)
 * 
 * Consistency Check:
 * R²_DFA = 1 - Σ(log F(s_i) - α̂ log s_i - ĉ)² / Σ(log F(s_i) - mean)²
 * Require R²_DFA > 0.85 for valid estimation
 */
export interface DFAResult {
  scales: number[];
  fluctuations: number[];
  hurstExponent: number;
  r2: number;                    // R² goodness of fit
  isValid: boolean;              // R² > 0.85
  classification: 'Trending' | 'Mean-reverting' | 'Random';
  confidenceInterval?: { lower: number; upper: number };
}

// Fixed scales for DFA - non-tunable (Axiom 3)
const DFA_SCALES = [16, 32, 64, 128];

/**
 * Integrate returns: Y(k) = Σ(r_i - r̄)
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
 * Linear detrend and return RMS of residuals
 * Uses ordinary least squares fit: y = a + bx
 */
function linearDetrendRMS(segment: number[]): number {
  const n = segment.length;
  if (n < 2) return 0;

  // Linear regression
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

  // Calculate RMS of residuals: F²(v,s) = (1/s) × Σ(Y - Ŷ)²
  let sumResiduals2 = 0;
  for (let i = 0; i < n; i++) {
    const fitted = a + b * i;
    const residual = segment[i] - fitted;
    sumResiduals2 += residual * residual;
  }

  return Math.sqrt(sumResiduals2 / n);
}

export function calculateDFA(closes: number[]): DFAResult {
  // Calculate log returns for scale invariance
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }

  const defaultResult: DFAResult = {
    scales: DFA_SCALES,
    fluctuations: DFA_SCALES.map(() => 0),
    hurstExponent: 0.5,
    r2: 0,
    isValid: false,
    classification: 'Random'
  };

  if (returns.length < DFA_SCALES[DFA_SCALES.length - 1]) {
    return defaultResult;
  }

  // Step 1: Integration
  const integrated = integrateReturns(returns);

  // Step 2-4: Segmentation, Detrending, Fluctuation calculation
  const fluctuations: number[] = [];

  for (const scale of DFA_SCALES) {
    const numSegments = Math.floor(integrated.length / scale);
    if (numSegments < 1) {
      fluctuations.push(0);
      continue;
    }

    let totalF2 = 0;
    let validSegments = 0;

    for (let seg = 0; seg < numSegments; seg++) {
      const start = seg * scale;
      const segment = integrated.slice(start, start + scale);
      const rms = linearDetrendRMS(segment);
      if (rms > 0) {
        totalF2 += rms * rms;
        validSegments++;
      }
    }

    if (validSegments > 0) {
      // F(s) = √((1/N_s) × Σ F²(v,s))
      fluctuations.push(Math.sqrt(totalF2 / validSegments));
    } else {
      fluctuations.push(0);
    }
  }

  // Step 5: OLS regression for Hurst exponent
  const validPoints: { logS: number; logF: number }[] = [];
  for (let i = 0; i < DFA_SCALES.length; i++) {
    if (fluctuations[i] > 0) {
      validPoints.push({
        logS: Math.log(DFA_SCALES[i]),
        logF: Math.log(fluctuations[i])
      });
    }
  }

  if (validPoints.length < 2) {
    return defaultResult;
  }

  // OLS: α̂ = Σ((log s - mean)(log F - mean)) / Σ(log s - mean)²
  const n = validPoints.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (const p of validPoints) {
    sumX += p.logS;
    sumY += p.logF;
    sumXY += p.logS * p.logF;
    sumX2 += p.logS * p.logS;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;
  const denom = n * sumX2 - sumX * sumX;

  if (Math.abs(denom) < 1e-10) {
    return defaultResult;
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = meanY - slope * meanX;
  const hurstExponent = Math.max(0, Math.min(1, slope));

  // R² calculation: R² = 1 - SS_res / SS_tot
  let ssRes = 0, ssTot = 0;
  for (const p of validPoints) {
    const predicted = intercept + slope * p.logS;
    ssRes += Math.pow(p.logF - predicted, 2);
    ssTot += Math.pow(p.logF - meanY, 2);
  }

  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const isValid = r2 > 0.85;

  // Formal classification (Rule 2)
  // σ_α approximation from R² and sample size
  const sigmaAlpha = Math.sqrt((1 - r2) / (n - 2));

  let classification: DFAResult['classification'];
  if (hurstExponent > 0.55 && sigmaAlpha < 0.1) {
    classification = 'Trending';
  } else if (hurstExponent < 0.45 && sigmaAlpha < 0.1) {
    classification = 'Mean-reverting';
  } else {
    classification = 'Random';
  }

  return {
    scales: DFA_SCALES,
    fluctuations,
    hurstExponent,
    r2,
    isValid,
    classification,
    confidenceInterval: {
      lower: Math.max(0, hurstExponent - 1.96 * sigmaAlpha),
      upper: Math.min(1, hurstExponent + 1.96 * sigmaAlpha)
    }
  };
}

/**
 * 4. MULTI-SCALE STABILITY INDEX
 * 
 * Definition:
 * Compute DFA exponents across m scales: A = {α(s_1), α(s_2), ..., α(s_m)}
 * 
 * Stability Metric:
 * Υ = 1 - σ(A) / μ(A)
 * 
 * where σ is standard deviation, μ is mean
 * 
 * Confidence Bound (propagation of errors):
 * σ_Υ ≈ σ(A) / μ²(A) × σ_σ(A)
 */
export interface MultiScaleStabilityResult {
  upsilon: number;            // Υ stability metric
  sigmaHurst: number;         // σ(A)
  muHurst: number;            // μ(A)
  hurstValues: number[];      // Individual scale Hurst estimates
  confidenceBound: number;    // σ_Υ
  classification: 'Coherent' | 'Fragmented' | 'Transitional';
}

export function calculateMultiScaleStability(
  closes: number[]
): MultiScaleStabilityResult {
  const dfaResult = calculateDFA(closes);

  // Calculate local Hurst values between consecutive scales
  const hurstValues: number[] = [];
  const validPoints: { logS: number; logF: number }[] = [];

  for (let i = 0; i < DFA_SCALES.length; i++) {
    if (dfaResult.fluctuations[i] > 0) {
      validPoints.push({
        logS: Math.log(DFA_SCALES[i]),
        logF: Math.log(dfaResult.fluctuations[i])
      });
    }
  }

  for (let i = 1; i < validPoints.length; i++) {
    const localSlope = (validPoints[i].logF - validPoints[i - 1].logF) /
      (validPoints[i].logS - validPoints[i - 1].logS);
    hurstValues.push(Math.max(0, Math.min(1, localSlope)));
  }

  if (hurstValues.length < 2) {
    return {
      upsilon: 0.5,
      sigmaHurst: 0,
      muHurst: 0.5,
      hurstValues: [0.5],
      confidenceBound: 0,
      classification: 'Transitional'
    };
  }

  // Calculate mean and standard deviation
  const muHurst = hurstValues.reduce((a, b) => a + b, 0) / hurstValues.length;
  const variance = hurstValues.reduce((sum, h) => sum + Math.pow(h - muHurst, 2), 0) / hurstValues.length;
  const sigmaHurst = Math.sqrt(variance);

  // Stability metric: Υ = 1 - σ(A) / μ(A)
  const upsilon = muHurst > 0.01 ? 1 - sigmaHurst / muHurst : 0.5;
  const clampedUpsilon = Math.max(0, Math.min(1, upsilon));

  // Confidence bound approximation
  const sigmaSigma = sigmaHurst / Math.sqrt(2 * hurstValues.length);
  const confidenceBound = muHurst > 0.01 ? (sigmaHurst / (muHurst * muHurst)) * sigmaSigma : 0;

  // Classification
  let classification: MultiScaleStabilityResult['classification'];
  if (clampedUpsilon > 0.7) {
    classification = 'Coherent';
  } else if (clampedUpsilon < 0.4) {
    classification = 'Fragmented';
  } else {
    classification = 'Transitional';
  }

  return {
    upsilon: clampedUpsilon,
    sigmaHurst,
    muHurst,
    hurstValues,
    confidenceBound,
    classification
  };
}

/**
 * 5. VOLUME-AWARE NORMALIZATION (FX/Commodity Compliant)
 * 
 * Definition of Participation Density:
 * V̂_t = V_t / Med({V_i}_{i=t-n}^t)
 * 
 * where Med(·) is the median absolute deviation robust estimator
 * 
 * Volume-Weighted Price Change:
 * Δ_t^(w) = |C_t - C_{t-1}| × min(V̂_t, 3)
 * 
 * Capped at 3σ to prevent outlier domination
 */
export interface ParticipationDensityResult {
  normalizedVolume: number;        // V̂_t
  medianVolume: number;            // Median volume
  volumeWeightedChange: number;    // Δ_t^(w)
  isCapped: boolean;               // Whether capping was applied
  classification: 'Low' | 'Normal' | 'Elevated' | 'Extreme';
}

export function calculateParticipationDensity(
  volumes: number[],
  priceChanges: number[],
  lookback: number = 20
): ParticipationDensityResult {
  if (volumes.length < 2 || priceChanges.length < 1) {
    return {
      normalizedVolume: 1,
      medianVolume: 0,
      volumeWeightedChange: 0,
      isCapped: false,
      classification: 'Normal'
    };
  }

  // Calculate median volume over lookback
  const lookbackVolumes = volumes.slice(-lookback);
  const sortedVolumes = [...lookbackVolumes].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedVolumes.length / 2);
  const medianVolume = sortedVolumes.length % 2
    ? sortedVolumes[midIndex]
    : (sortedVolumes[midIndex - 1] + sortedVolumes[midIndex]) / 2;

  // Current volume
  const currentVolume = volumes[volumes.length - 1];

  // Normalized volume: V̂_t = V_t / Med(V)
  const normalizedVolume = medianVolume > 0 ? currentVolume / medianVolume : 1;

  // Cap at 3σ (3x median as proxy)
  const cappedVolume = Math.min(normalizedVolume, 3);
  const isCapped = normalizedVolume > 3;

  // Volume-weighted price change
  const latestPriceChange = Math.abs(priceChanges[priceChanges.length - 1] || 0);
  const volumeWeightedChange = latestPriceChange * cappedVolume;

  // Classification
  let classification: ParticipationDensityResult['classification'];
  if (normalizedVolume < 0.5) {
    classification = 'Low';
  } else if (normalizedVolume <= 1.5) {
    classification = 'Normal';
  } else if (normalizedVolume <= 3) {
    classification = 'Elevated';
  } else {
    classification = 'Extreme';
  }

  return {
    normalizedVolume,
    medianVolume,
    volumeWeightedChange,
    isCapped,
    classification
  };
}

/**
 * 6. STRUCTURAL INTEGRITY INDEX (Composite Metric)
 * 
 * Component Normalization:
 * 1. Efficiency Component: E' = ER_t(n) (already [0,1])
 * 2. Variance Ratio Component: V' = (2/π) × arctan((VR - 1)/τ) + 0.5, τ = 0.3
 * 3. Persistence Component: P' = α (DFA exponent, typically [0,1])
 * 
 * Composite Formation:
 * SII_t = Υ × [w₁E' + w₂V' + w₃P']
 * where w₁ = w₂ = w₃ = 1/3 (equal weights)
 * 
 * Mathematical Properties:
 * - Bounded: 0 ≤ SII_t ≤ 1
 * - Symmetric: Invariant under price scaling
 * - Stationary: Expectation constant under random walk
 */
export interface StructuralIntegrityIndexResult {
  sii: number;
  components: {
    efficiencyPrime: number;        // E'
    varianceRatioPrime: number;     // V'
    persistencePrime: number;       // P'
  };
  upsilon: number;                  // Stability multiplier
  weights: { w1: number; w2: number; w3: number };
  classification: 'High' | 'Medium' | 'Low';
  validityScore: number;            // Cross-validation κ
}

const SMOOTHING_TAU = 0.3;

export function calculateStructuralIntegrityIndex(
  efficiencyRatio: number,
  varianceRatio: number,
  hurstExponent: number,
  multiScaleStability: number
): StructuralIntegrityIndexResult {
  // Component 1: Efficiency (already [0,1])
  const efficiencyPrime = Math.max(0, Math.min(1, efficiencyRatio));

  // Component 2: Variance Ratio normalized via arctan
  // V' = (2/π) × arctan((VR - 1)/τ) + 0.5
  const varianceRatioPrime = (2 / Math.PI) * Math.atan((varianceRatio - 1) / SMOOTHING_TAU) + 0.5;

  // Component 3: Persistence (DFA exponent, already [0,1])
  const persistencePrime = Math.max(0, Math.min(1, hurstExponent));

  // Equal weights
  const w1 = 1 / 3;
  const w2 = 1 / 3;
  const w3 = 1 / 3;

  // Weighted sum
  const weightedSum = w1 * efficiencyPrime + w2 * varianceRatioPrime + w3 * persistencePrime;

  // Apply stability multiplier
  const upsilon = Math.max(0, Math.min(1, multiScaleStability));
  const sii = upsilon * weightedSum;

  // Formal classification (Rule 3)
  // Note: Requires κ > 0.8 for "High" - using 0.8 as default validity
  const validityScore = 0.8; // Placeholder - would need cross-validation

  let classification: StructuralIntegrityIndexResult['classification'];
  if (sii > 0.7 && validityScore > 0.8) {
    classification = 'High';
  } else if (sii >= 0.5) {
    classification = 'Medium';
  } else {
    classification = 'Low';
  }

  return {
    sii: Math.max(0, Math.min(1, sii)),
    components: {
      efficiencyPrime,
      varianceRatioPrime,
      persistencePrime
    },
    upsilon,
    weights: { w1, w2, w3 },
    classification,
    validityScore
  };
}

// ============= AGGREGATE CALCULATION =============

export interface FormalMetricsResult {
  efficiencyRatio: EfficiencyRatioResult;
  varianceRatio: VarianceRatioResult;
  dfa: DFAResult;
  multiScaleStability: MultiScaleStabilityResult;
  participationDensity: ParticipationDensityResult;
  structuralIntegrityIndex: StructuralIntegrityIndexResult;
}

export function calculateFormalMetrics(
  ohlcv: OHLCVBar[],
  lookback: number = 50
): FormalMetricsResult {
  const closes = ohlcv.map(bar => bar.close);
  const volumes = ohlcv.map(bar => bar.volume);

  // Calculate price changes
  const priceChanges: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    priceChanges.push(closes[i] - closes[i - 1]);
  }

  // Calculate all metrics
  const efficiencyRatio = calculateEfficiencyRatio(closes, lookback);
  const varianceRatio = calculateVarianceRatio(closes, 5);
  const dfa = calculateDFA(closes);
  const multiScaleStability = calculateMultiScaleStability(closes);
  const participationDensity = calculateParticipationDensity(volumes, priceChanges, 20);

  // Calculate composite SII
  const structuralIntegrityIndex = calculateStructuralIntegrityIndex(
    efficiencyRatio.value,
    varianceRatio.value,
    dfa.hurstExponent,
    multiScaleStability.upsilon
  );

  return {
    efficiencyRatio,
    varianceRatio,
    dfa,
    multiScaleStability,
    participationDensity,
    structuralIntegrityIndex
  };
}

// ============= FORMULA DOCUMENTATION =============

export const formalMetricFormulas = {
  efficiencyRatio: {
    name: 'Price Efficiency Metric',
    formula: 'ER_t(n) = |C_t - C_{t-n}| / Σ|C_{t-i+1} - C_{t-i}|',
    properties: 'Bounded [0,1], Scale-invariant, Dimensionless',
    interpretation: 'Measures structural cleanliness. 1 = pure directional movement, 0 = noise.',
    limitation: 'Path-dependent, sensitive to lookback period selection.',
    classification: {
      'Structured': 'ER > 0.6',
      'Diffusive': '0.4 ≤ ER ≤ 0.6',
      'Noisy': 'ER < 0.4'
    }
  },
  varianceRatio: {
    name: 'Variance Ratio (Lo-MacKinlay)',
    formula: 'VR_t(k,n) = V[r^(k)]/(k × V[r]) using UNBIASED variance',
    properties: 'E[VR] = 1 under random walk; V[VR] ≈ 2(2k-1)(k-1)/(3kn)',
    interpretation: '>1 suggests trending; <1 suggests mean-reversion; =1 random walk.',
    limitation: 'Assumes log-normal returns, sensitive to outliers.',
    classification: {
      'Trending': 'VR > 1.15',
      'Mean-reverting': 'VR < 0.85',
      'Random': '0.85 ≤ VR ≤ 1.15'
    }
  },
  dfa: {
    name: 'Detrended Fluctuation Analysis',
    formula: 'F(s) ∝ s^α; α = OLS slope of log F(s) vs log s',
    properties: 'Scales: {16,32,64,128}, Linear detrending only',
    interpretation: 'α > 0.5: persistent (trending); α < 0.5: anti-persistent (mean-reverting).',
    limitation: 'Requires R² > 0.85 for valid estimation. Fixed scales prevent overfitting.',
    classification: {
      'Trending': 'α > 0.55 AND σ_α < 0.1',
      'Mean-reverting': 'α < 0.45 AND σ_α < 0.1',
      'Random': 'otherwise'
    }
  },
  multiScaleStability: {
    name: 'Multi-Scale Stability Index (Υ)',
    formula: 'Υ = 1 - σ(A)/μ(A) where A = {α(s_1), ..., α(s_m)}',
    properties: 'Bounded [0,1], Measures cross-scale consistency',
    interpretation: 'High Υ = consistent fractal structure; Low Υ = fragmented behavior.',
    limitation: 'Requires sufficient scales for meaningful variance estimation.',
    classification: {
      'Coherent': 'Υ > 0.7',
      'Fragmented': 'Υ < 0.4',
      'Transitional': '0.4 ≤ Υ ≤ 0.7'
    }
  },
  participationDensity: {
    name: 'Volume-Aware Normalization',
    formula: 'V̂_t = V_t/Med(V); Δ^(w) = |ΔC| × min(V̂_t, 3)',
    properties: 'Robust median estimator, 3σ cap for outlier protection',
    interpretation: 'Normalizes volume relative to recent median, caps extreme values.',
    limitation: 'Uses tick volume as proxy in OTC markets.',
    classification: {
      'Low': 'V̂ < 0.5',
      'Normal': '0.5 ≤ V̂ ≤ 1.5',
      'Elevated': '1.5 < V̂ ≤ 3',
      'Extreme': 'V̂ > 3 (capped)'
    }
  },
  structuralIntegrityIndex: {
    name: 'Structural Integrity Index (SII)',
    formula: 'SII = Υ × [w₁E\' + w₂V\' + w₃P\'], equal weights w = 1/3',
    properties: 'Bounded [0,1], Symmetric under price scaling, Stationary',
    interpretation: 'Composite measure of structural coherence across efficiency, variance, and persistence.',
    limitation: 'Equal weighting reduces sensitivity to individual components.',
    classification: {
      'High': 'SII > 0.7 AND κ > 0.8',
      'Medium': '0.5 ≤ SII ≤ 0.7',
      'Low': 'SII < 0.5'
    }
  }
};
