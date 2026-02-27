import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TronTransferEvent {
  event_name?: string;
  contract_address?: string;
  result?: {
    to?: string;
    value?: string | number;
  };
}

interface EthReceiptLog {
  address?: string;
  topics?: string[];
  data?: string;
}

// TronGrid API for TRC20 (USDT) - Free, no API key needed
async function verifyTronTransaction(txHash: string, expectedAddress: string, expectedAmount: number): Promise<{ verified: boolean; message: string }> {
  try {
    console.log(`Verifying Tron transaction: ${txHash}`);

    // Prefer events API so we can validate BOTH recipient and amount.
    const expectedSun = BigInt(Math.round(Number(expectedAmount) * 1_000_000)); // USDT has 6 decimals on Tron
    const usdtContractBase58 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

    const eventsRes = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}/events`);
    if (eventsRes.ok) {
      const eventsJson = await eventsRes.json() as { data?: TronTransferEvent[] };
      const events: TronTransferEvent[] = eventsJson?.data ?? [];

      for (const evt of events) {
        const eventName = evt?.event_name;
        const result = evt?.result;

        const contractAddress = evt?.contract_address;
        const contractMatches =
          contractAddress === usdtContractBase58 ||
          (typeof contractAddress === 'string' && contractAddress.includes(usdtContractBase58.slice(2)));

        if (eventName === 'Transfer' && contractMatches) {
          const to = result?.to;
          const valueRaw = result?.value;
          if (!to || valueRaw == null) continue;

          if (String(to) !== String(expectedAddress)) {
            continue;
          }

          // value is in token's smallest unit (6 decimals for USDT)
          const valueSun = BigInt(String(valueRaw));
          if (valueSun !== expectedSun) {
            const got = Number(valueSun) / 1_000_000;
            return {
              verified: false,
              message: `Amount mismatch: expected ${Number(expectedAmount).toFixed(2)}, got ${got.toFixed(2)}`,
            };
          }

          return { verified: true, message: `TRC20 USDT verified: $${Number(expectedAmount).toFixed(2)}` };
        }
      }
    }

    const response = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}`);

    if (!response.ok) {
      return { verified: false, message: 'Transaction not found on Tron network' };
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return { verified: false, message: 'Transaction data not available' };
    }

    const tx = data.data[0];

    // Check if transaction is confirmed
    if (!tx.ret || tx.ret[0]?.contractRet !== 'SUCCESS') {
      return { verified: false, message: 'Transaction not confirmed or failed' };
    }

    // Fallback: Without event decoding we cannot safely validate amount + recipient.
    return { verified: false, message: 'Unable to verify TRC20 transfer amount/recipient' };
  } catch (error) {
    console.error('Tron verification error:', error);
    return { verified: false, message: 'Error checking Tron network' };
  }
}

// Public Ethereum RPC for ERC20 (USDC) verification
async function verifyEthereumTransaction(txHash: string, expectedAddress: string, expectedAmount: number): Promise<{ verified: boolean; message: string }> {
  try {
    console.log(`Verifying Ethereum transaction: ${txHash}`);

    // Use public Cloudflare Ethereum RPC
    const response = await fetch('https://cloudflare-eth.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      })
    });

    if (!response.ok) {
      return { verified: false, message: 'Failed to query Ethereum network' };
    }

    const data = await response.json();

    if (!data.result) {
      return { verified: false, message: 'Transaction not found or pending' };
    }

    const receipt = data.result;

    // Check if transaction was successful
    if (receipt.status !== '0x1') {
      return { verified: false, message: 'Transaction failed' };
    }

    // USDC contract address on Ethereum mainnet
    const usdcContract = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'.toLowerCase();
    const transferTopic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const expectedUnits = BigInt(Math.round(Number(expectedAmount) * 1_000_000)); // USDC has 6 decimals

    // Check logs for USDC transfer
    const transferLogs = (receipt.logs as EthReceiptLog[] | undefined)?.filter((log) =>
      log.address?.toLowerCase() === usdcContract
    );

    if (transferLogs && transferLogs.length > 0) {
      // Check if any log is a transfer to our address
      for (const log of transferLogs) {
        if (log.topics && log.topics.length >= 3) {
          // Ensure it's an ERC20 Transfer event
          if (String(log.topics[0]).toLowerCase() !== transferTopic0) continue;

          // ERC20 Transfer event: topics[2] is the 'to' address
          const toAddress = '0x' + log.topics[2].slice(26).toLowerCase();
          if (toAddress.toLowerCase() === expectedAddress.toLowerCase()) {
            // Validate amount (data is uint256)
            const amountUnits = BigInt(log.data);
            if (amountUnits !== expectedUnits) {
              const got = Number(amountUnits) / 1_000_000;
              return {
                verified: false,
                message: `Amount mismatch: expected ${Number(expectedAmount).toFixed(2)}, got ${got.toFixed(2)}`,
              };
            }

            return { verified: true, message: `ERC20 USDC verified: $${Number(expectedAmount).toFixed(2)}` };
          }
        }
      }
    }

    return { verified: false, message: 'Could not verify as USDC transfer to expected address' };
  } catch (error) {
    console.error('Ethereum verification error:', error);
    return { verified: false, message: 'Error checking Ethereum network' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: isAdmin } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the payment request
    const { data: payment, error: fetchError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payment.transaction_hash) {
      return new Response(
        JSON.stringify({ verified: false, message: 'No transaction hash provided' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which network to verify on
    const network = payment.network.toLowerCase();
    let result: { verified: boolean; message: string };

    if (network.includes('tron') || network.includes('trc') || payment.currency === 'USDT') {
      result = await verifyTronTransaction(
        payment.transaction_hash,
        payment.wallet_address,
        payment.amount
      );
    } else {
      result = await verifyEthereumTransaction(
        payment.transaction_hash,
        payment.wallet_address,
        payment.amount
      );
    }

    console.log(`Auto-verify result for ${paymentId}:`, result);

    // If verified, update payment and upgrade user
    if (result.verified) {
      // Prevent hash reuse: if this tx hash already verified for another request, refuse.
      if (payment.transaction_hash) {
        const { data: otherVerified } = await supabase
          .from('payment_requests')
          .select('id, user_id')
          .eq('transaction_hash', payment.transaction_hash)
          .eq('status', 'verified')
          .neq('id', paymentId)
          .maybeSingle();

        if (otherVerified) {
          return new Response(
            JSON.stringify({ verified: false, message: 'Transaction hash already used for another verified payment' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          notes: `Auto-verified: ${result.message}`
        })
        .eq('id', paymentId);

      if (!updateError) {
        // Upgrade user to premium
        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            purchased_at: new Date().toISOString()
          })
          .eq('user_id', payment.user_id);
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-verify-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
