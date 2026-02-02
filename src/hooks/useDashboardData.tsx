import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  walletBalance: number;
  creditsBalance: number;
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  pendingOrders: number;
  unreadMessages: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  view_count: number | null;
  created_at: string;
  listing_images: { image_url: string; is_primary: boolean }[];
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  listing: {
    title: string;
  } | null;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    walletBalance: 0,
    creditsBalance: 0,
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Fetch all data in parallel
      const [
        walletRes,
        creditsRes,
        listingsRes,
        ordersRes,
        transactionsRes,
      ] = await Promise.all([
        supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('listings')
          .select(`
            id, title, price, status, view_count, created_at,
            listing_images(image_url, is_primary)
          `)
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('orders')
          .select(`
            id, amount, status, created_at,
            listing:listings(title)
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('transactions')
          .select('id, type, amount, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      // Count listings
      const { count: totalListingsCount } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      const { count: activeListingsCount } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null);

      // Count orders
      const { count: totalOrdersCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .in('status', ['pending', 'paid']);

      // Count unread messages properly
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      const conversationIds = conversationsData?.map(c => c.id) || [];
      
      let unreadCount = 0;
      if (conversationIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id)
          .in('conversation_id', conversationIds);
        unreadCount = count || 0;
      }

      setStats({
        walletBalance: Number(walletRes.data?.balance || 0),
        creditsBalance: Number(creditsRes.data?.balance || 0),
        totalListings: totalListingsCount || 0,
        activeListings: activeListingsCount || 0,
        totalOrders: totalOrdersCount || 0,
        pendingOrders: pendingOrdersCount || 0,
        unreadMessages: unreadCount,
      });

      setListings(listingsRes.data || []);
      setOrders(ordersRes.data?.map(o => ({
        ...o,
        listing: o.listing as { title: string } | null
      })) || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    stats,
    transactions,
    listings,
    orders,
    loading,
    refetch: fetchData,
  };
}
