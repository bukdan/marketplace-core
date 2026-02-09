import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KycVerification {
  id: string;
  user_id: string;
  ktp_number: string | null;
  ktp_image_url: string | null;
  selfie_image_url: string | null;
  status: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string | null;
}

export const useKyc = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['kyc', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as KycVerification | null;
    },
    enabled: !!user?.id,
  });

  const submitKyc = useMutation({
    mutationFn: async (data: { ktp_number: string; ktp_image_url: string; selfie_image_url: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      if (kyc) {
        // Update existing
        const { error } = await supabase
          .from('kyc_verifications')
          .update({
            ...data,
            status: 'pending',
            submitted_at: new Date().toISOString(),
            rejection_reason: null,
          })
          .eq('id', kyc.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('kyc_verifications')
          .insert({
            user_id: user.id,
            ...data,
            status: 'pending',
            submitted_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      toast({ title: 'KYC Terkirim!', description: 'Dokumen Anda sedang dalam proses verifikasi.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    },
  });

  return { kyc, isLoading, submitKyc };
};
