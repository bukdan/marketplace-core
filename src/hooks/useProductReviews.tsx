import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ProductReview {
  id: string;
  product_id: string | null;
  user_id: string;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile?: { name: string | null; avatar_url: string | null };
}

export const useProductReviews = (productId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profile names separately to avoid FK issues
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? []);
      return data.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      })) as ProductReview[];
    },
    enabled: !!productId,
  });

  const addReview = useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('product_reviews')
        .insert({ product_id: productId, user_id: user.id, rating, comment });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      toast({ title: 'Berhasil!', description: 'Review berhasil ditambahkan.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from('product_reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      toast({ title: 'Review dihapus.' });
    },
  });

  return { reviews: reviews ?? [], isLoading, addReview, deleteReview };
};
