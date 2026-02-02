import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useBuyNow = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const buyNow = async (
    listingId: string,
    sellerId: string,
    amount: number,
    auctionId?: string
  ) => {
    if (!user) {
      toast({ 
        title: 'Login diperlukan', 
        description: 'Silakan login untuk membeli barang',
      });
      navigate('/auth');
      return null;
    }

    if (user.id === sellerId) {
      toast({
        title: 'Tidak dapat membeli',
        description: 'Anda tidak dapat membeli barang sendiri',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          listing_id: listingId,
          auction_id: auctionId || null,
          buyer_id: user.id,
          seller_id: sellerId,
          amount: amount,
          platform_fee: Math.floor(amount * 0.05), // 5% platform fee
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      toast({
        title: 'Order berhasil dibuat!',
        description: 'Silakan lanjutkan pembayaran',
      });

      // Navigate to orders page to complete payment
      navigate('/orders?new_order=' + order.id);

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Gagal membuat order',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    buyNow,
    loading,
  };
};
