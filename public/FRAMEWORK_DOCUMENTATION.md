# Market Structure Analysis Framework
## Complete User Documentation

**Version:** 1.0  
**Classification:** Structural Intelligence Engine  
**Compliance:** CMT Level III Rigor

---

## Table of Contents

1. [Framework Philosophy](#1-framework-philosophy)
2. [What This System Is (And Is Not)](#2-what-this-system-is-and-is-not)
3. [Input Requirements](#3-input-requirements)
4. [Core Metrics Reference](#4-core-metrics-reference)
   - [Price Statistics](#41-price-statistics)
   - [Geometric Price Levels](#42-geometric-price-levels)
   - [Market Regime Analysis](#43-market-regime-analysis)
   - [Auction Context](#44-auction-context)
   - [Price Context](#45-price-context)
   - [Market Structure Context](#46-market-structure-context)
   - [Structural Intelligence Layer](#47-structural-intelligence-layer)
5. [Interpreting the Analysis Report](#5-interpreting-the-analysis-report)
6. [Mathematical Foundations](#6-mathematical-foundations)
7. [Limitations & Disclaimers](#7-limitations--disclaimers)
8. [Glossary](#8-glossary)

---

## 1. Framework Philosophy

This framework is built on three foundational principles:

### 1.1 Observation Over Prediction
Every metric describes **what the market structure currently shows**, not what it will do. The system measures structural states, not future outcomes.

### 1.2 Mathematical Transparency
All calculations use explicit, auditable formulas. No black boxes, no hidden parameters, no optimization. Every number can be traced back to raw OHLCV data.

### 1.3 Participant-Aware Geometry
Price levels are not arbitrary—they emerge from mathematical relationships (Fibonacci, Gann, Logarithmic) that institutional participants reference. This framework maps where these levels cluster and how volume distributes around them.

---

## 2. What This System Is (And Is Not)

### ✅ This System IS:
- A **structural intelligence engine** that measures market state
- A **market state microscope** revealing hidden geometric relationships
- A **participant-aware geometric framework** mapping institutional reference points
- **Fully auditable** with every calculation traceable to source data

### ❌ This System IS NOT:
- An indicator stack generating buy/sell signals
- A prediction model forecasting future prices
- A trading system or strategy generator
- A replacement for trader judgment

**Critical Understanding:** All outputs are mathematical observations. The trader supplies all interpretation and decision-making.

---

## 3. Input Requirements

### 3.1 Required Data
| Field | Description | Format |
|-------|-------------|--------|
| **Open** | Opening price of each bar | Decimal |
| **High** | Highest price of each bar | Decimal |
| **Low** | Lowest price of each bar | Decimal |
| **Close** | Closing price of each bar | Decimal |
| **Volume** | Trading volume of each bar | Integer |
| **Timestamp** | Date/time of each bar | ISO 8601 or Unix |

### 3.2 Minimum Data Requirements
- **Minimum bars:** 50 (for basic analysis)
- **Recommended bars:** 200+ (for full Hurst spectrum analysis)
- **Optimal bars:** 500+ (for stable structural metrics)

### 3.3 Anchor Price
A user-defined reference price (e.g., significant high/low, VWAP, previous close) that serves as the structural anchor for relative calculations.

---

## 4. Core Metrics Reference

---

### 4.1 Price Statistics

Basic statistical measures providing foundational context.

#### Last Traded Price (LTP)
- **Definition:** Most recent closing price
- **Use:** Reference point for all distance calculations

#### Average True Range (ATR)
- **Formula:** `ATR = SMA(max(H-L, |H-Pc|, |L-Pc|), 14)`
- **Interpretation:** Normalized volatility measure; used to make all distances comparable across instruments
- **Unit:** Price points

#### Highest High / Lowest Low
- **Definition:** Maximum/minimum prices in the dataset
- **Use:** Defines the price range for level calculations

---

### 4.2 Geometric Price Levels

Three mathematical systems for identifying significant price levels, plus their confluence zones.

#### 4.2.1 Square-Root Lattice (Gann) Levels

**Philosophy:** W.D. Gann observed that markets often respect square-root mathematical relationships.

**Formula:**
```
Level = (√Anchor ± n × increment)²
where increment = 0.125 (1/8th divisions)
```

**Interpretation:** 
- Levels represent natural mathematical "nodes" in price space
- Tighter clustering indicates potential structural significance
- No directional implication

**Limitation:** Effectiveness varies by instrument and timeframe

---

#### 4.2.2 Fibonacci Retracements & Extensions

**Philosophy:** Fibonacci ratios (derived from the golden ratio φ ≈ 1.618) appear frequently in natural systems and market structures.

**Ratios Used:**
| Ratio | Derivation |
|-------|------------|
| 0.236 | φ⁻⁴ |
| 0.382 | φ⁻² |
| 0.500 | Midpoint |
| 0.618 | φ⁻¹ |
| 0.786 | √0.618 |
| 1.000 | Unity |
| 1.272 | √φ |
| 1.618 | φ |
| 2.618 | φ² |

**Formula:**
```
Retracement: Level = High - (High - Low) × Ratio
Extension: Level = High + (High - Low) × (Ratio - 1)
```

**Interpretation:** These levels often coincide with institutional order placement zones

**Limitation:** Requires clear high/low identification; subjective range selection affects all levels

---

#### 4.2.3 Logarithmic Price Levels

**Philosophy:** Financial returns are log-normally distributed. Logarithmic levels respect this mathematical reality.

**Formula:**
```
Level = exp(ln(Anchor) + n × step)
where step = ln(1.05) ≈ 5% intervals
```

**Interpretation:** 
- Equal percentage moves map to equal distances
- Natural for assets with exponential growth characteristics
- Institutionally relevant for percentage-based position sizing

**Limitation:** Less intuitive for linear price thinking

---

#### 4.2.4 Confluence Zones

**Definition:** Price areas where multiple geometric systems (Gann, Fibonacci, Logarithmic) generate levels within close proximity.

**Formula:**
```
Confluence = Count of levels within ±0.5 ATR of each other
Strength = Number of overlapping systems (1-3)
```

**Classification:**
| Strength | Meaning |
|----------|---------|
| 3 | Triple confluence (all three systems) |
| 2 | Double confluence (two systems) |
| 1 | Single system level |

**Interpretation:** Higher confluence suggests greater potential structural significance

**Critical Note:** Confluence describes geometric density, NOT predictive power

---

### 4.3 Market Regime Analysis

Characterizes the current market state using volatility and persistence metrics.

#### 4.3.1 Hurst Exponent (DFA Method)

**Definition:** Measures the tendency of price to trend or mean-revert.

**Procedure (Fixed, Non-Tunable):**
1. Compute log-returns: `r_t = ln(P_t / P_{t-1})`
2. Integrate: `Y(k) = Σ(r_i - r̄)` for i=1 to k
3. Segment into fixed scales: `s ∈ {16, 32, 64, 128}`
4. Detrend each segment with linear fit only
5. Compute fluctuation: `F(s) = √(1/N × Σ(Y - Y_fit)²)`
6. Hurst = slope of: `log F(s) vs log s`

**Interpretation:**
| Hurst Value | Regime | Meaning |
|-------------|--------|---------|
| H < 0.4 | Mean-Reverting | Price tends to reverse |
| 0.4 ≤ H ≤ 0.6 | Random Walk | No persistent behavior |
| H > 0.6 | Trending | Price tends to continue |

**Constraints:**
- 🚫 No polynomial detrending
- 🚫 No adaptive scales  
- 🚫 No optimization

**Limitation:** Requires 50+ bars minimum; sensitive to data quality

---

#### 4.3.2 ATR Volatility Classification

**Formula:** 
```
Relative ATR = Current ATR / ATR₂₀ (20-period average)
```

**Classification:**
| Relative ATR | State |
|--------------|-------|
| < 0.7 | Compressed |
| 0.7 - 1.3 | Normal |
| > 1.3 | Expanded |

**Interpretation:** Volatility state affects expected price movement magnitude

---

#### 4.3.3 Integrated Market State

Combines Hurst and Volatility into a unified regime classification:

| State | Hurst | Volatility | Description |
|-------|-------|------------|-------------|
| Quiet Drift | Trending | Compressed | Low-volatility trend |
| Active Trend | Trending | Expanded | High-volatility trend |
| Compressed Chop | Mean-Reverting | Compressed | Tight range-bound |
| Volatile Chop | Mean-Reverting | Expanded | Wide range-bound |
| Transition | Random | Any | Regime uncertainty |

---

### 4.4 Auction Context (Session-Anchored)

Volume-profile metrics anchored to the current trading session.

#### 4.4.1 Session VWAP (Volume-Weighted Average Price)

**Formula:**
```
VWAP = Σ(Typical Price × Volume) / Σ(Volume)
where Typical Price = (H + L + C) / 3
```

**Distance Metric:**
```
VWAP Distance = (LTP - VWAP) / ATR
```

**Classification:**
| Distance | Position |
|----------|----------|
| > +1.0 ATR | Above Value |
| -1.0 to +1.0 ATR | At Value |
| < -1.0 ATR | Below Value |

**Interpretation:** VWAP represents the average price weighted by participation

---

#### 4.4.2 Point of Control (POC)

**Definition:** Price level with highest traded volume in the session.

**Formula:**
```
POC = Price bin with max(Volume)
```

**Interpretation:** Represents the "fair value" as determined by maximum participation

---

#### 4.4.3 Value Area (VA)

**Definition:** Price range containing a specified percentage (typically 70%) of session volume.

**Components:**
- **VAH (Value Area High):** Upper boundary
- **VAL (Value Area Low):** Lower boundary
- **VA Width:** VAH - VAL

**Formula:**
```
Starting from POC, alternately add price bins above and below
until cumulative volume ≥ Target % of total volume
```

**Interpretation:** 
- Price inside VA: Trading within accepted value range
- Price outside VA: Potential value exploration or rejection

---

#### 4.4.4 Initial Balance (IB)

**Definition:** Price range established during the first N bars of the session.

**Default:** First 4 bars (typically first hour for 15-min bars)

**Components:**
- **IB High:** Highest high of first N bars
- **IB Low:** Lowest low of first N bars
- **IB Width:** IB High - IB Low

**Interpretation:** Sets the initial "battlefield" for the session

---

#### 4.4.5 Range Position

**Formula:**
```
Range Position = (LTP - Session Low) / (Session High - Session Low) × 100%
```

**Interpretation:** Shows where current price sits within the session range

---

### 4.5 Price Context (Session-Anchored)

Simple price-relative metrics anchored to session opening.

#### 4.5.1 Session Open

**Definition:** First bar's opening price of the current session

**Use:** Primary intraday reference anchor

---

#### 4.5.2 Price vs Open

**Formula:**
```
Price vs Open = (LTP - Session Open) / ATR
```

**Classification:**
| Value | Position |
|-------|----------|
| < -0.5 ATR | Below Open |
| -0.5 to +0.5 ATR | At Open |
| > +0.5 ATR | Above Open |

---

### 4.6 Market Structure Context

Advanced structural observations derived from OHLCV data.

#### 4.6.1 Range Analysis

**Width Formula:**
```
Range Width = Session High - Session Low
Width in ATR = Range Width / ATR
```

**Position Formula:**
```
Range Position = (LTP - Low) / (High - Low) × 100%
```

**Boundary Proximity:**
```
Distance to nearest boundary (high or low) in ATR units
```

---

#### 4.6.2 Volume Context

**Current vs Average:**
```
Volume Ratio = Current Volume / SMA(Volume, 20) × 100%
```

**Volume Bias:**
```
Support Bias = Volume at lower half / Volume at upper half
```

**Classification:**
| Bias Ratio | Label |
|------------|-------|
| > 1.2 | Higher at support |
| < 0.8 | Higher at resistance |
| 0.8 - 1.2 | Neutral |

---

#### 4.6.3 Boundary Test Detection

**Definition:** Identifies recent approaches to range boundaries.

**Metrics:**
- **Bars Since:** How many bars ago the test occurred
- **Depth:** How far into the boundary zone (in ATR)
- **Recovery:** Whether price moved away from boundary

---

#### 4.6.4 Compression Analysis

**Formula:**
```
Compression Ratio = Current Range / Average Range × 100%
```

**Trend Detection:**
- Contracting: Ratio decreasing over time
- Expanding: Ratio increasing over time
- Stable: Minimal change

---

#### 4.6.5 Effort vs Result

**Formula:**
```
Effort = Recent volume (normalized)
Result = Recent price change (in ATR)
Ratio = Effort / Result
```

**Interpretation:**
| Ratio | Meaning |
|-------|---------|
| High | High effort, small result (potential exhaustion) |
| Low | Low effort, large result (easy movement) |
| Normal | Proportional effort to result |

---

### 4.7 Structural Intelligence Layer

The most advanced analytical layer, measuring structural integrity and fractal properties.

---

#### 4.7.1 Scale Decomposition Engine

##### DFA-Based Hurst Spectrum

**Definition:** Hurst exponent calculated at multiple fixed scales.

**Scales:** `{16, 32, 64, 128}` bars (fixed, non-tunable)

**Output:** Four H values, one per scale

**Interpretation:** Shows how persistence varies across timeframes

---

##### Hurst Spectrum Stability (HSS)

**Formula:**
```
HSS = 1 - σ(H_s) / max(σ_ref, ε)
```

Where:
- `σ(H_s)` = Standard deviation of Hurst values across scales
- `σ_ref` = Long-run median dispersion (typically 0.15)
- `ε` = Stability constant (prevents division by zero)

**Classification:**
| HSS | State |
|-----|-------|
| > 0.7 | Coherent |
| 0.3 - 0.7 | Transitional |
| < 0.3 | Fragmented |

**Interpretation:** 
- Coherent: Structure consistent across scales
- Fragmented: Different behavior at different scales

---

##### Multifractality Curvature

**Definition:** Measures how much Hurst varies with scale (descriptive only).

**Formula:**
```
Curvature = max(H_spectrum) - min(H_spectrum)
```

**Classification:**
| Curvature | Type |
|-----------|------|
| < 0.1 | Monofractal |
| 0.1 - 0.2 | Mild multifractal |
| > 0.2 | Strong multifractal |

---

#### 4.7.2 Anchor-Relative Structure

##### Volume-Weighted Hurst (Above/Below Anchor)

**Definition:** Separate Hurst calculations for bars above vs below the anchor price.

**Formula:**
```
H_above = Hurst of returns when price > Anchor
H_below = Hurst of returns when price < Anchor
```

**Interpretation:** Reveals if trending/mean-reverting behavior differs by price zone

---

##### Anchor Structural Dominance (ASD)

**Formula:**
```
ASD = |H_above - H_below| / √(H_above² + H_below²)
```

**Properties:**
- Dimensionless (0 to 1 range)
- Scale-invariant
- Survives regime shifts

**Interpretation:**
| ASD | Meaning |
|-----|---------|
| < 0.2 | Symmetric structure |
| 0.2 - 0.5 | Moderate asymmetry |
| > 0.5 | Strong asymmetry |

---

#### 4.7.3 Logarithmic Lattice Dynamics

##### Lattice Compression Ratio (LCR)

**Formula:**
```
LCR = Current log-level spacing / Median historical spacing
```

**Note:** Uses median (not mean) to avoid tail distortion.

**Classification:**
| LCR | State |
|-----|-------|
| < 0.8 | Compressed |
| 0.8 - 1.2 | Neutral |
| > 1.2 | Expanded |

**Interpretation:** Measures how "tight" or "loose" the logarithmic structure is

---

##### Lattice Participation Index (Entropy-Based)

**Formula:**
```
LPI = -Σ p_i × log(p_i)
```

Where:
```
p_i = V_i / ΣV (volume proportion at each log level)
```

**Properties:**
- OHLCV-safe (uses only standard data)
- Non-parametric
- Institutionally interpretable

**Classification:**
| LPI | Distribution |
|-----|--------------|
| Low (< 1.5) | Concentrated |
| Medium (1.5-2.5) | Moderate |
| High (> 2.5) | Dispersed |

**Interpretation:** Higher entropy = more evenly distributed participation across levels

---

#### 4.7.4 Structural Integrity & Resonance

##### Structural Integrity Index (SII) — Median Form

**Formula:**
```
SII = median(
  1 - |H - 0.5|,           // Hurst stability
  1 - Δlog(ATR),           // Volatility stability  
  GeometryAlignment        // Level confluence strength
)
```

**Why Median?**
- Robust to outliers
- No hidden weighting
- Prevents multiplicative collapse under noise

**Classification:**
| SII | State |
|-----|-------|
| > 0.7 | High Integrity |
| 0.4 - 0.7 | Moderate Integrity |
| < 0.4 | Low Integrity |

**Interpretation:** Overall structural coherence measure

---

##### Structural Resonance Power

**Definition:** Identifies dominant periodicities in the log-lattice structure.

**Constraints (REQUIRED for validity):**
- ✅ Frequencies pre-defined from log lattice ratios only
- ✅ No peak-search optimization
- ✅ Output is power magnitude only
- 🚫 No "dominant cycle" claims

**Output:** Power value (0-1 normalized)

**Interpretation:** Higher power suggests more periodic structural behavior

---

## 5. Interpreting the Analysis Report

### 5.1 Report Sections Overview

| Section | Purpose |
|---------|---------|
| **Header** | Symbol, timeframe, data range, generation timestamp |
| **Price Statistics** | Basic price and volatility context |
| **Geometry Levels** | Mathematical price level maps |
| **Market Regime** | Current state classification |
| **Auction Context** | Volume-based session structure |
| **Price Context** | Simple price-relative positioning |
| **Market Structure** | Advanced structural observations |
| **Structural Intelligence** | Fractal and integrity metrics |
| **Disclaimers** | Important limitations |

### 5.2 Reading Priority

**For Quick Assessment:**
1. Market State (Regime)
2. Range Position
3. VWAP Distance
4. Structural Integrity Index

**For Deep Analysis:**
1. Full Hurst Spectrum
2. Anchor Structural Dominance
3. Lattice Participation Entropy
4. Confluence Zone mapping

### 5.3 Cross-Referencing Metrics

| If You See... | Check Also... |
|---------------|---------------|
| High Hurst (trending) | ATR expansion, Range position |
| Low Hurst (mean-reverting) | Compression ratio, Value area |
| High confluence | Volume at those levels |
| Fragmented HSS | Individual scale Hurst values |
| High ASD | Which side (above/below) dominates |

---

## 6. Mathematical Foundations

### 6.1 Normalization Philosophy

All distance metrics are normalized by ATR to enable:
- Cross-instrument comparison
- Cross-timeframe comparison
- Consistent threshold interpretation

### 6.2 Classification Thresholds

Thresholds are derived from:
- Statistical distributions (standard deviations)
- Mathematical breakpoints (0.5 for Hurst)
- Institutional conventions (70% value area)

**NOT from:**
- Optimization or curve-fitting
- Predictive backtesting
- Subjective preference

### 6.3 Calculation Order

```
1. Raw OHLCV data ingestion
2. Basic statistics (ATR, range)
3. Geometric level generation
4. Volume profile construction
5. Regime classification
6. Structural intelligence metrics
7. Report compilation
```

---

## 7. Limitations & Disclaimers

### 7.1 Data Limitations

- **Minimum data:** Analysis quality degrades below 50 bars
- **Gaps:** Data gaps may distort session-anchored metrics
- **Volume:** Metrics assume volume data is accurate and available
- **Timestamps:** Session detection requires valid timestamp data

### 7.2 Methodological Limitations

- **No predictions:** All metrics are descriptive, not predictive
- **Regime lag:** Hurst calculation has inherent lookback lag
- **Session assumptions:** Session boundaries use UTC-based heuristics
- **Confluence is not causation:** Level clustering does not guarantee price reaction

### 7.3 Use Limitations

- **Not trading advice:** This framework provides observations, not recommendations
- **Trader judgment required:** All interpretation and action decisions rest with the user
- **No guarantee:** Past structural patterns do not guarantee future behavior
- **Instrument-specific:** Effectiveness may vary across different instruments

### 7.4 Legal Disclaimer

This analysis framework is provided for educational and informational purposes only. It does not constitute investment advice, trading recommendations, or financial guidance. Users assume all responsibility for their trading decisions. Past performance does not indicate future results.

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **Anchor** | User-defined reference price for relative calculations |
| **ASD** | Anchor Structural Dominance - measures Hurst asymmetry above/below anchor |
| **ATR** | Average True Range - volatility normalization metric |
| **Confluence** | Zone where multiple geometric systems generate nearby levels |
| **DFA** | Detrended Fluctuation Analysis - method for calculating Hurst |
| **Entropy** | Information-theoretic measure of distribution evenness |
| **Fibonacci** | Ratio-based levels derived from golden ratio relationships |
| **Gann** | Square-root mathematical levels from W.D. Gann's work |
| **HSS** | Hurst Spectrum Stability - consistency across scales |
| **Hurst** | Exponent measuring persistence (trending) or anti-persistence (mean-reverting) |
| **IB** | Initial Balance - opening range of session |
| **LCR** | Lattice Compression Ratio - log-level spacing measure |
| **Logarithmic** | Levels based on percentage intervals in log space |
| **LPI** | Lattice Participation Index - entropy of volume at log levels |
| **LTP** | Last Traded Price - most recent closing price |
| **Multifractal** | Having different fractal properties at different scales |
| **OHLCV** | Open, High, Low, Close, Volume - standard bar data |
| **POC** | Point of Control - highest volume price level |
| **Regime** | Current market state classification |
| **SII** | Structural Integrity Index - overall structural coherence |
| **VA** | Value Area - range containing specified % of volume |
| **VAH/VAL** | Value Area High/Low - boundaries of value area |
| **VWAP** | Volume-Weighted Average Price |

---

## Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Technical Reference Manual |
| **Intended Audience** | Analysts, Traders, Researchers |
| **Compliance Level** | CMT Level III Rigor |
| **Last Updated** | 2026-01-19 |

---

*This framework measures structural integrity itself—a rare capability that goes beyond structure visualization. All formulas are fixed, transparent, and auditable.*
