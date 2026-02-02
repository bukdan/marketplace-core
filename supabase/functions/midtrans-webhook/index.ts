import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.224.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const notification: MidtransNotification = await req.json();
    
    console.log('Received Midtrans notification:', {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      status_code: notification.status_code,
    });

    // Verify signature
    const signatureData = `${notification.order_id}${notification.status_code}${notification.gross_amount}${midtransServerKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureData);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const expectedSignature = encodeHex(new Uint8Array(hashBuffer));

    if (notification.signature_key !== expectedSignature) {
      console.error('Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse order ID to get user ID
    // Format: TOPUP-{timestamp}-{user_id_prefix}
    const orderParts = notification.order_id.split('-');
    if (orderParts[0] !== 'TOPUP' || orderParts.length < 3) {
      console.log('Not a topup order, ignoring');
      return new Response(
        JSON.stringify({ message: 'Not a topup order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount = parseFloat(notification.gross_amount);

    // Handle different transaction statuses
    if (
      notification.transaction_status === 'capture' ||
      notification.transaction_status === 'settlement'
    ) {
      // Only process if fraud_status is not 'challenge'
      if (notification.fraud_status === 'challenge') {
        console.log('Transaction is challenged, waiting for review');
        return new Response(
          JSON.stringify({ message: 'Transaction under review' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Processing successful payment:', notification.order_id);

      // Find the wallet by order_id pattern (get user from profiles)
      const userIdPrefix = orderParts[2];
      
      // Get all users and find matching one
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('id, user_id, balance')
        .eq('status', 'active');

      if (walletsError) {
        console.error('Error fetching wallets:', walletsError);
        throw walletsError;
      }

      // Find wallet with matching user_id prefix
      const wallet = wallets?.find(w => w.user_id.startsWith(userIdPrefix));
      
      if (!wallet) {
        console.error('Wallet not found for order:', notification.order_id);
        return new Response(
          JSON.stringify({ error: 'Wallet not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update wallet balance
      const newBalance = Number(wallet.balance) + amount;
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Error updating wallet:', updateError);
        throw updateError;
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: wallet.user_id,
          wallet_id: wallet.id,
          type: 'credit',
          amount: amount,
          description: `Topup via ${notification.payment_type}`,
          reference_type: 'topup',
          reference_id: null,
        });

      if (txError) {
        console.error('Error creating transaction:', txError);
        throw txError;
      }

      console.log('Wallet topped up successfully:', {
        wallet_id: wallet.id,
        amount: amount,
        new_balance: newBalance,
      });

      return new Response(
        JSON.stringify({ 
          message: 'Payment processed successfully',
          wallet_id: wallet.id,
          amount: amount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (
      notification.transaction_status === 'cancel' ||
      notification.transaction_status === 'deny' ||
      notification.transaction_status === 'expire'
    ) {
      console.log('Payment failed or expired:', notification.order_id, notification.transaction_status);
      
      return new Response(
        JSON.stringify({ message: 'Payment cancelled/expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (notification.transaction_status === 'pending') {
      console.log('Payment pending:', notification.order_id);
      
      return new Response(
        JSON.stringify({ message: 'Payment pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Notification received' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in midtrans-webhook:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
