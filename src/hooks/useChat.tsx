import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startConversation = async (sellerId: string, listingId: string) => {
    if (!user) {
      toast({
        title: 'Login diperlukan',
        description: 'Silakan login untuk mengirim pesan',
        variant: 'destructive',
      });
      navigate('/auth');
      return null;
    }

    if (user.id === sellerId) {
      toast({
        title: 'Tidak bisa chat',
        description: 'Anda tidak bisa chat dengan diri sendiri',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      if (existing) {
        navigate(`/messages?conversation=${existing.id}`);
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select('id')
        .single();

      if (error) throw error;

      navigate(`/messages?conversation=${newConv.id}`);
      return newConv.id;
    } catch (error) {
      toast({
        title: 'Gagal memulai chat',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    startConversation,
    loading,
  };
};
