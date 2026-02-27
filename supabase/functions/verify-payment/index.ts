import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin
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

    const { paymentId, approve } = await req.json();

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

    const newStatus = approve ? 'verified' : 'rejected';

    // Prevent reuse: do not allow approving a tx hash that is already verified elsewhere.
    if (approve && payment.transaction_hash) {
      const { data: otherVerified } = await supabase
        .from('payment_requests')
        .select('id')
        .eq('transaction_hash', payment.transaction_hash)
        .eq('status', 'verified')
        .neq('id', paymentId)
        .maybeSingle();

      if (otherVerified) {
        return new Response(
          JSON.stringify({ error: 'Transaction hash already used for another verified payment' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: newStatus,
        verified_at: new Date().toISOString(),
        verified_by: user.id
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    // If approved, upgrade user to premium
    if (approve) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          purchased_at: new Date().toISOString()
        })
        .eq('user_id', payment.user_id);

      if (profileError) {
        console.error('Error upgrading user:', profileError);
        // Don't fail the whole operation, but log it
      }
    }

    console.log(`Payment ${paymentId} ${newStatus} by admin ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
