import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UmkmStoreData {
  id: string;
  owner_id: string;
  umkm_name: string;
  brand_name?: string;
  description?: string;
  category_id?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_verified: boolean;
  created_at: string;
  products?: StoreProduct[];
  category?: { name: string; slug: string } | null;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  is_service: boolean;
  status: string;
  created_at: string;
  images?: { id: string; image_url: string; is_primary: boolean }[];
}

// Fetch single UMKM store by ID
export const useUmkmStore = (umkmId?: string) => {
  return useQuery({
    queryKey: ['umkm-store', umkmId],
    queryFn: async () => {
      if (!umkmId) return null;
      
      const { data, error } = await supabase
        .from('umkm_profiles')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('id', umkmId)
        .single();
      
      if (error) throw error;
      return data as UmkmStoreData;
    },
    enabled: !!umkmId,
  });
};

// Fetch products for a specific UMKM store
export const useUmkmStoreProducts = (umkmId?: string) => {
  return useQuery({
    queryKey: ['umkm-store-products', umkmId],
    queryFn: async () => {
      if (!umkmId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(id, image_url, is_primary, sort_order)
        `)
        .eq('umkm_id', umkmId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StoreProduct[];
    },
    enabled: !!umkmId,
  });
};

// Fetch all active UMKM stores for listing
export const useUmkmStores = (categoryId?: string) => {
  return useQuery({
    queryKey: ['umkm-stores', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('umkm_profiles')
        .select(`
          id,
          umkm_name,
          brand_name,
          description,
          logo_url,
          banner_url,
          city,
          province,
          is_verified,
          category:categories(name, slug)
        `)
        .order('created_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get product counts for each store
      const storesWithCounts = await Promise.all(
        (data || []).map(async (store) => {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('umkm_id', store.id)
            .eq('status', 'active');
          
          return { ...store, productCount: count || 0 };
        })
      );
      
      return storesWithCounts;
    },
  });
};
