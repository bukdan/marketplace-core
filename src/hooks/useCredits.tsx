import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserCredits {
  id: string;
  balance: number;
  lifetime_purchased: number;
  lifetime_used: number;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus_credits: number;
  is_featured: boolean;
  sort_order: number;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCredits();
      fetchPackages();
    } else {
      setCredits(null);
      setLoading(false);
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching credits:', error);
    } else {
      setCredits(data);
    }
    setLoading(false);
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
    } else {
      setPackages(data || []);
    }
  };

  const purchaseCredits = async (packageId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('Not authenticated');
    }

    const response = await supabase.functions.invoke('purchase-credits', {
      body: { package_id: packageId },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  };

  return {
    credits,
    packages,
    loading,
    purchaseCredits,
    refetchCredits: fetchCredits,
  };
};
