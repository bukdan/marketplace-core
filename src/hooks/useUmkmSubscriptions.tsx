import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUmkmProfile } from '@/hooks/useUmkmProfile';

export interface UmkmSubscription {
  id: string;
  umkm_id: string | null;
  plan: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
}

export const useUmkmSubscriptions = () => {
  const { user } = useAuth();
  const { profile } = useUmkmProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['umkm-subscription', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data, error } = await supabase
        .from('umkm_subscriptions')
        .select('*')
        .eq('umkm_id', profile.id)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      return data as UmkmSubscription | null;
    },
    enabled: !!profile?.id,
  });

  const subscribe = useMutation({
    mutationFn: async (plan: string) => {
      if (!profile?.id) throw new Error('UMKM profile required');
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase
        .from('umkm_subscriptions')
        .insert({
          umkm_id: profile.id,
          plan,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-subscription'] });
      toast({ title: 'Berhasil!', description: 'Langganan berhasil diaktifkan.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    },
  });

  return { subscription, isLoading, subscribe };
};
