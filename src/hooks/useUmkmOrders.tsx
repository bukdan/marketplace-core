import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UmkmOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface UmkmOrder {
  id: string;
  user_id: string;
  umkm_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_status: string;
  shipping_address?: string;
  shipping_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: UmkmOrderItem[];
  umkm?: { umkm_name: string };
}

export interface CreateOrderData {
  umkm_id: string;
  items: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
  }[];
  shipping_address: string;
  shipping_method?: string;
  notes?: string;
}

export const useUmkmOrders = (type: 'buyer' | 'seller' = 'buyer', umkmId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['umkm-orders', type, umkmId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('umkm_orders')
        .select(`
          *,
          items:umkm_order_items(*),
          umkm:umkm_profiles(umkm_name)
        `)
        .order('created_at', { ascending: false });

      if (type === 'buyer') {
        query = query.eq('user_id', user.id);
      } else if (umkmId) {
        query = query.eq('umkm_id', umkmId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UmkmOrder[];
    },
    enabled: !!user?.id,
  });

  const createOrder = useMutation({
    mutationFn: async (data: CreateOrderData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingFee = 0; // Can be calculated based on shipping method
      const totalAmount = subtotal + shippingFee;
      const orderNumber = `UMKM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const { data: newOrder, error: orderError } = await supabase
        .from('umkm_orders')
        .insert({
          user_id: user.id,
          umkm_id: data.umkm_id,
          order_number: orderNumber,
          status: 'pending',
          subtotal,
          shipping_fee: shippingFee,
          total_amount: totalAmount,
          payment_status: 'unpaid',
          shipping_address: data.shipping_address,
          shipping_method: data.shipping_method,
          notes: data.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = data.items.map(item => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('umkm_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return newOrder as UmkmOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Pesanan berhasil dibuat!',
        description: 'Silakan lanjutkan pembayaran.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal membuat pesanan',
        description: error.message,
      });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('umkm_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-orders'] });
      toast({
        title: 'Status diperbarui',
        description: 'Status pesanan berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui status',
        description: error.message,
      });
    },
  });

  return {
    orders: orders ?? [],
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
  };
};
