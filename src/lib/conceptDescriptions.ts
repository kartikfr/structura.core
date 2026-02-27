// ============= Concept Descriptions =============
// Full descriptions for each analytical concept
// Use cases and interpretation guidance without judgement

export interface ConceptDescription {
  name: string;
  description: string;
  formula: string;
  interpretation: string;
  limitation: string;
  useCase: string;
}

export const geometryDescriptions: Record<string, ConceptDescription> = {
  gann: {
    name: 'Square-Root Lattice Levels',
    description: 'Geometric price levels derived from the Root-Space Price Lattice methodology. These levels are calculated by taking the square root of an anchor price, adding or subtracting step values, then squaring the result to produce mathematically derived support and resistance zones.',
    formula: 'Level = (√Anchor ± step)²  where steps = {0.25, 0.5, 1, 2}',
    interpretation: 'Levels above the anchor represent potential resistance zones; levels below represent potential support zones. The step value indicates distance from anchor: smaller steps (±0.25, ±0.5) produce levels closer to anchor; larger steps (±1, ±2) produce levels further away.',
    limitation: 'These are mathematical constructs based on geometric relationships. They do not predict price behavior; they identify zones where geometric proportions align. Market may ignore, respect, or oscillate around these levels.',
    useCase: 'Use √-Lattice levels as reference points for structural awareness. When price approaches a level, observe how it behaves. Multiple tests of a level provide more data than a single touch. Confluence with other level types (Fibonacci, Log) may indicate zones of heightened structural significance.'
  },
  fibonacci: {
    name: 'Fibonacci Retracements & Extensions',
    description: 'Price levels derived from Fibonacci ratios (0.236, 0.382, 0.5, 0.618, 0.786 for retracements; 1.272, 1.618, 2.0 for extensions) applied to a measured swing between a high and low price. These ratios appear throughout nature and are widely observed by market participants.',
    formula: 'Retracement: Level = High - (ratio × Range); Extension: Level = Low + (ratio × Range)',
    interpretation: 'Retracement levels indicate potential support/resistance within a pullback. Extension levels indicate potential targets beyond the measured swing. The 0.618 (Golden Ratio) and 0.382 levels are most commonly observed by practitioners.',
    limitation: 'Fibonacci levels are derived from the selected swing high and low. Different swing selections produce different levels. Their significance is partly self-fulfilling due to widespread use. No Fibonacci level guarantees a reaction.',
    useCase: 'Identify Fibonacci levels relative to current price to understand potential reaction zones during retracements or extensions. Observe which levels have historically attracted price interaction in the current instrument. Confluence with Gann or Log levels may increase structural awareness.'
  },
  log: {
    name: 'Logarithmic Price Levels',
    description: 'Price levels calculated as fixed percentage deviations from an anchor price using logarithmic spacing. These levels represent proportional moves that are equal in percentage terms regardless of absolute price level.',
    formula: 'Upper: Anchor × (1 + p); Lower: Anchor × (1 - p)  where p = {0.25%, 0.5%, 1%, 2%}',
    interpretation: 'Log levels show where price would be if it moved a specific percentage from the anchor. Upper levels indicate percentage gains; lower levels indicate percentage losses from the reference point.',
    limitation: 'Percentage-based levels do not account for volatility context. A 1% move may be significant in low-volatility conditions and insignificant in high-volatility conditions. Always contextualize with ATR.',
    useCase: 'Use log levels to track proportional distance from a key anchor. When price reaches a log level, you know the exact percentage move that has occurred. Combine with ATR context to understand if the move is within normal volatility range or represents an extension.'
  },
  confluence: {
    name: 'Confluence Zones',
    description: 'Areas where multiple geometric levels from different calculation methods (Gann, Fibonacci, Log) cluster within a defined tolerance. Zones with higher confluence strength indicate areas where multiple independent mathematical approaches identify the same price region.',
    formula: 'Cluster levels where |Level_A - Level_B| ≤ tolerance; Strength = count of unique sources',
    interpretation: 'Higher confluence strength (2x, 3x) indicates more independent methods pointing to the same zone. This does not predict reaction but suggests the zone has more structural significance from a geometric perspective.',
    limitation: 'Confluence does not guarantee price reaction. Tolerance setting affects clustering results. Zone centers are averages of clustered levels, not precise points.',
    useCase: 'Prioritize observation of high-confluence zones over single-method levels. When price approaches a 2x or 3x confluence zone, pay closer attention to price behavior. Use confluence strength as a filter for structural significance, not as a decision cue.'
  }
};

export const regimeDescriptions: Record<string, ConceptDescription> = {
  hurst: {
    name: 'Hurst Exponent',
    description: 'A statistical measure derived from rescaled range (R/S) analysis that quantifies the tendency of a time series to either regress strongly to the mean, cluster in a direction, or behave randomly. Named after Harold Edwin Hurst who developed it while studying Nile river patterns.',
    formula: 'H = log(R/S) / log(n)  where R = range of cumulative deviations, S = standard deviation, n = sample size',
    interpretation: 'H > 0.55: Trending behavior (price moves tend to continue in the same direction). H < 0.45: Mean-reverting behavior (price moves tend to reverse). 0.45 ≤ H ≤ 0.55: Random walk (unpredictable).',
    limitation: 'Hurst exponent is calculated from historical data and describes past behavior, not future. Regime can change without warning. The simplified R/S method has estimation variance.',
    useCase: 'Use Hurst to understand what type of market you are observing. A trending regime (H > 0.55) historically showed persistence. A mean-reverting regime (H < 0.45) historically showed reversals. This informs context but does not dictate action. Always confirm with current price behavior.'
  },
  volatility: {
    name: 'ATR Volatility Classification',
    description: 'Average True Range (ATR) expressed as a percentage of price, classified into Low, Normal, or High volatility regimes. ATR measures the average price movement per bar, capturing gaps and intrabar range.',
    formula: 'ATR% = (ATR / Price) × 100; Low: <1.5%, Normal: 1.5-3%, High: >3%',
    interpretation: 'Low volatility indicates compressed price action with smaller bars. High volatility indicates expanded price action with larger bars. Normal volatility indicates typical market conditions.',
    limitation: 'Thresholds are generalized and may not suit all instruments or timeframes. ATR is backward-looking and can lag sudden volatility changes.',
    useCase: 'Use ATR% to contextualize all other measurements. A "large" move in low volatility may be "normal" in high volatility. Structure levels should be evaluated relative to current ATR. Low volatility often precedes expansion; high volatility often precedes compression.'
  },
  marketState: {
    name: 'Integrated Market State',
    description: 'A qualitative assessment combining Hurst exponent, volatility classification, and confluence strength to describe the overall structural clarity of current market conditions.',
    formula: 'Combines regime (Hurst), volatility (ATR%), and structure (confluence) into categorical state',
    interpretation: 'Aligned: Clear structure with consistent indicators. Transition: Mixed indicators or changing conditions. Conflicted: Contradictory indicators across measures. Low Clarity: Weak structure with insufficient clarity.',
    limitation: 'State classification is categorical and subjective. Market state can persist or change at any time. State does not imply direction.',
    useCase: 'Use market state as a meta-awareness indicator. Aligned states historically offered clearer structure for observation. Transition and Conflicted states historically showed more noise. Low Clarity states historically provided less interpretable structure. This is contextual guidance, not trading instruction.'
  }
};

export const contextualMetricsDescriptions: Record<string, ConceptDescription> = {
  vwapDistance: {
    name: 'VWAP Distance',
    description: 'The distance between current price and the Volume-Weighted Average Price, normalized by ATR. VWAP represents the average price weighted by volume, commonly interpreted as a fair value proxy for the session.',
    formula: 'D = (LTP - VWAP) / ATR  where VWAP = Σ(Price × Volume) / Σ(Volume)',
    interpretation: 'Balanced (|D| < 0.5 ATR): Price near fair value. Initiative (0.5-1.5 ATR): Price moved away from fair value. Extended (>1.5 ATR): Price significantly distant from fair value.',
    limitation: 'VWAP is session-dependent and resets. Without proper volume data, calculation uses equal weighting. Extended distance does not imply reversal.',
    useCase: 'VWAP distance indicates how far price has traveled from volume-weighted mean. Extended readings show price has moved significantly; this may persist or reverse. Use as context for understanding current positioning relative to session participation average.'
  },
  efficiencyRatio: {
    name: 'Efficiency Ratio',
    description: 'The ratio of net price change to total price path traveled over a lookback period. Measures how directly price moved from start to end versus how much it oscillated along the way.',
    formula: 'ER = |P_end - P_start| / Σ|P_i - P_{i-1}|  Range: 0 to 1',
    interpretation: 'Clean (>0.6): Price moved efficiently with little oscillation. Mixed (0.3-0.6): Moderate back-and-forth movement. Choppy (<0.3): High oscillation relative to net progress.',
    limitation: 'Lookback-sensitive; different periods produce different readings. Does not indicate direction, only efficiency of movement.',
    useCase: 'Efficiency ratio describes the character of recent price movement. Clean readings indicate directional movement. Choppy readings indicate oscillatory movement. This helps set expectations for movement style but does not predict continuation.'
  },
  varianceRatio: {
    name: 'Variance Ratio',
    description: 'Compares the variance of multi-period returns to scaled single-period return variance. Tests whether price movement follows a random walk or exhibits trending/reverting characteristics independently of Hurst exponent.',
    formula: 'VR(k) = Var(r_k) / [k × Var(r_1)]  where r_k = k-period log return',
    interpretation: 'Trending (>1.15): Multi-period moves larger than scaled single-period moves. Random (0.85-1.15): Consistent with random walk. Mean-reverting (<0.85): Multi-period moves smaller than expected.',
    limitation: 'Assumes log-normal returns. Sensitive to outliers and the chosen k value. Provides different perspective than Hurst but may conflict.',
    useCase: 'Variance ratio provides a second opinion on market character alongside Hurst. When both agree (e.g., both indicating trending), confidence in characterization increases. When they disagree, the market may be in transition.'
  },
  zScoreStretch: {
    name: 'Z-Score Stretch',
    description: 'The number of standard deviations current price is from the rolling mean, quantifying statistical extension from recent central tendency.',
    formula: 'Z = (LTP - μ_20) / σ_20  where μ = rolling mean, σ = rolling std dev',
    interpretation: 'Neutral (|Z| < 1.5): Price within normal statistical range. Stretched (|Z| ≥ 1.5): Price statistically extended from recent mean.',
    limitation: 'Assumes normal distribution of price, which is not accurate. Stretched conditions can persist (trending markets). Mean and std dev shift as new data arrives.',
    useCase: 'Z-score shows how unusual current price is relative to recent history. Stretched readings indicate price has moved beyond typical range. This does not imply reversal; trending markets routinely show stretched readings. Use as extension awareness, not timing.'
  },
  sessionContext: {
    name: 'Session Context',
    description: 'Labels the current trading session based on UTC time and associates typical behavioral patterns observed during that session historically.',
    formula: 'Asia (00-06 UTC): Range-bound. London (07-13 UTC): Breakout-prone. NY (13-20 UTC): Continuation-prone. Overnight (20-24 UTC): Thin/Volatile.',
    interpretation: 'Session labels describe historical tendencies, not guarantees. Each session has characteristic participation levels and typical price action patterns.',
    limitation: 'Individual sessions vary significantly. Holidays, events, and market conditions override typical patterns. Labels are generalizations.',
    useCase: 'Session context provides awareness of the typical market character at the current time. Asia sessions historically show narrower ranges. London opens historically show increased activity. This is background context, not a trading trigger.'
  },
  structureDensity: {
    name: 'Structure Density',
    description: 'Counts the number of geometry levels (Gann, Fibonacci, Log) within one ATR of current price, indicating how congested the structural landscape is nearby.',
    formula: 'Density = count(levels where |level - LTP| ≤ ATR)',
    interpretation: 'Clean (≤2 zones): Few nearby levels, clearer path. Moderate (3-5 zones): Several nearby levels. High noise (≥6 zones): Many nearby levels, congested structure.',
    limitation: 'Dependent on geometry engine output. ATR tolerance affects count. High density does not predict direction or reaction.',
    useCase: 'Structure density indicates how many potential reaction points exist near current price. High density suggests a congested area where price may interact with multiple levels. Clean structure suggests fewer nearby reference points. Use as awareness of structural complexity.'
  }
};

export const structureContextDescriptions: Record<string, ConceptDescription> = {
  rangeAnalysis: {
    name: 'Range State Analysis',
    description: 'Measures the width of the observable trading range and current price position within it. Provides objective boundaries and relative positioning without predicting direction.',
    formula: 'Width = max(H) - min(L); Position = (LTP - Low) / Width × 100%; Boundary proximity in ATR units',
    interpretation: 'Position near 0% indicates price at range bottom. Position near 100% indicates price at range top. Boundary proximity shows distance to nearest extreme in ATR units.',
    limitation: 'Range boundaries shift as new data arrives. Lookback period affects range calculation. Position does not indicate what price will do at boundaries.',
    useCase: 'Range analysis provides spatial context. Knowing where price sits within the observable range helps understand positioning. Boundary proximity in ATR units contextualizes distance. When near a boundary, observe price behavior; do not assume reaction.'
  },
  volumeContext: {
    name: 'Volume Context',
    description: 'Compares current volume to recent average and measures volume distribution across price zones to identify where participation has concentrated.',
    formula: 'Current vs Average = V_now / V_avg × 100; Bias = V_lower_zone / V_upper_zone',
    interpretation: 'Above-average volume indicates increased participation. Volume bias toward support means more volume occurred in lower price zones; bias toward resistance means more in upper zones.',
    limitation: 'Requires accurate volume data. Volume distribution within range is a simplified proxy. Bias does not attribute intent.',
    useCase: 'Volume context describes participation levels and distribution. High volume at current level suggests increased interest. Volume bias indicates where most participation occurred within the range. This is observational data for structural awareness.'
  },
  testMetrics: {
    name: 'Boundary Test Quality',
    description: 'Identifies recent boundary tests (price approaching range extremes) and measures the depth of the test and subsequent recovery. Quantifies boundary interaction without predicting outcome.',
    formula: 'Depth = distance_to_boundary / ATR; Recovery = immediate (≤3 bars, >1 ATR) / gradual (>0.5 ATR) / none',
    interpretation: 'Shallow tests stay further from boundary. Deep tests penetrate closer. Immediate recovery shows quick response. Gradual recovery shows slower response. No recovery shows continued presence at boundary.',
    limitation: 'Test detection uses fixed thresholds. Recovery classification is categorical. Past test behavior does not guarantee future behavior.',
    useCase: 'Test metrics describe how price has recently interacted with boundaries. Multiple shallow tests with immediate recovery may indicate boundary strength. Deep tests with no recovery may indicate boundary weakness. These are structural observations for context.'
  },
  compression: {
    name: 'Range Compression',
    description: 'Measures whether current bar ranges are smaller or larger than historical average, indicating volatility contraction or expansion.',
    formula: 'Ratio = avg_recent_range / avg_historical_range × 100; Trend = contracting / stable / expanding',
    interpretation: 'Ratio below 100% indicates compression (smaller current ranges). Ratio above 100% indicates expansion. Trend shows direction of change.',
    limitation: 'Compression can persist indefinitely. Expansion does not have predictable timing. Lookback periods affect calculation.',
    useCase: 'Compression analysis shows volatility character. Prolonged compression historically precedes expansion, but timing is unknown. Use compression awareness to contextualize current price action style. Contracting ranges suggest coiled conditions; expanding ranges suggest active movement.'
  },
  effortResult: {
    name: 'Effort vs Result',
    description: 'Compares the magnitude of price movement (result) to the effort expended (volume or range). Reveals whether price moves easily or with difficulty.',
    formula: 'Ratio = |price_change| / normalized_effort; Effort = volume or range when volume unavailable',
    interpretation: 'High effort, small movement suggests resistance to movement. Low effort, large movement suggests ease of price travel. Proportional effort-result is neutral.',
    limitation: 'Without volume, range is an imperfect effort proxy. Ratio interpretation is relative, not absolute. Does not indicate direction.',
    useCase: 'Effort/result describes the ease of recent price movement. High effort with small result may indicate resistance to movement. Low effort with large result may indicate easier price travel. This is descriptive analysis of price dynamics, not predictive.'
  }
};
