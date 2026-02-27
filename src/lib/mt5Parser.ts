// ============= MT5 CSV Parser =============
// Parses MetaTrader 5 exported OHLCV data with mandatory validation
// Format: DATE<tab>TIME<tab>OPEN<tab>HIGH<tab>LOW<tab>CLOSE<tab>TICKVOL<tab>VOL<tab>SPREAD

export interface MT5Bar {
  timestamp: string;  // ISO format: YYYY-MM-DDTHH:mm:ss
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm:ss
  open: number;
  high: number;
  low: number;
  close: number;
  tickVolume: number;
  volume: number;
  spread: number;
}

export interface ParseResult {
  success: boolean;
  bars: MT5Bar[];
  error?: string;
  warnings: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  barCount: number;
  dateRange: {
    start: string;
    end: string;
  } | null;
}

// Parse MT5 tab-separated format
function parseMT5Line(line: string, lineNumber: number): { bar: MT5Bar | null; error?: string; warning?: string } {
  // Split by tab
  const parts = line.split('\t').map(p => p.trim());

  // MT5 format: DATE, TIME, OPEN, HIGH, LOW, CLOSE, TICKVOL, VOL, SPREAD
  if (parts.length < 6) {
    return { bar: null, error: `Line ${lineNumber}: Invalid format - expected at least 6 columns` };
  }

  // Parse date and time
  const dateStr = parts[0]; // Format: YYYY.MM.DD
  const timeStr = parts[1]; // Format: HH:mm:ss

  // Convert date format from YYYY.MM.DD to YYYY-MM-DD
  const dateParts = dateStr.split('.');
  if (dateParts.length !== 3) {
    return { bar: null, error: `Line ${lineNumber}: Invalid date format "${dateStr}"` };
  }
  const isoDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
  const timestamp = `${isoDate}T${timeStr}`;

  // Parse OHLCV values
  const open = parseFloat(parts[2]);
  const high = parseFloat(parts[3]);
  const low = parseFloat(parts[4]);
  const close = parseFloat(parts[5]);
  const tickVolume = parts.length > 6 ? parseFloat(parts[6]) || 0 : 0;
  const volume = parts.length > 7 ? parseFloat(parts[7]) || 0 : 0;
  const spread = parts.length > 8 ? parseFloat(parts[8]) || 0 : 0;

  // Validate OHLC values
  if (isNaN(open)) {
    return { bar: null, error: `Line ${lineNumber}: Invalid OPEN price - Open price is MANDATORY for structural integrity` };
  }
  if (isNaN(high) || isNaN(low) || isNaN(close)) {
    return { bar: null, error: `Line ${lineNumber}: Invalid HLC values` };
  }

  // Validate OHLC logic
  if (high < low) {
    return { bar: null, error: `Line ${lineNumber}: High (${high}) cannot be less than Low (${low})` };
  }
  if (high < open || high < close) {
    return { bar: null, warning: `Line ${lineNumber}: High (${high}) is less than Open (${open}) or Close (${close})` };
  }
  if (low > open || low > close) {
    return { bar: null, warning: `Line ${lineNumber}: Low (${low}) is greater than Open (${open}) or Close (${close})` };
  }

  return {
    bar: {
      timestamp,
      date: isoDate,
      time: timeStr,
      open,
      high,
      low,
      close,
      tickVolume,
      volume,
      spread
    }
  };
}

// Detect if line is a header
function isHeaderLine(line: string): boolean {
  const lower = line.toLowerCase();
  return lower.includes('<date>') ||
    lower.includes('date') && (lower.includes('open') || lower.includes('high'));
}

// Main parser function
export function parseMT5CSV(content: string): ParseResult {
  const lines = content.trim().split('\n');
  const bars: MT5Bar[] = [];
  const warnings: string[] = [];

  if (lines.length === 0) {
    return { success: false, bars: [], error: 'Empty file', warnings: [] };
  }

  let dataStartLine = 0;

  // Check for header
  if (isHeaderLine(lines[0])) {
    dataStartLine = 1;
  }

  // Parse each line
  for (let i = dataStartLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const result = parseMT5Line(line, i + 1);

    if (result.error) {
      return { success: false, bars: [], error: result.error, warnings };
    }

    if (result.warning) {
      warnings.push(result.warning);
    }

    if (result.bar) {
      bars.push(result.bar);
    }
  }

  if (bars.length === 0) {
    return { success: false, bars: [], error: 'No valid bars found in file', warnings };
  }

  // Sort by timestamp (oldest first)
  bars.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return { success: true, bars, warnings };
}

// Validate parsed data for analysis requirements
export function validateMT5Data(bars: MT5Bar[], minBars: number = 50): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum bars
  if (bars.length < minBars) {
    errors.push(`Insufficient data: ${bars.length} bars provided, minimum ${minBars} required`);
  }

  // Check for missing Open prices (CRITICAL)
  const missingOpen = bars.filter(b => isNaN(b.open) || b.open === 0);
  if (missingOpen.length > 0) {
    errors.push(`Invalid data: Open price is MANDATORY for structural integrity. ${missingOpen.length} bars have missing/invalid Open prices.`);
  }

  // Check for chronological order
  for (let i = 1; i < bars.length; i++) {
    if (bars[i].timestamp < bars[i - 1].timestamp) {
      warnings.push('Data is not in chronological order - reordering applied');
      break;
    }
  }

  // Check for gaps
  const dates = [...new Set(bars.map(b => b.date))];
  if (dates.length > 1) {
    // Simple check for large gaps (more than 3 days)
    for (let i = 1; i < dates.length; i++) {
      const d1 = new Date(dates[i - 1]);
      const d2 = new Date(dates[i]);
      const daysDiff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 3) {
        warnings.push(`Large gap detected: ${dates[i - 1]} to ${dates[i]} (${Math.round(daysDiff)} days)`);
      }
    }
  }

  // Check tick volume availability
  const hasTickVolume = bars.some(b => b.tickVolume > 0);
  if (!hasTickVolume) {
    warnings.push('No tick volume data available - volume-based metrics will use unit weighting');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    barCount: bars.length,
    dateRange: bars.length > 0 ? {
      start: bars[0].timestamp,
      end: bars[bars.length - 1].timestamp
    } : null
  };
}

// Convert MT5Bar to standard OHLCVBar format
export interface OHLCVBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function convertToOHLCV(bars: MT5Bar[]): OHLCVBar[] {
  return bars.map(bar => ({
    timestamp: bar.timestamp,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    // Use tick volume as primary volume source (actual volume is 0 in FX)
    volume: bar.tickVolume > 0 ? bar.tickVolume : 1
  }));
}

// Parse generic CSV (comma-separated) as fallback
export function parseGenericCSV(content: string): ParseResult {
  const lines = content.trim().split('\n');
  const bars: MT5Bar[] = [];
  const warnings: string[] = [];

  if (lines.length === 0) {
    return { success: false, bars: [], error: 'Empty file', warnings: [] };
  }

  let dataStartLine = 0;
  const firstLine = lines[0].toLowerCase();

  // Detect header
  if (firstLine.includes('open') || firstLine.includes('date') || firstLine.includes('high')) {
    dataStartLine = 1;
  }

  for (let i = dataStartLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());

    // Try to detect format
    // Format 1: O,H,L,C,V (5 numeric columns)
    // Format 2: Date,O,H,L,C,V (date + 5 columns)
    // Format 3: Date,Time,O,H,L,C,V (date + time + 5 columns)

    let open: number, high: number, low: number, close: number, volume: number;
    let timestamp = new Date().toISOString();

    if (parts.length >= 5) {
      // Check if first column is a date
      const firstIsDate = isNaN(parseFloat(parts[0])) && (parts[0].includes('-') || parts[0].includes('/') || parts[0].includes('.'));

      if (firstIsDate && parts.length >= 6) {
        // Has date column
        timestamp = parts[0];
        if (parts.length >= 7 && isNaN(parseFloat(parts[1]))) {
          // Has time column too
          timestamp = `${parts[0]}T${parts[1]}`;
          open = parseFloat(parts[2]);
          high = parseFloat(parts[3]);
          low = parseFloat(parts[4]);
          close = parseFloat(parts[5]);
          volume = parts.length > 6 ? parseFloat(parts[6]) || 0 : 0;
        } else {
          open = parseFloat(parts[1]);
          high = parseFloat(parts[2]);
          low = parseFloat(parts[3]);
          close = parseFloat(parts[4]);
          volume = parts.length > 5 ? parseFloat(parts[5]) || 0 : 0;
        }
      } else {
        // No date column
        open = parseFloat(parts[0]);
        high = parseFloat(parts[1]);
        low = parseFloat(parts[2]);
        close = parseFloat(parts[3]);
        volume = parts.length > 4 ? parseFloat(parts[4]) || 0 : 0;
        timestamp = `${new Date().toISOString().split('T')[0]}T00:${String(i).padStart(2, '0')}:00`;
      }

      // CRITICAL: Validate Open price
      if (isNaN(open)) {
        return {
          success: false,
          bars: [],
          error: `Line ${i + 1}: Invalid data - Open price is MANDATORY for structural integrity`,
          warnings
        };
      }

      if (!isNaN(high) && !isNaN(low) && !isNaN(close) && high >= low) {
        bars.push({
          timestamp,
          date: timestamp.split('T')[0],
          time: timestamp.split('T')[1] || '00:00:00',
          open,
          high,
          low,
          close,
          tickVolume: volume,
          volume: 0,
          spread: 0
        });
      }
    }
  }

  if (bars.length === 0) {
    return { success: false, bars: [], error: 'No valid OHLCV bars found. Ensure Open price is included.', warnings };
  }

  return { success: true, bars, warnings };
}

// Auto-detect format and parse
export function parseCSVAuto(content: string): ParseResult {
  // Check if tab-separated (MT5 format)
  if (content.includes('\t')) {
    return parseMT5CSV(content);
  }

  // Otherwise try generic CSV
  return parseGenericCSV(content);
}

// Session detection from timestamps
export interface SessionInfo {
  sessionStartIndex: number;
  sessionOpen: number;
  sessionDate: string;
  sessionCount: number;
}

export function detectSessions(bars: OHLCVBar[]): SessionInfo {
  if (bars.length === 0) {
    return { sessionStartIndex: 0, sessionOpen: 0, sessionDate: '', sessionCount: 0 };
  }

  // Find session boundaries based on date changes
  const sessions: number[] = [0]; // First bar always starts a session

  for (let i = 1; i < bars.length; i++) {
    const currentDate = bars[i].timestamp.split('T')[0];
    const previousDate = bars[i - 1].timestamp.split('T')[0];

    if (currentDate !== previousDate) {
      sessions.push(i);
    }
  }

  // Return the last session start
  const lastSessionStart = sessions[sessions.length - 1];

  return {
    sessionStartIndex: lastSessionStart,
    sessionOpen: bars[lastSessionStart].open,
    sessionDate: bars[lastSessionStart].timestamp.split('T')[0],
    sessionCount: sessions.length
  };
}
