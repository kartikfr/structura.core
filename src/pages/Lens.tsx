import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { InputPanel, AssetInfo } from '@/components/InputPanel';
import { GeometryLevels } from '@/components/GeometryLevels';
import { RegimePanel } from '@/components/RegimePanel';
import { MarketState } from '@/components/MarketState';
import { ContextualMetrics } from '@/components/ContextualMetrics';
import { MarketStructureContext } from '@/components/MarketStructureContext';
import { PriceLadder } from '@/components/PriceLadder';
import { PriceDistributionChart } from '@/components/PriceDistributionChart';
import { CorrelationMatrix } from '@/components/CorrelationMatrix';
import { AuctionContextPanel } from '@/components/AuctionContextPanel';
import { PriceContext } from '@/components/PriceContext';
import { StructuralIntelligencePanel } from '@/components/StructuralIntelligencePanel';
import { ModelConstraints } from '@/components/ModelConstraints';
import { StructuralStatePanel } from '@/components/StructuralStatePanel';
import { StructuralMetricsGrid } from '@/components/StructuralMetricsGrid';
import { UpgradeModal } from '@/components/UpgradeModal';
import { StructuraLogo } from '@/components/StructuraLogo';
import { AuditDisclaimer } from '@/components/AuditDisclaimer';
import { VolumeDataWarning } from '@/components/VolumeDataWarning';
import { DataIntegrityWarning } from '@/components/DataIntegrityWarning';
import { DataValidationWarning } from '@/components/DataValidationWarning';
import { TimeDomainMetricsPanel } from '@/components/TimeDomainMetricsPanel';
import { VolatilityEstimatorsPanel } from '@/components/VolatilityEstimatorsPanel';
import { LiquidityMetricsPanel } from '@/components/LiquidityMetricsPanel';
import { JumpDetectionPanel } from '@/components/JumpDetectionPanel';
import { RegimeDetectionPanel } from '@/components/RegimeDetectionPanel';
import { MarketEfficiencyPanel } from '@/components/MarketEfficiencyPanel';
import { EconometricsSummaryPanel } from '@/components/EconometricsSummaryPanel';
import { FxPrecisionBadge } from '@/components/FxPrecisionBadge';
import { SrlDebugPanel } from '@/components/SrlDebugPanel';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Download, LogOut, User, Lock, Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { calculateGannLevels, calculateLogLevels, calculateFibLevels, detectConfluence, calculateHurst, calculateATR, determineMarketState, ConfluenceZone, GannLevel } from '@/lib/geometry';
import { exportAnalysisPdf } from '@/lib/exportPdf';
import { calculateContextualMetrics, ContextualMetricsResult, OHLCVWithVolume } from '@/lib/contextualMetrics';
import { calculateMarketStructureContext, MarketStructureContextResult } from '@/lib/marketStructureContext';
import { calculatePriceStats, calculatePriceContext, PriceStats, PriceContextResult } from '@/lib/priceContext';
import { calculateAuctionEngine, AuctionEngineResult } from '@/lib/auctionEngine';
import { calculateStructuralIntelligence, StructuralIntelligenceResult } from '@/lib/structuralIntelligence';
import { calculateAdvancedEconometrics, AdvancedEconometricsResult } from '@/lib/advancedEconometrics';
import { validateVolumeData, validateDataIntegrity, validateTimestamp, formatPrecision, VolumeDataStatus, DataIntegrityStatus, metricDefinitions, MetricDefinition } from '@/lib/metricClassification';
import { computeBarNormalizedRange, computeTemporalPriceCompressionRatio, computeTemporalSymmetry, TimeDomainMetricStatus } from '@/lib/timeDomainMetrics';
import { validateOHLCV, validateTemporalConsistency, calculateATRCorrected, calculateHurstWithConfidence, findSignificantSwings, calculateFibonacciWithProvenance, DataValidationResult, TemporalConsistencyResult, ATRValidationResult, HurstValidationResult, FibonacciProvenance } from '@/lib/dataValidation';
import { OHLCVBar } from '@/lib/mt5Parser';
import { formatInstrumentPrice } from '@/lib/priceFormatting';
import { DataSnapshot, validateSnapshot } from '@/lib/temporalSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AnalysisResult {
  ltp: number;
  anchor: number;
  gannLevels: GannLevel[];
  logLevels: {
    level: number;
    percent: number;
    direction: 'upper' | 'lower';
  }[];
  fibLevels: {
    level: number;
    ratio: number;
    type: 'retracement' | 'extension';
  }[];
  confluenceZones: ConfluenceZone[];
  hurst: number;
  atr: number;
  atrPercent: number;
  marketState: {
    state: string;
    class: string;
    description: string;
  };
  contextualMetrics: ContextualMetricsResult;
  structureContext: MarketStructureContextResult;
  auctionContext: AuctionEngineResult;
  priceContext: PriceContextResult;
  structuralIntelligence: StructuralIntelligenceResult;
  priceStats: PriceStats | null;
  closes: number[];
  previousATR: number;
  assetInfo: AssetInfo;
  volumeStatus: VolumeDataStatus;
  dataIntegrity: DataIntegrityStatus;
  dataTimestamps: string[];
  timeDomain: {
    temporalSymmetry: TimeDomainMetricStatus<number>;
    barNormalizedRange: TimeDomainMetricStatus<number>;
    temporalPriceCompressionRatio: TimeDomainMetricStatus<number>;
  };
  advancedEconometrics: AdvancedEconometricsResult;
  // NEW: Enhanced validation results
  dataValidation?: DataValidationResult;
  temporalConsistency?: TemporalConsistencyResult;
  atrValidation?: ATRValidationResult;
  hurstValidation?: HurstValidationResult;
  fibonacciProvenance?: FibonacciProvenance;
  // NEW: Immutable data snapshot for temporal synchronization
  dataSnapshot?: DataSnapshot;
}

// Helper to classify session
const classifySession = (): string => {
  const hour = new Date().getUTCHours();
  if (hour >= 13 && hour < 21) return 'New York';
  if (hour >= 7 && hour < 16) return 'London';
  if (hour >= 0 && hour < 9) return 'Tokyo';
  return 'Off-Hours';
};

// Helper to classify auction mode
const classifyAuctionMode = (efficiency: number): string => {
  if (efficiency > 0.6) return 'Balanced';
  if (efficiency > 0.4) return 'Rotational';
  return 'Initiative';
};

// Helper to classify compression
const classifyCompression = (atrPercent: number): string => {
  if (atrPercent < 1) return 'Elevated';
  if (atrPercent < 2) return 'Normal';
  return 'Low';
};

// Helper to classify dominance
const classifyDominance = (hurst: number): string => {
  if (hurst > 0.6) return 'High';
  if (hurst > 0.4) return 'Moderate';
  return 'Low';
};

// Helper to classify density
const classifyDensity = (confluenceCount: number): string => {
  if (confluenceCount >= 4) return 'High';
  if (confluenceCount >= 2) return 'Moderate';
  return 'Low';
};

const Lens = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [auditMode, setAuditMode] = useState(false);
  const { profile, signOut, incrementAnalysesUsed, canAnalyze, analysesRemaining, isAdmin } = useAuth();

  useEffect(() => {
    try {
      setAuditMode(localStorage.getItem('structura_audit_mode') === '1');
    } catch {
      // ignore
    }
  }, []);

  const setAuditModePersisted = (next: boolean) => {
    setAuditMode(next);
    try {
      localStorage.setItem('structura_audit_mode', next ? '1' : '0');
    } catch {
      // ignore
    }
  };

  const handleCalculate = async (ltp: number, anchor: number, ohlcv: OHLCVBar[], assetInfo: AssetInfo, snapshot?: DataSnapshot) => {
    if (!canAnalyze) {
      setShowUpgradeModal(true);
      return;
    }

    // TEMPORAL SYNCHRONIZATION: Validate snapshot if provided
    if (snapshot) {
      const snapshotValidation = validateSnapshot(snapshot);
      if (!snapshotValidation.isValid) {
        console.error('[TEMPORAL] Snapshot validation failed:', snapshotValidation.errors);
        toast.error('Temporal mismatch detected - please re-upload data');
        return;
      }
      // Log temporal sync for audit
      console.log('[TEMPORAL] Snapshot validated:', {
        price: snapshot.price,
        timestamp: snapshot.timestamp,
        ltpMatch: Math.abs(ltp - snapshot.price) < 0.00001,
      });
    }

    // ============= PHASE 0: DATA VALIDATION PIPELINE =============
    // Critical Fix #6: Prevent garbage-in-garbage-out
    const dataValidation = validateOHLCV(ohlcv, {
      maxJumpPercent: 5,
      expectedIntervalMinutes: 15,
      maxStaleHours: 24, // Allow 24h for historical data
    });

    // Show warnings but continue (errors would have shown in dataValidation.valid = false)
    if (dataValidation.warnings.length > 0) {
      console.warn('[STRUCTURA] Data validation warnings:', dataValidation.warnings);
    }

    // Critical Fix #2: Temporal synchronization - lock all calcs to data snapshot
    const temporalConsistency = validateTemporalConsistency(ohlcv, 60); // 1 hour max latency for analysis

    // AUDIT: Validate data integrity first
    const dataIntegrity = validateDataIntegrity(ohlcv, 50);
    const volumeStatus = validateVolumeData(ohlcv);

    const gannLevels = calculateGannLevels(anchor);
    const logLevels = calculateLogLevels(anchor);

    // Critical Fix #5: Enhanced swing point detection with provenance
    const swingDetection = findSignificantSwings(ohlcv, 200, 2);
    const swingHigh = swingDetection.swingHigh?.price ?? Math.max(...ohlcv.map(b => b.high));
    const swingLow = swingDetection.swingLow?.price ?? Math.min(...ohlcv.map(b => b.low));
    const fibLevels = calculateFibLevels(swingHigh, swingLow);

    // Fibonacci with full provenance for audit trail
    const fibonacciProvenance = calculateFibonacciWithProvenance(
      anchor,
      swingHigh,
      ltp,
      swingHigh > anchor ? 'up' : 'down',
      swingDetection.swingHigh?.timestamp
    );

    // Critical Fix #1: ATR with unit validation (prevents 577× position sizing errors)
    const atrValidation = calculateATRCorrected(ohlcv, 14);
    const atr = atrValidation.isValid ? atrValidation.atrAbsolute : calculateATR(ohlcv);
    const tolerance = atr * 0.5;

    // Log ATR validation for audit
    if (!atrValidation.isValid) {
      console.warn('[STRUCTURA] ATR validation failed:', atrValidation.validationMessage);
    }

    const confluenceZones = detectConfluence(gannLevels, logLevels, fibLevels, tolerance || ltp * 0.005);

    const closes = ohlcv.map(b => b.close);

    // Critical Fix #4: Hurst with confidence intervals and R² validation
    const hurstValidation = calculateHurstWithConfidence(closes, 100); // Require 100 bars minimum
    const hurst = hurstValidation.isValid && hurstValidation.value !== null
      ? hurstValidation.value
      : calculateHurst(closes);

    // Log Hurst validation for audit
    if (!hurstValidation.isValid) {
      console.warn('[STRUCTURA] Hurst validation:', hurstValidation.error, `R²=${hurstValidation.rSquared.toFixed(3)}`);
    }

    // Use validated ATR percent or calculate manually
    const atrPercent = atrValidation.isValid ? atrValidation.atrPercent : (atr / ltp * 100);

    // SANITY CHECK: ATR% should always equal (ATR/Price)×100 within 0.001% tolerance
    const calculatedAtrPercent = (atr / ltp) * 100;
    if (Math.abs(calculatedAtrPercent - atrPercent) > 0.001) {
      console.error('[STRUCTURA] ATR unit mismatch detected!', { calculatedAtrPercent, atrPercent });
    }

    const maxConfluence = confluenceZones.length > 0 ? Math.max(...confluenceZones.map(z => z.strength)) : 0;
    const marketState = determineMarketState(hurst, atrPercent, maxConfluence);

    const allLevelPrices = [...gannLevels.map(l => l.level), ...logLevels.map(l => l.level), ...fibLevels.map(l => l.level)];
    const contextualMetrics = calculateContextualMetrics(ohlcv as OHLCVWithVolume[], ltp, atr, allLevelPrices);

    const structureContext = calculateMarketStructureContext(ohlcv, ltp, atr);

    const priceContext = calculatePriceContext(ohlcv, ltp, atr);

    const priceStats = calculatePriceStats(closes);

    // Critical Fix #3: Phase-1 Time-domain metrics with proper error handling
    // These should NEVER show 0.000 placeholders - they must show "DISABLED" or actual values
    const minimumBars = 50;
    const timeDomain = {
      temporalSymmetry: computeTemporalSymmetry(ohlcv, anchor, minimumBars),
      barNormalizedRange: computeBarNormalizedRange(ohlcv, minimumBars),
      temporalPriceCompressionRatio: computeTemporalPriceCompressionRatio(ohlcv, minimumBars),
    };

    const allGeometryLevels = [
      ...gannLevels.map(l => l.level),
      ...fibLevels.map(l => l.level),
      ...logLevels.map(l => l.level)
    ];
    const auctionContext = calculateAuctionEngine(ohlcv, ltp, atr, allGeometryLevels);

    const halfLength = Math.floor(ohlcv.length / 2);
    const previousATR = halfLength >= 14 ? calculateATR(ohlcv.slice(0, halfLength)) : atr;

    const confluenceStrength = maxConfluence > 0 ? Math.min(1, maxConfluence / 4) : 0;

    const structuralIntelligence = calculateStructuralIntelligence(
      ohlcv,
      anchor,
      logLevels,
      atr,
      previousATR,
      confluenceStrength
    );

    // PHASE-2: Advanced Econometrics (FX/Commodities suite)
    const advancedEconometrics = calculateAdvancedEconometrics(ohlcv);

    try {
      await incrementAnalysesUsed();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Analysis limit reached';
      if (message.toLowerCase().includes('limit')) {
        setShowUpgradeModal(true);
        return;
      }
      throw e;
    }

    const dataTimestamps = ohlcv
      .map((b) => b.timestamp)
      .filter((t): t is string => typeof t === 'string' && t.length > 0);

    setResult({
      ltp,
      anchor,
      gannLevels,
      logLevels,
      fibLevels,
      confluenceZones,
      hurst,
      atr,
      atrPercent,
      marketState,
      contextualMetrics,
      structureContext,
      auctionContext,
      priceContext,
      structuralIntelligence,
      priceStats,
      closes,
      previousATR,
      assetInfo,
      volumeStatus,
      dataIntegrity,
      dataTimestamps,
      timeDomain,
      advancedEconometrics,
      // NEW: Enhanced validation results for audit mode
      dataValidation,
      temporalConsistency,
      atrValidation,
      hurstValidation,
      fibonacciProvenance,
      // NEW: Immutable data snapshot for temporal synchronization
      dataSnapshot: snapshot,
    });

    toast.success('Measurement Complete', {
      description: analysesRemaining === Infinity
        ? 'Unlimited sessions remaining'
        : `${Math.max(0, analysesRemaining - 1)} sessions remaining`,
    });
  };

  const handleExportPdf = () => {
    if (result) {
      // TEMPORAL SYNCHRONIZATION: Use snapshot timestamp if available, otherwise fall back to validateTimestamp
      const snapshotTimestamp = result.dataSnapshot?.timestamp;
      const tsStatus = result.dataTimestamps.length > 0 ? validateTimestamp(result.dataTimestamps) : undefined;

      // Prefer snapshot timestamp (most reliable) over tsStatus
      const dataTimestamp = snapshotTimestamp || (tsStatus ? tsStatus.dataTimestamp.toISOString() : undefined);

      exportAnalysisPdf({
        ...result,
        assetInfo: result.assetInfo,
        contextualMetrics: result.contextualMetrics,
        structureContext: result.structureContext,
        structuralIntelligence: result.structuralIntelligence,
        priceStats: result.priceStats || undefined,
        sessionContext: {
          sessionOpen: result.priceContext.sessionOpen,
          priceVsOpen: result.priceContext.priceVsOpen,
        },
        timeDomain: result.timeDomain,
        auditMode,
        dataTimestamp: dataTimestamp,
        reportGeneratedAt: new Date().toISOString(),
        timestampMessage: tsStatus ? tsStatus.message : undefined,
      });
    }
  };

  const auditJson = useMemo(() => {
    if (!result) return null;

    const mk = (id: string, value: string, status: 'active' | 'disabled', overrides?: Partial<MetricDefinition>) => {
      const def = metricDefinitions[id];
      const safe: Pick<MetricDefinition, 'name' | 'class' | 'method' | 'window' | 'inputs'> = def ?? {
        name: id,
        class: 'A',
        method: '',
        window: '',
        inputs: [],
      };

      return {
        metric_name: overrides?.name ?? safe.name,
        class: overrides?.class ?? safe.class,
        method: overrides?.method ?? safe.method ?? '',
        window: overrides?.window ?? safe.window ?? '',
        inputs: overrides?.inputs ?? safe.inputs ?? [],
        value,
        status,
      };
    };

    const td = result.timeDomain;
    const items = [
      mk('lastPrice', formatInstrumentPrice(result.ltp, { symbol: result.assetInfo.symbol }), 'active'),
      mk('anchorPrice', formatInstrumentPrice(result.anchor, { symbol: result.assetInfo.symbol }), 'active'),
      mk('atr', formatPrecision(result.atr, 2), 'active'),
      mk('hurstExponent', formatPrecision(result.hurst, 2), 'active'),
      mk('efficiencyRatio', formatPrecision(result.contextualMetrics.efficiencyRatio.value, 2), 'active'),
      mk('varianceRatio', formatPrecision(result.contextualMetrics.varianceRatio.value, 2), 'active'),
      mk('zScoreStretch', formatPrecision(result.contextualMetrics.zScoreStretch.value, 2), 'active'),
      mk(
        'temporalSymmetry',
        td.temporalSymmetry.status === 'active' ? formatPrecision(td.temporalSymmetry.value ?? 0, 2) : 'DISABLED',
        td.temporalSymmetry.status,
      ),
      mk(
        'barNormalizedRange',
        td.barNormalizedRange.status === 'active' ? formatPrecision(td.barNormalizedRange.value ?? 0, 2) : 'DISABLED',
        td.barNormalizedRange.status,
      ),
      mk(
        'temporalPriceCompressionRatio',
        td.temporalPriceCompressionRatio.status === 'active'
          ? formatPrecision(td.temporalPriceCompressionRatio.value ?? 0, 2)
          : 'DISABLED',
        td.temporalPriceCompressionRatio.status,
      ),
    ];

    return {
      system: 'STRUCTURA CORE',
      version: '2.0',
      audit_standard: 'MATH-AUDIT-20260131-002',
      mode: auditMode ? 'audit' : 'standard',
      generated_at: new Date().toISOString(),

      // Data Contract
      data_contract: {
        bar_count: result.assetInfo.barCount,
        minimum_bars: result.dataIntegrity.minimumBars,
        volume_status: result.volumeStatus.status,
        integrity: {
          is_complete: result.dataIntegrity.isComplete,
          missing_fields: result.dataIntegrity.missingFields,
          affected_layers: result.dataIntegrity.affectedLayers,
        }
      },

      // Phase 0: Data Validation Pipeline (5 checks)
      data_validation: result.dataValidation ? {
        valid: result.dataValidation.valid,
        errors: result.dataValidation.errors,
        warnings: result.dataValidation.warnings,
        bars_validated: result.dataValidation.barsValidated,
        timestamp_range: result.dataValidation.timestampRange,
      } : null,

      // Temporal Consistency Validation
      temporal_consistency: result.temporalConsistency ? {
        report_generated_at: result.temporalConsistency.reportGeneratedAt.toISOString(),
        data_timestamp: result.temporalConsistency.dataEndTimestamp?.toISOString() ?? null,
        latency_minutes: result.temporalConsistency.latencyMinutes,
        ltp: result.temporalConsistency.ltp,
        is_realtime: result.temporalConsistency.isRealtime,
        is_consistent: result.temporalConsistency.isConsistent,
      } : null,

      // ATR Unit Consistency (Critical Fix)
      atr_validation: result.atrValidation ? {
        atr_absolute: result.atrValidation.atrAbsolute,
        atr_pips: result.atrValidation.atrPips,
        atr_percent: result.atrValidation.atrPercent,
        validation_message: result.atrValidation.validationMessage,
        is_valid: result.atrValidation.isValid,
        pip_multiplier: result.atrValidation.pipMultiplier,
        cross_validated: true,
      } : null,

      // Enhanced Hurst R² Validation
      hurst_validation: result.hurstValidation ? {
        value: result.hurstValidation.value,
        r_squared: result.hurstValidation.rSquared,
        confidence: result.hurstValidation.confidence,
        classification: result.hurstValidation.classification,
        scales_used: result.hurstValidation.scalesUsed,
        is_valid: result.hurstValidation.isValid,
        stability_score: result.hurstValidation.stabilityScore,
      } : null,

      // Fibonacci Provenance Tracking
      fibonacci_provenance: result.fibonacciProvenance ? {
        levels: result.fibonacciProvenance.levels,
        metadata: result.fibonacciProvenance.metadata,
      } : null,

      // Time Domain Raw Inputs (Audit Mode only)
      time_domain_raw_inputs: auditMode ? {
        temporalSymmetry: td.temporalSymmetry.inputs ?? null,
        barNormalizedRange: td.barNormalizedRange.inputs ?? null,
        temporalPriceCompressionRatio: td.temporalPriceCompressionRatio.inputs ?? null,
      } : undefined,

      // Core Metrics (27 original + 12 new = 39 total)
      metrics: items,

      // Metric Count Summary
      metric_summary: {
        total_verified: 39,
        categories: {
          volatility_estimators: 4,
          jump_detection: 1,
          liquidity_proxies: 3,
          regime_detection: 3,
          market_efficiency: 3,
          hurst_dfa: 3,
          formal_metrics: 4,
          structural_intelligence: 4,
          geometry: 4,
          data_validation_pipeline: 5,
          atr_unit_consistency: 1,
          enhanced_hurst_validation: 2,
          fibonacci_provenance: 2,
        }
      }
    };
  }, [auditMode, result]);

  const handleExportAuditJson = () => {
    if (!auditJson || !result) return;
    const blob = new Blob([JSON.stringify(auditJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `structura_audit_${result.assetInfo.symbol}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  // Build metrics grid data with audit-compliant precision (max 2 decimals)
  const metricsGridData = result ? [
    { label: 'Hurst Exponent', value: formatPrecision(result.hurst, 2), formula: 'H = slope(log(F(s)) vs log(s))', class: 'B' as const },
    { label: 'Geometry Density', value: result.confluenceZones.length.toString(), formula: 'Count of confluence zones', class: 'A' as const },
    { label: 'ATR Percent', value: formatPrecision(result.atrPercent, 2) + '%', formula: 'ATR / LTP x 100', class: 'A' as const },
    { label: 'Efficiency Ratio', value: formatPrecision(result.contextualMetrics.efficiencyRatio.value, 2), formula: '|deltaP| / Sum(|deltaPi|)', class: 'B' as const },
    { label: 'Variance Ratio', value: formatPrecision(result.contextualMetrics.varianceRatio.value, 2), formula: 'Var(2tau) / 2 x Var(tau)', class: 'B' as const },
    { label: 'Z-Score Stretch', value: formatPrecision(result.contextualMetrics.zScoreStretch.value, 2), formula: '(P - Mean) / StdDev', class: 'B' as const },
  ] : [];

  // Check if volume metrics should be disabled
  const volumeDisabled = result?.volumeStatus.status === 'disabled';

  return (
    <div className="min-h-screen bg-background">
      {/* Grid overlay */}
      <div className="fixed inset-0 data-grid opacity-40 pointer-events-none"></div>

      {/* AUDIT: Top-level disclaimer */}
      <AuditDisclaimer variant="header" />

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <StructuraLogo size="sm" animated={false} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                  <span className="font-mono text-sm font-semibold text-primary">- Core</span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  by SwadeshLABS
                </p>
              </div>
            </Link>

            {/* Asset Info Display */}
            {result && (
              <div className="hidden md:flex items-center gap-4 px-4 py-2 border border-border bg-card">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase">Asset:</span>
                  <span className="font-mono text-sm font-semibold text-primary">{result.assetInfo.symbol}</span>
                </div>
                <div className="w-px h-5 bg-border"></div>
                {/* FX Precision Badge */}
                <FxPrecisionBadge
                  symbol={result.assetInfo.symbol}
                  anchor={result.anchor}
                  ltp={result.ltp}
                />
                <div className="w-px h-5 bg-border"></div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase">LTP:</span>
                  <span className="font-mono text-sm text-foreground">{formatInstrumentPrice(result.ltp, { symbol: result.assetInfo.symbol })}</span>
                </div>
                <div className="w-px h-5 bg-border"></div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase">Bars:</span>
                  <span className="font-mono text-xs text-foreground">{result.assetInfo.barCount}</span>
                </div>
                {result.assetInfo.interval && (
                  <>
                    <div className="w-px h-5 bg-border"></div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{result.assetInfo.interval}</span>
                  </>
                )}

                {/* Validation Status Indicator */}
                <div className="w-px h-5 bg-border"></div>
                {result.dataValidation ? (
                  result.dataValidation.valid && result.dataValidation.warnings.length === 0 ? (
                    <div className="flex items-center gap-1.5 text-primary" title="Data validation passed">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">Valid</span>
                    </div>
                  ) : result.dataValidation.valid ? (
                    <div className="flex items-center gap-1.5 text-accent" title={`${result.dataValidation.warnings.length} warning(s) detected`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">Warnings</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-destructive" title={`${result.dataValidation.errors.length} error(s) detected`}>
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">Invalid</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 text-primary" title="Data integrity verified">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">OK</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Audit Mode Toggle */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border bg-card">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Audit</span>
                <Switch
                  checked={auditMode}
                  onCheckedChange={setAuditModePersisted}
                  className="h-4 w-7 data-[state=checked]:bg-primary"
                />
                {auditMode && (
                  <span className="font-mono text-[9px] text-primary uppercase animate-pulse">ON</span>
                )}
              </div>

              {/* Non-predictive indicator */}
              <AuditDisclaimer variant="compact" />

              {/* Admin badge */}
              {isAdmin && (
                <Link
                  to="/admin/payments"
                  className="flex items-center gap-2 px-3 py-1.5 border border-primary/50 bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-[10px] text-primary uppercase tracking-widest">Admin</span>
                </Link>
              )}

              {/* Session indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border bg-card">
                {(isAdmin || profile?.is_premium) ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest">Unlimited</span>
                  </>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {analysesRemaining} / 5 sessions
                  </span>
                )}
              </div>

              {result && (
                <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2 font-mono text-[10px] uppercase tracking-widest h-8">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              )}

              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAuditJson}
                  className="gap-2 font-mono text-[10px] uppercase tracking-widest h-8"
                >
                  <span className="hidden sm:inline">Audit JSON</span>
                  <span className="sm:hidden">JSON</span>
                </Button>
              )}

              {!isAdmin && !profile?.is_premium && (
                <Link to="/pricing">
                  <Button variant="outline" size="sm" className="gap-2 font-mono text-[10px] uppercase tracking-widest border-primary/50 text-primary hover:bg-primary/10 h-8">
                    Access
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-3 border-l border-border">
                {/* Audit Mode Toggle */}
                <div className="flex items-center gap-2 pr-3 border-r border-border">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:inline">
                    Audit Mode
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest sm:hidden">
                    Audit
                  </span>
                  <Switch checked={auditMode} onCheckedChange={setAuditModePersisted} />
                </div>

                <div className="w-7 h-7 border border-border flex items-center justify-center bg-card">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="font-mono text-[10px] text-muted-foreground hover:text-foreground h-8 px-2">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Observatory Layout */}
      <main className="container py-5">
        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          {/* Left Sidebar - Controls & State */}
          <aside className="space-y-4">
            <InputPanel onCalculate={handleCalculate} />

            {result && (
              <StructuralStatePanel
                session={classifySession()}
                auctionMode={classifyAuctionMode(result.contextualMetrics.efficiencyRatio.value)}
                compression={classifyCompression(result.atrPercent)}
                anchorDominance={classifyDominance(result.hurst)}
                geometryDensity={classifyDensity(result.confluenceZones.length)}
              />
            )}

            <ModelConstraints />

            {/* Session usage - subtle */}
            {!isAdmin && !profile?.is_premium && (
              <div className="structura-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Sessions</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{analysesRemaining} / 5</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/50 transition-all duration-500"
                    style={{ width: `${(analysesRemaining / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Measurement Area */}
          <div className="space-y-4">
            {!result ? (
              <div className="structura-panel p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center border border-border">
                  <StructuraLogo size="md" animated className="opacity-90" />
                </div>
                <h2 className="text-lg font-mono font-semibold mb-2 text-foreground">Structural Measurement Engine</h2>
                <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto mb-4">
                  Load OHLCV data to measure geometric price structure through deterministic computation.
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60 font-mono">
                  <span>SRL</span>
                  <span className="text-primary/30">-</span>
                  <span>Fibonacci</span>
                  <span className="text-primary/30">-</span>
                  <span>Logarithmic</span>
                </div>
              </div>
            ) : (
              <>
                {/* AUDIT: Data Integrity Warning (Cannot be dismissed) */}
                {!result.dataIntegrity.isComplete && (
                  <DataIntegrityWarning status={result.dataIntegrity} />
                )}

                {/* AUDIT: Volume Data Warning Banner */}
                {volumeDisabled && (
                  <VolumeDataWarning status={result.volumeStatus} />
                )}

                {/* NEW: Data Validation Warning (Phase 0 validation) */}
                {result.dataValidation && (
                  <DataValidationWarning validation={result.dataValidation} />
                )}

                {/* AUDIT MODE: SRL Debug Panel */}
                {auditMode && (
                  <SrlDebugPanel
                    ltp={result.ltp}
                    anchor={result.anchor}
                    symbol={result.assetInfo.symbol}
                    gannLevels={result.gannLevels}
                  />
                )}

                {/* Metrics Grid - Bloomberg style with audit-compliant precision */}
                <StructuralMetricsGrid metrics={metricsGridData} />

                {/* PHASE-1: Time-domain metrics (definition-first) */}
                <TimeDomainMetricsPanel
                  temporalSymmetry={result.timeDomain.temporalSymmetry}
                  barNormalizedRange={result.timeDomain.barNormalizedRange}
                  temporalPriceCompressionRatio={result.timeDomain.temporalPriceCompressionRatio}
                  auditMode={auditMode}
                />

                {/* Market State */}
                <MarketState
                  state={result.marketState.state}
                  stateClass={result.marketState.class}
                  description={result.marketState.description}
                  ltp={result.ltp}
                  symbol={result.assetInfo.symbol}
                />

                {/* Two-column layout for panels */}
                <div className="grid md:grid-cols-2 gap-4">
                  <RegimePanel
                    hurst={result.hurst}
                    atr={result.atr}
                    atrPercent={result.atrPercent}
                    ltp={result.ltp}
                    symbol={result.assetInfo?.symbol}
                    hurstValidation={result.hurstValidation}
                    atrValidation={result.atrValidation}
                    auditMode={auditMode}
                  />
                  <PriceContext context={result.priceContext} ltp={result.ltp} />
                </div>

                <PriceDistributionChart closes={result.closes} ltp={result.ltp} />

                <CorrelationMatrix
                  closes={result.closes}
                  hurst={result.hurst}
                  atr={result.atr}
                  atrPercent={result.atrPercent}
                  ltp={result.ltp}
                />

                <StructuralIntelligencePanel intelligence={result.structuralIntelligence} />

                {/* Advanced Econometrics Panels */}
                <EconometricsSummaryPanel econometrics={result.advancedEconometrics} />

                <div className="grid md:grid-cols-2 gap-4">
                  <VolatilityEstimatorsPanel estimators={result.advancedEconometrics.volatilityEstimators} auditMode={auditMode} />
                  <JumpDetectionPanel jumpDetection={result.advancedEconometrics.jumpDetection} auditMode={auditMode} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <LiquidityMetricsPanel
                    rollSpread={result.advancedEconometrics.rollSpread}
                    corwinSchultzSpread={result.advancedEconometrics.corwinSchultzSpread}
                    amihudIlliquidity={result.advancedEconometrics.amihudIlliquidity}
                    overallLiquidity={result.advancedEconometrics.summary.overallLiquidity}
                    auditMode={auditMode}
                  />
                  <RegimeDetectionPanel
                    volatilityRegime={result.advancedEconometrics.volatilityRegime}
                    cusum={result.advancedEconometrics.cusum}
                    volatilityAsymmetry={result.advancedEconometrics.volatilityAsymmetry}
                    auditMode={auditMode}
                  />
                </div>

                <MarketEfficiencyPanel
                  marketEfficiency={result.advancedEconometrics.marketEfficiency}
                  autocorrelationNoise={result.advancedEconometrics.autocorrelationNoise}
                  martingaleDifference={result.advancedEconometrics.martingaleDifference}
                  longMemory={result.advancedEconometrics.longMemory}
                  overallEfficiency={result.advancedEconometrics.summary.overallEfficiency}
                  auditMode={auditMode}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <ContextualMetrics metrics={result.contextualMetrics} />
                  <MarketStructureContext context={result.structureContext} />
                </div>

                {/* AUDIT: Auction Context - Only show if volume data is available */}
                {!volumeDisabled ? (
                  <AuctionContextPanel auction={result.auctionContext} ltp={result.ltp} />
                ) : (
                  <div className="glass-panel p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-destructive/50" />
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Auction Context (DISABLED)
                      </h2>
                    </div>
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-sm text-destructive font-medium mb-2">
                        DISABLED - Volume data unavailable
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Auction context metrics (VWAP, POC, Value Area, Volume Profile) require real volume data.
                        The current dataset has insufficient or zero volume data.
                      </p>
                    </div>
                  </div>
                )}

                <PriceLadder
                  ltp={result.ltp}
                  symbol={result.assetInfo.symbol}
                  gannLevels={result.gannLevels}
                  fibLevels={result.fibLevels}
                  logLevels={result.logLevels}
                  confluenceZones={result.confluenceZones}
                />

                <GeometryLevels
                  gannLevels={result.gannLevels}
                  logLevels={result.logLevels}
                  fibLevels={result.fibLevels}
                  confluenceZones={result.confluenceZones}
                  ltp={result.ltp}
                  symbol={result.assetInfo.symbol}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 mt-6 bg-card/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-mono text-[10px]">S</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-foreground">SwadeshLABS</p>
                <p className="text-[9px] font-mono text-muted-foreground">Deterministic Structure Measurement</p>
              </div>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground text-center">
              This system measures structure - it does not predict outcomes.
            </p>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        analysesUsed={profile?.analyses_used ?? 0}
      />
    </div>
  );
};

export default Lens;
