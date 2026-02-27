import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication to prevent public enumeration of business payment infrastructure.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const usdcAddress = Deno.env.get('USDC_WALLET_ADDRESS');
    const usdtAddress = Deno.env.get('USDT_WALLET_ADDRESS');

    console.log('Fetching wallet addresses for crypto payments');

    if (!usdcAddress && !usdtAddress) {
      console.error('No wallet addresses configured');
      return new Response(
        JSON.stringify({ error: 'Payment addresses not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const wallets = [];

    if (usdcAddress) {
      wallets.push({
        currency: 'USDC',
        network: 'Ethereum (ERC20)',
        address: usdcAddress,
        amount: 99
      });
    }

    if (usdtAddress) {
      wallets.push({
        currency: 'USDT',
        network: 'Tron (TRC20)',
        address: usdtAddress,
        amount: 99
      });
    }

    console.log(`Returning ${wallets.length} wallet address(es)`);

    return new Response(
      JSON.stringify({ wallets }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching wallet addresses:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch payment addresses' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
