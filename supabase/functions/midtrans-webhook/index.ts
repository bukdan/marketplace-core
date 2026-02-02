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

    // Parse order ID to determine type
    // Format: TOPUP-{timestamp}-{user_id_prefix}, CREDIT-{timestamp}-{user_id_prefix}, or ORDER-{timestamp}-{user_id_prefix}
    const orderParts = notification.order_id.split('-');
    const orderType = orderParts[0];

    if (orderType !== 'TOPUP' && orderType !== 'CREDIT' && orderType !== 'ORDER') {
      console.log('Unknown order type, ignoring:', orderType);
      return new Response(
        JSON.stringify({ message: 'Unknown order type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount = parseFloat(notification.gross_amount);
    const userIdPrefix = orderParts[2];

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

      console.log('Processing successful payment:', notification.order_id, 'Type:', orderType);

      // Handle TOPUP - wallet balance
      if (orderType === 'TOPUP') {
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
            message: 'Wallet payment processed successfully',
            wallet_id: wallet.id,
            amount: amount,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle CREDIT - credit balance purchase
      if (orderType === 'CREDIT') {
        // Find user_credits with matching user_id prefix
        const { data: allCredits, error: creditsQueryError } = await supabase
          .from('user_credits')
          .select('id, user_id, balance, lifetime_purchased');

        if (creditsQueryError) {
          console.error('Error fetching user_credits:', creditsQueryError);
          throw creditsQueryError;
        }

        const userCredits = allCredits?.find(c => c.user_id.startsWith(userIdPrefix));
        
        if (!userCredits) {
          console.error('User credits not found for order:', notification.order_id);
          return new Response(
            JSON.stringify({ error: 'User credits not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get package info from order metadata (stored in description field)
        // For now, calculate credits based on amount (adjust based on your pricing)
        // Default: 1000 IDR = 1 credit (you can customize this)
        const creditsToAdd = Math.floor(amount / 1000);
        
        // Or lookup from credit_packages table based on price
        const { data: matchingPackage } = await supabase
          .from('credit_packages')
          .select('credits, bonus_credits')
          .eq('price', amount)
          .eq('is_active', true)
          .single();

        let totalCreditsToAdd = creditsToAdd;
        if (matchingPackage) {
          totalCreditsToAdd = matchingPackage.credits + (matchingPackage.bonus_credits || 0);
        }

        // Update user credits balance
        const newBalance = Number(userCredits.balance) + totalCreditsToAdd;
        const newLifetimePurchased = Number(userCredits.lifetime_purchased || 0) + totalCreditsToAdd;

        const { error: updateCreditsError } = await supabase
          .from('user_credits')
          .update({ 
            balance: newBalance,
            lifetime_purchased: newLifetimePurchased,
          })
          .eq('id', userCredits.id);

        if (updateCreditsError) {
          console.error('Error updating user credits:', updateCreditsError);
          throw updateCreditsError;
        }

        // Create credit transaction record
        const { error: creditTxError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: userCredits.user_id,
            type: 'purchase',
            amount: totalCreditsToAdd,
            balance_after: newBalance,
            description: `Pembelian ${totalCreditsToAdd} kredit via ${notification.payment_type}`,
            reference_type: 'purchase',
          });

        if (creditTxError) {
          console.error('Error creating credit transaction:', creditTxError);
          // Non-critical, continue
        }

        console.log('Credits purchased successfully:', {
          user_id: userCredits.user_id,
          credits_added: totalCreditsToAdd,
          new_balance: newBalance,
        });

        return new Response(
          JSON.stringify({ 
            message: 'Credit purchase processed successfully',
            user_id: userCredits.user_id,
            credits_added: totalCreditsToAdd,
            new_balance: newBalance,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle ORDER - order payment
      if (orderType === 'ORDER') {
        // Find order by looking at notes field containing midtrans_order_id
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, buyer_id, seller_id, amount, status')
          .like('notes', `%${notification.order_id}%`);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          throw ordersError;
        }

        const order = orders?.[0];
        
        if (!order) {
          console.error('Order not found for:', notification.order_id);
          return new Response(
            JSON.stringify({ error: 'Order not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update order status to paid
        const { error: updateOrderError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        if (updateOrderError) {
          console.error('Error updating order:', updateOrderError);
          throw updateOrderError;
        }

        // Trigger email notification for paid order
        try {
          await supabase.functions.invoke('send-order-notification', {
            body: { order_id: order.id, notification_type: 'paid' },
          });
          console.log('Order payment notification sent');
        } catch (notifyError) {
          console.error('Failed to send order notification:', notifyError);
          // Non-critical, continue
        }

        console.log('Order payment processed successfully:', {
          order_id: order.id,
          amount: amount,
        });

        return new Response(
          JSON.stringify({ 
            message: 'Order payment processed successfully',
            order_id: order.id,
            amount: amount,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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