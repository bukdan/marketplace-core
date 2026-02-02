import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Order {
  id: string;
  listing_id: string;
  auction_id: string | null;
  buyer_id: string;
  seller_id: string;
  amount: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  shipping_address: string | null;
  shipping_method: string | null;
  tracking_number: string | null;
  notes: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  listing?: {
    title: string;
    listing_images: { image_url: string }[];
  };
  buyer?: {
    name: string | null;
    phone_number: string | null;
  };
  seller?: {
    name: string | null;
    phone_number: string | null;
  };
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const buyingOrders = orders.filter(o => o.buyer_id === user?.id);
  const sellingOrders = orders.filter(o => o.seller_id === user?.id);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        listing:listings(title, listing_images(image_url))
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      // Enrich with buyer/seller profiles
      const enriched = await Promise.all((data || []).map(async (order) => {
        const [buyerRes, sellerRes] = await Promise.all([
          supabase.from('profiles').select('name, phone_number').eq('user_id', order.buyer_id).single(),
          supabase.from('profiles').select('name, phone_number').eq('user_id', order.seller_id).single(),
        ]);
        
        return {
          ...order,
          buyer: buyerRes.data,
          seller: sellerRes.data,
        };
      }));
      
      setOrders(enriched as Order[]);
    }
    
    setLoading(false);
  };

  const createOrder = async (data: {
    listing_id: string;
    auction_id?: string;
    seller_id: string;
    amount: number;
    platform_fee?: number;
  }) => {
    if (!user) throw new Error('Not authenticated');

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        listing_id: data.listing_id,
        auction_id: data.auction_id || null,
        buyer_id: user.id,
        seller_id: data.seller_id,
        amount: data.amount,
        platform_fee: data.platform_fee || 0,
      })
      .select()
      .single();

    if (error) throw error;
    
    fetchOrders();
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, unknown> = { status };
      
      // Add tracking number if provided
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
      
      // Set timestamps based on status
      if (status === 'paid') updateData.paid_at = new Date().toISOString();
      if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
      if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
      if (status === 'completed') updateData.completed_at = new Date().toISOString();
      if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      
      // Send notification for shipped/delivered/completed status
      if (['shipped', 'delivered', 'completed'].includes(status)) {
        try {
          await supabase.functions.invoke('send-order-notification', {
            body: { order_id: orderId, notification_type: status },
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
        }
      }
      
      fetchOrders();
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    orders,
    buyingOrders,
    sellingOrders,
    loading,
    isUpdating,
    createOrder,
    updateOrderStatus,
    refetchOrders: fetchOrders,
  };
};
