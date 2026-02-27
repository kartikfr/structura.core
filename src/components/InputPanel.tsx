import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw, Database, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { parseCSVAuto, validateMT5Data, convertToOHLCV, OHLCVBar } from '@/lib/mt5Parser';
import { supabase } from '@/integrations/supabase/client';
import { formatInstrumentPrice, getInstrumentMeta, InstrumentType } from '@/lib/priceFormatting';
import { createDataSnapshot, DataSnapshot, validateSnapshot } from '@/lib/temporalSnapshot';

export type { OHLCVBar } from '@/lib/mt5Parser';

export interface AssetInfo {
  symbol: string;
  name: string;
  source: 'csv' | 'api' | 'manual';
  interval?: string;
  barCount: number;
  dateRange?: { start: string; end: string };
  /** Inferred instrument type: fx, commodity, index, or unknown */
  instrumentType?: InstrumentType;
  /** Display precision for this instrument (e.g., 5 for FX, 2 for commodities) */
  displayPrecision?: number;
}

interface InputPanelProps {
  onCalculate: (ltp: number, anchor: number, ohlcv: OHLCVBar[], assetInfo: AssetInfo, snapshot?: DataSnapshot) => void;
}

export function InputPanel({ onCalculate }: InputPanelProps) {
  const [ltp, setLtp] = useState('');
  const [anchor, setAnchor] = useState('');
  const [ohlcvText, setOhlcvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [symbol, setSymbol] = useState('XAU/USD');
  const [interval, setInterval] = useState('15min');
  const [currentAssetInfo, setCurrentAssetInfo] = useState<AssetInfo | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dataSnapshot, setDataSnapshot] = useState<DataSnapshot | null>(null);
  const [isLtpLocked, setIsLtpLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseAndValidate = (text: string): OHLCVBar[] | null => {
    const result = parseCSVAuto(text);

    if (!result.success) {
      setValidationStatus({ valid: false, message: result.error || 'Parse error' });
      return null;
    }

    const validation = validateMT5Data(result.bars, 10);

    if (!validation.isValid) {
      setValidationStatus({ valid: false, message: validation.errors[0] });
      return null;
    }

    if (validation.warnings.length > 0) {
      setValidationStatus({ valid: true, message: `${validation.barCount} bars loaded. ${validation.warnings[0]}` });
    } else {
      setValidationStatus({ valid: true, message: `${validation.barCount} bars loaded (${validation.dateRange?.start.split('T')[0]} to ${validation.dateRange?.end.split('T')[0]})` });
    }

    return convertToOHLCV(result.bars);
  };

  const handleCalculate = () => {
    const ohlcv = parseAndValidate(ohlcvText);

    if (!ohlcv || ohlcv.length < 2) {
      toast.error('Invalid data: Open price is MANDATORY for structural integrity');
      return;
    }

    // TEMPORAL SYNCHRONIZATION FIX: Create immutable snapshot from data
    const symbolStr = currentAssetInfo?.symbol ||
      (uploadedFileName ? extractSymbolFromFilename(uploadedFileName) : undefined);
    const snapshot = createDataSnapshot(ohlcv, symbolStr);

    // Validate snapshot integrity
    const snapshotValidation = validateSnapshot(snapshot);
    if (!snapshotValidation.isValid) {
      console.error('[TEMPORAL] Snapshot validation failed:', snapshotValidation.errors);
      toast.error('Data integrity error: ' + snapshotValidation.errors[0]);
      return;
    }

    // CRITICAL FIX: Use snapshot price as LTP, not user-entered value
    // This ensures "Last Traded Price" matches "Data Through" timestamp
    const ltpNum = snapshot.price;   // Close of last bar
    const anchorNum = snapshot.anchor; // Open of first bar

    // Update displayed values to match snapshot (for visual confirmation)
    setLtp(formatInstrumentPrice(ltpNum, { symbol: symbolStr }));
    setAnchor(formatInstrumentPrice(anchorNum, { symbol: symbolStr }));
    setIsLtpLocked(true);
    setDataSnapshot(snapshot);

    // Build asset info for display
    const assetInfo: AssetInfo = currentAssetInfo || {
      symbol: symbolStr || 'Unknown',
      name: uploadedFileName || 'Manual Entry',
      source: 'manual',
      barCount: ohlcv.length,
      dateRange: validationStatus?.message.includes('to')
        ? { start: '', end: '' }
        : undefined
    };
    assetInfo.barCount = ohlcv.length;

    onCalculate(ltpNum, anchorNum, ohlcv, assetInfo, snapshot);
    toast.success(`Analyzed ${ohlcv.length} bars for ${assetInfo.symbol} @ ${formatInstrumentPrice(ltpNum, { symbol: symbolStr })}`);

  };

  // Extract symbol from filename (e.g., "XAUUSD_M15.csv" -> "XAU/USD")
  const extractSymbolFromFilename = (filename: string): string => {
    const name = filename.replace(/\.(csv|txt)$/i, '').toUpperCase();
    // Common patterns: XAUUSD, XAU_USD, EURUSD, EUR_USD, etc.
    const match = name.match(/^([A-Z]{3})_?([A-Z]{3})/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    // Try to extract meaningful part
    const cleanName = name.replace(/_M\d+|_H\d+|_D\d+|_W\d+/gi, '').replace(/_/g, '/');
    return cleanName || 'Unknown';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setOhlcvText(text);

      const ohlcv = parseAndValidate(text);
      if (ohlcv && ohlcv.length > 0) {
        const lastBar = ohlcv[ohlcv.length - 1];

        const extractedSymbol = extractSymbolFromFilename(file.name);

        // Create snapshot to ensure temporal synchronization
        const snapshot = createDataSnapshot(ohlcv, extractedSymbol);
        setDataSnapshot(snapshot);

        // Preserve FX pip precision in UI inputs (e.g., 1.35968),
        // while leaving commodities at 2 decimals.
        const meta = getInstrumentMeta({ price: lastBar.close, symbol: extractedSymbol });
        setLtp(formatInstrumentPrice(snapshot.price, { symbol: extractedSymbol }));
        setAnchor(formatInstrumentPrice(snapshot.anchor, { symbol: extractedSymbol }));
        setIsLtpLocked(true);

        setCurrentAssetInfo({
          symbol: extractedSymbol,
          name: file.name.replace(/\.(csv|txt)$/i, ''),
          source: 'csv',
          barCount: ohlcv.length,
          dateRange: validationStatus?.message.includes('to')
            ? { start: '', end: '' }
            : undefined,
          instrumentType: meta.type,
          displayPrecision: meta.displayPrecision,
        });

        toast.success(`Loaded ${ohlcv.length} bars for ${extractedSymbol} @ ${formatInstrumentPrice(snapshot.price, { symbol: extractedSymbol })}`);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Whitelist of valid intervals for Twelve Data API
  const VALID_INTERVALS = ['1min', '5min', '15min', '30min', '1h', '2h', '4h', '8h', '1day', '1week', '1month'];

  const validateSymbol = (sym: string): { valid: boolean; cleaned: string; error?: string } => {
    // Remove common separators and trim
    const cleaned = sym.replace(/[/\\]/g, '').trim().toUpperCase();

    // Check length
    if (cleaned.length === 0 || cleaned.length > 20) {
      return { valid: false, cleaned: '', error: 'Symbol must be 1-20 characters' };
    }

    // Whitelist: only letters, numbers, dots, underscores, hyphens
    if (!/^[A-Z0-9._-]+$/i.test(cleaned)) {
      return { valid: false, cleaned: '', error: 'Invalid symbol format. Use only letters, numbers, dots, hyphens.' };
    }

    return { valid: true, cleaned };
  };

  const handleFetchAPI = async () => {
    // Validate symbol format
    const symbolValidation = validateSymbol(symbol);
    if (!symbolValidation.valid) {
      toast.error(symbolValidation.error || 'Invalid symbol');
      return;
    }

    // Validate interval using whitelist
    if (!VALID_INTERVALS.includes(interval)) {
      toast.error('Invalid interval selected');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-twelvedata', {
        body: {
          symbol: symbolValidation.cleaned,
          interval,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch data');
      }

      if (data.status === 'error') throw new Error(data.message || 'API error');
      if (!data.values || !Array.isArray(data.values)) throw new Error('Invalid response');

      const bars = data.values.reverse();
      const ohlcvLines = bars.map((bar: { datetime: string; open: string; high: string; low: string; close: string }) =>
        `${bar.datetime.replace(' ', '\t')}\t${bar.open}\t${bar.high}\t${bar.low}\t${bar.close}\t1000\t0\t0`
      );

      setOhlcvText(ohlcvLines.join('\n'));

      const lastBar = bars[bars.length - 1];
      const firstBar = bars[0];
      if (lastBar) {
        const closePrice = parseFloat(lastBar.close);
        const openPrice = parseFloat(firstBar.open);

        const displaySymbol = symbolValidation.cleaned.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
        const meta = getInstrumentMeta({ price: closePrice, symbol: displaySymbol });
        setLtp(formatInstrumentPrice(closePrice, { symbol: displaySymbol }));
        setAnchor(formatInstrumentPrice(openPrice, { symbol: displaySymbol }));

        // Set asset info from API
        setCurrentAssetInfo({
          symbol: displaySymbol,
          name: `${symbolValidation.cleaned} (${interval})`,
          source: 'api',
          interval: interval,
          barCount: bars.length,
          dateRange: bars.length > 0 ? {
            start: firstBar.datetime,
            end: lastBar.datetime
          } : undefined,
          instrumentType: meta.type,
          displayPrecision: meta.displayPrecision,
        });
      }

      setValidationStatus({ valid: true, message: `${bars.length} bars fetched from API` });
      toast.success(`Fetched ${bars.length} bars for ${symbol}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Market Inputs (OHLCV Required)
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="ltp" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            LTP (Latest Price)
            {isLtpLocked && (
              <span className="inline-flex items-center gap-1 text-[9px] text-primary">
                <Lock className="w-3 h-3" />
                LOCKED
              </span>
            )}
          </Label>
          <Input
            id="ltp"
            type="number"
            step="any"
            value={ltp}
            onChange={(e) => { setLtp(e.target.value); setIsLtpLocked(false); }}
            className={`font-mono text-lg bg-input border-border ${isLtpLocked ? 'border-primary/50 bg-primary/5' : ''}`}
            placeholder="—"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="anchor" className="text-xs uppercase tracking-wider text-muted-foreground">
            Anchor Price
          </Label>
          <Input id="anchor" type="number" step="any" value={anchor} onChange={(e) => setAnchor(e.target.value)}
            className="font-mono text-lg bg-input border-border" placeholder="—" />
        </div>
      </div>
      {dataSnapshot && isLtpLocked && (
        <p className="text-[9px] text-muted-foreground -mt-3 truncate">
          Data through: {dataSnapshot.timestamp.replace('T', ' ')}
        </p>
      )}

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4 h-9">
          <TabsTrigger value="csv" className="h-9 text-[10px] font-mono uppercase tracking-wider leading-none">MT5 CSV Upload</TabsTrigger>
          <TabsTrigger value="manual" className="h-9 text-[10px] font-mono uppercase tracking-wider leading-none">Manual</TabsTrigger>
          <TabsTrigger value="api" className="h-9 text-[10px] font-mono uppercase tracking-wider leading-none">Live API</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" id="csv-upload" />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Click to upload MT5 CSV</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Format: DATE, TIME, OPEN, HIGH, LOW, CLOSE, TICKVOL
                </p>
                <p className="text-xs text-primary mt-1 font-medium">
                  ⚠️ Open price is MANDATORY
                </p>
              </div>
            </label>
          </div>

          {validationStatus && (
            <div className={`flex items-center gap-2 text-xs p-2 rounded ${validationStatus.valid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
              {validationStatus.valid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {validationStatus.message}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              OHLCV Data (MT5 Tab-Separated or Comma-Separated)
            </Label>
            <Textarea value={ohlcvText} onChange={(e) => { setOhlcvText(e.target.value); setValidationStatus(null); }}
              className="font-mono text-xs bg-input border-border h-40 resize-none"
              placeholder="DATE	TIME	OPEN	HIGH	LOW	CLOSE	TICKVOL" />
            <p className="text-xs text-primary font-medium">⚠️ Open price is MANDATORY for structural integrity</p>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Live API data is fetched through the backend to keep provider credentials off the client.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="font-mono" placeholder="XAU/USD" />
              <select value={interval} onChange={(e) => setInterval(e.target.value)}
                className="h-9 px-3 rounded-md border border-border bg-input text-sm font-mono">
                <option value="15min">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1day">1 Day</option>
              </select>
            </div>
            <Button onClick={handleFetchAPI} disabled={isLoading} variant="outline" className="w-full gap-2">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isLoading ? 'Fetching...' : 'Fetch OHLCV Data'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Button onClick={handleCalculate} className="w-full font-semibold uppercase tracking-wider">
        Analyze Structure
      </Button>
    </div>
  );
}
