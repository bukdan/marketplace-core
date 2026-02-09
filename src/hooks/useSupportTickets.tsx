import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useSupportTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user?.id,
  });

  const createTicket = useMutation({
    mutationFn: async (data: { subject: string; message: string; priority?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('support_tickets')
        .insert({ user_id: user.id, ...data });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({ title: 'Tiket Terkirim!', description: 'Tim kami akan segera menindaklanjuti.' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    },
  });

  return { tickets: tickets ?? [], isLoading, createTicket };
};
