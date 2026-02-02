import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const payOrder = async (orderId: string, onSuccess?: () => void) => {
    setLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('Please login first');
      }

      // Call edge function to create payment
      const { data, error } = await supabase.functions.invoke('create-order-payment', {
        body: { order_id: orderId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.snap_token) {
        throw new Error('Failed to get payment token');
      }

      // Open Midtrans Snap popup
      window.snap.pay(data.snap_token, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          toast({ title: 'Pembayaran berhasil!' });
          onSuccess?.();
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          toast({ 
            title: 'Menunggu pembayaran',
            description: 'Silakan selesaikan pembayaran Anda',
          });
        },
        onError: (result) => {
          console.error('Payment error:', result);
          toast({ 
            title: 'Pembayaran gagal',
            variant: 'destructive',
          });
        },
        onClose: () => {
          console.log('Payment popup closed');
        },
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Gagal memulai pembayaran',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    payOrder,
    loading,
  };
};
