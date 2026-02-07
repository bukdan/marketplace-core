import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UmkmPaymentRequest {
  order_id: string;
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { order_id }: UmkmPaymentRequest = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get UMKM order details with items
    const { data: order, error: orderError } = await supabase
      .from('umkm_orders')
      .select(`
        id, order_number, user_id, umkm_id, total_amount, subtotal, shipping_fee,
        status, payment_status, shipping_address, notes,
        items:umkm_order_items(id, product_name, price, quantity),
        umkm:umkm_profiles(umkm_name)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify buyer is the user
    if (order.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to pay this order' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Order already paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique Midtrans order ID
    const midtransOrderId = `UMKM-${Date.now()}-${user.id.slice(0, 8)}`;

    // Get user profile for customer details
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, phone_number')
      .eq('user_id', user.id)
      .single();

    // Build item details for Midtrans
    const itemDetails = (order.items as Array<{ id: string; product_name: string; price: number; quantity: number }>).map(item => ({
      id: item.id,
      price: Math.round(Number(item.price)),
      quantity: item.quantity,
      name: item.product_name.substring(0, 50),
    }));

    // Add shipping fee if any
    if (order.shipping_fee > 0) {
      itemDetails.push({
        id: 'shipping',
        price: Math.round(Number(order.shipping_fee)),
        quantity: 1,
        name: 'Biaya Pengiriman',
      });
    }

    // Create Midtrans Snap transaction
    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(Number(order.total_amount)),
      },
      customer_details: {
        first_name: profile?.name || 'User',
        email: profile?.email || user.email,
        phone: profile?.phone_number || '',
        shipping_address: {
          address: order.shipping_address || '',
        },
      },
      item_details: itemDetails,
      callbacks: {
        finish: `${req.headers.get('origin')}/cart?payment=success&order=${order.order_number}`,
      },
      custom_field1: order.id, // Store actual order ID for webhook
      custom_field2: 'UMKM', // Marker for UMKM order type
    };

    console.log('Creating Midtrans UMKM payment:', midtransOrderId);

    // Call Midtrans Snap API
    const midtransAuth = btoa(`${midtransServerKey}:`);
    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${midtransAuth}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      console.error('Midtrans error:', midtransData);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment', details: midtransData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order with Midtrans order ID for tracking
    await supabase
      .from('umkm_orders')
      .update({ 
        notes: order.notes ? `${order.notes}\nmidtrans_order_id:${midtransOrderId}` : `midtrans_order_id:${midtransOrderId}`,
        payment_status: 'pending',
      })
      .eq('id', order.id);

    // Create payment record
    await supabase
      .from('umkm_payments')
      .insert({
        order_id: order.id,
        amount: order.total_amount,
        payment_method: 'midtrans',
        status: 'pending',
      });

    console.log('Midtrans UMKM payment created:', midtransData.token);

    return new Response(
      JSON.stringify({
        snap_token: midtransData.token,
        redirect_url: midtransData.redirect_url,
        midtrans_order_id: midtransOrderId,
        order_id: order.id,
        order_number: order.order_number,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in create-umkm-payment:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
