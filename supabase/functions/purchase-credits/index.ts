import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  package_id: string;
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
    const { package_id }: PurchaseRequest = await req.json();

    if (!package_id) {
      return new Response(
        JSON.stringify({ error: 'Package ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get credit package details
    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !creditPackage) {
      console.error('Package error:', packageError);
      return new Response(
        JSON.stringify({ error: 'Credit package not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique order ID
    const orderId = `CREDIT-${Date.now()}-${user.id.slice(0, 8)}`;
    const totalCredits = creditPackage.credits + (creditPackage.bonus_credits || 0);

    // Get user profile for customer details
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, phone_number')
      .eq('user_id', user.id)
      .single();

    // Create Midtrans Snap transaction
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: creditPackage.price,
      },
      customer_details: {
        first_name: profile?.name || 'User',
        email: profile?.email || user.email,
        phone: profile?.phone_number || '',
      },
      item_details: [
        {
          id: creditPackage.id,
          price: creditPackage.price,
          quantity: 1,
          name: `${creditPackage.name} - ${totalCredits} Credits`,
        },
      ],
      custom_field1: 'credit_purchase',
      custom_field2: package_id,
      custom_field3: user.id,
      callbacks: {
        finish: `${req.headers.get('origin')}/credits?purchase=success`,
      },
    };

    console.log('Creating Midtrans transaction for credits:', orderId);

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

    console.log('Midtrans transaction created:', midtransData.token);

    return new Response(
      JSON.stringify({
        snap_token: midtransData.token,
        redirect_url: midtransData.redirect_url,
        order_id: orderId,
        package: {
          name: creditPackage.name,
          credits: creditPackage.credits,
          bonus_credits: creditPackage.bonus_credits,
          total_credits: totalCredits,
          price: creditPackage.price,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in purchase-credits:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
