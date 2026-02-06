import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  umkm_id: string;
  category_id?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  is_service: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface CreateProductData {
  umkm_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  sku?: string;
  is_service?: boolean;
  status?: string;
}

export const useUmkmProducts = (umkmId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['umkm-products', umkmId],
    queryFn: async () => {
      if (!umkmId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .eq('umkm_id', umkmId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!umkmId,
  });

  const createProduct = useMutation({
    mutationFn: async (data: CreateProductData) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          ...data,
          slug,
          stock: data.stock ?? 0,
          is_service: data.is_service ?? false,
          status: data.status ?? 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      return newProduct as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-products'] });
      toast({
        title: 'Berhasil!',
        description: 'Produk berhasil ditambahkan.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal menambah produk',
        description: error.message,
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (data: Partial<CreateProductData> & { id: string }) => {
      const { id, ...updateData } = data;
      
      const { data: updated, error } = await supabase
        .from('products')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-products'] });
      toast({
        title: 'Berhasil!',
        description: 'Produk berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui produk',
        description: error.message,
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-products'] });
      toast({
        title: 'Berhasil!',
        description: 'Produk berhasil dihapus.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus produk',
        description: error.message,
      });
    },
  });

  return {
    products: products ?? [],
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

// Hook for fetching all public products
export const usePublicProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['public-products', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          umkm:umkm_profiles(id, umkm_name, brand_name, logo_url, city, province)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
