import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const isUniqueConstraintViolation = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
};

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
        JSON.stringify({ error: 'Unauthorized - please log in' }),
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

    const { currency, network, walletAddress, transactionHash } = await req.json();

    if (!currency || !network || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Defense-in-depth: block reuse of the same transaction hash across accounts/requests.
    if (transactionHash) {
      const { data: existingTx } = await supabase
        .from('payment_requests')
        .select('id, user_id, status')
        .eq('transaction_hash', transactionHash)
        .neq('status', 'rejected')
        .maybeSingle();

      if (existingTx) {
        const message = existingTx.user_id === user.id
          ? 'This transaction hash has already been submitted'
          : 'This transaction hash has already been used for payment verification';
        return new Response(
          JSON.stringify({ error: message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for existing pending payment
    const { data: existingPayment } = await supabase
      .from('payment_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingPayment) {
      // Update existing payment with transaction hash
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          transaction_hash: transactionHash,
          submitted_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id);

      if (updateError) {
        // Unique index violation (hash already used)
        if (isUniqueConstraintViolation(updateError)) {
          return new Response(
            JSON.stringify({ error: 'This transaction hash has already been used' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw updateError;
      }

      return new Response(
        JSON.stringify({ success: true, paymentId: existingPayment.id, updated: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new payment request
    const { data: newPayment, error: insertError } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.id,
        email: user.email || '',
        currency,
        network,
        wallet_address: walletAddress,
        transaction_hash: transactionHash,
        submitted_at: transactionHash ? new Date().toISOString() : null,
        amount: 99
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating payment request:', insertError);
      if (isUniqueConstraintViolation(insertError)) {
        return new Response(
          JSON.stringify({ error: 'This transaction hash has already been used' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    console.log(`Payment request created: ${newPayment.id} for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, paymentId: newPayment.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in submit-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit payment request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
