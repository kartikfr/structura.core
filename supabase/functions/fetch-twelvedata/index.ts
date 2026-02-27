import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keep this aligned with the frontend whitelist.
const VALID_INTERVALS = new Set(['1min', '5min', '15min', '30min', '1h', '2h', '4h', '8h', '1day', '1week', '1month']);

function validateSymbol(sym: string): { ok: boolean; cleaned?: string; error?: string } {
  const cleaned = sym.replace(/[/\\]/g, '').trim().toUpperCase();
  if (cleaned.length === 0 || cleaned.length > 20) return { ok: false, error: 'Symbol must be 1-20 characters' };
  if (!/^[A-Z0-9._-]+$/i.test(cleaned)) return { ok: false, error: 'Invalid symbol format' };
  return { ok: true, cleaned };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth required (prevents public abuse of our backend API key).
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const symbol = typeof body.symbol === 'string' ? body.symbol : '';
    const interval = typeof body.interval === 'string' ? body.interval : '';

    const symbolValidation = validateSymbol(symbol);
    if (!symbolValidation.ok) {
      return new Response(JSON.stringify({ error: symbolValidation.error ?? 'Invalid symbol' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!VALID_INTERVALS.has(interval)) {
      return new Response(JSON.stringify({ error: 'Invalid interval' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Data provider not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({
      symbol: symbolValidation.cleaned!,
      interval,
      outputsize: '100',
      apikey: apiKey,
    });

    const upstream = await fetch(`https://api.twelvedata.com/time_series?${params.toString()}`);
    const text = await upstream.text();

    // Pass through the upstream status code when possible.
    return new Response(text, {
      status: upstream.ok ? 200 : upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-twelvedata:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
