import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotificationRequest {
  order_id: string;
  notification_type: 'paid' | 'shipped' | 'delivered' | 'completed';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id, notification_type }: OrderNotificationRequest = await req.json();

    if (!order_id || !notification_type) {
      return new Response(
        JSON.stringify({ error: 'order_id and notification_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending order notification:', { order_id, notification_type });

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, amount, status, tracking_number,
        listing:listings(title),
        buyer_id, seller_id
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch buyer and seller profiles
    const [buyerRes, sellerRes] = await Promise.all([
      supabase.from('profiles').select('name, email').eq('user_id', order.buyer_id).single(),
      supabase.from('profiles').select('name, email').eq('user_id', order.seller_id).single(),
    ]);

    const buyer = buyerRes.data;
    const seller = sellerRes.data;
    const listingTitle = (order.listing as { title?: string })?.title || 'Produk';

    // Format amount
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(order.amount);

    // Determine notification content based on type
    let subject = '';
    let buyerMessage = '';
    let sellerMessage = '';

    switch (notification_type) {
      case 'paid':
        subject = `Pembayaran Berhasil - ${listingTitle}`;
        buyerMessage = `Terima kasih! Pembayaran Anda sebesar ${formattedAmount} untuk "${listingTitle}" telah berhasil. Penjual akan segera memproses pesanan Anda.`;
        sellerMessage = `Kabar baik! Pembeli telah membayar ${formattedAmount} untuk "${listingTitle}". Silakan segera kirim barang dan update nomor resi.`;
        break;
      case 'shipped':
        subject = `Pesanan Dikirim - ${listingTitle}`;
        buyerMessage = `Pesanan Anda "${listingTitle}" telah dikirim! ${order.tracking_number ? `Nomor resi: ${order.tracking_number}` : 'Tunggu update nomor resi dari penjual.'}`;
        sellerMessage = `Anda telah mengirim pesanan "${listingTitle}". Pembeli akan menerima notifikasi.`;
        break;
      case 'delivered':
        subject = `Pesanan Diterima - ${listingTitle}`;
        buyerMessage = `Pesanan "${listingTitle}" telah diterima. Terima kasih telah berbelanja!`;
        sellerMessage = `Pembeli telah menerima pesanan "${listingTitle}". Transaksi berhasil!`;
        break;
      case 'completed':
        subject = `Transaksi Selesai - ${listingTitle}`;
        buyerMessage = `Transaksi untuk "${listingTitle}" telah selesai. Terima kasih!`;
        sellerMessage = `Transaksi untuk "${listingTitle}" telah selesai. Dana akan segera ditransfer ke wallet Anda.`;
        break;
    }

    // Log notification (in production, you would send actual emails here)
    console.log('Notification to send:', {
      buyer_email: buyer?.email,
      seller_email: seller?.email,
      subject,
      buyer_message: buyerMessage,
      seller_message: sellerMessage,
    });

    // For now, we'll just log the notification
    // To enable actual email sending, integrate with Resend or another email provider
    // and add RESEND_API_KEY secret

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification logged successfully',
        notifications: {
          buyer: { email: buyer?.email, subject, message: buyerMessage },
          seller: { email: seller?.email, subject, message: sellerMessage },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-order-notification:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
