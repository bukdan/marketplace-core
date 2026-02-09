import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  status: string | null;
  notes: string | null;
  processed_at: string | null;
  created_at: string | null;
}

export interface CreateWithdrawalData {
  wallet_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
}

export const useWithdrawals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Withdrawal[];
    },
    enabled: !!user?.id,
  });

  const createWithdrawal = useMutation({
    mutationFn: async (data: CreateWithdrawalData) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data: result, error } = await supabase
        .from('withdrawals')
        .insert({ ...data, user_id: user.id, status: 'pending' })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast({ title: 'Berhasil!', description: 'Permintaan penarikan telah diajukan.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    },
  });

  return { withdrawals: withdrawals ?? [], isLoading, createWithdrawal };
};
