import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingReports: number;
  pendingKyc: number;
}

interface UserData {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  role?: string;
}

interface ListingData {
  id: string;
  title: string;
  price: number;
  status: string;
  user_id: string;
  created_at: string;
  user?: { name: string | null; email: string | null };
}

interface ReportData {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  listing_id: string;
  reporter_id: string;
  listing?: { title: string };
}

export function useAdminData() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReports: 0,
    pendingKyc: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);

  const checkAdminRole = async () => {
    if (!user) return false;
    
    const { data } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    return data === true;
  };

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const adminCheck = await checkAdminRole();
      setIsAdmin(adminCheck);

      if (!adminCheck) {
        setLoading(false);
        return;
      }

      // Fetch stats in parallel
      const [
        usersCount,
        listingsCount,
        activeListingsCount,
        pendingListingsCount,
        ordersData,
        reportsCount,
        kycCount,
        usersData,
        listingsData,
        reportsData,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review').is('deleted_at', null),
        supabase.from('orders').select('amount'),
        supabase.from('listing_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('kyc_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('listings').select('id, title, price, status, user_id, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(50),
        supabase.from('listing_reports').select('id, reason, description, status, created_at, listing_id, reporter_id, listing:listings(title)').order('created_at', { ascending: false }).limit(50),
      ]);

      const totalRevenue = ordersData.data?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

      setStats({
        totalUsers: usersCount.count || 0,
        totalListings: listingsCount.count || 0,
        activeListings: activeListingsCount.count || 0,
        pendingListings: pendingListingsCount.count || 0,
        totalOrders: ordersData.data?.length || 0,
        totalRevenue,
        pendingReports: reportsCount.count || 0,
        pendingKyc: kycCount.count || 0,
      });

      setUsers(usersData.data || []);
      setListings(listingsData.data || []);
      setReports(reportsData.data?.map(r => ({
        ...r,
        listing: r.listing as { title: string } | undefined
      })) || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, status: string, rejectionReason?: string) => {
    const update: any = { status };
    if (rejectionReason) {
      update.rejection_reason = rejectionReason;
    }
    if (status === 'active') {
      update.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('listings')
      .update(update)
      .eq('id', listingId);

    if (!error) {
      await fetchAdminData();
    }
    return { error };
  };

  const updateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed') => {
    const { error } = await supabase
      .from('listing_reports')
      .update({ 
        status, 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id 
      })
      .eq('id', reportId);

    if (!error) {
      await fetchAdminData();
    }
    return { error };
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('user_id', userId);

    if (!error) {
      await fetchAdminData();
    }
    return { error };
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  return {
    isAdmin,
    stats,
    users,
    listings,
    reports,
    loading,
    updateListingStatus,
    updateReportStatus,
    toggleUserStatus,
    refetch: fetchAdminData,
  };
}
