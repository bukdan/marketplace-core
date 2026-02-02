import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useWishlist = (listingId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkIfSaved = useCallback(async () => {
    if (!user || !listingId) return;
    
    const { data } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    
    setIsSaved(!!data);
  }, [user, listingId]);

  const toggleSave = useCallback(async () => {
    if (!user) {
      toast({ 
        title: 'Login diperlukan', 
        description: 'Silakan login untuk menyimpan iklan ke wishlist' 
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    
    try {
      if (isSaved) {
        await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
        
        setIsSaved(false);
        toast({ 
          title: '❌ Dihapus dari wishlist',
          description: 'Iklan telah dihapus dari daftar simpan Anda'
        });
      } else {
        await supabase
          .from('saved_listings')
          .insert({ user_id: user.id, listing_id: listingId });
        
        setIsSaved(true);
        toast({ 
          title: '❤️ Disimpan ke wishlist',
          description: 'Iklan telah ditambahkan ke daftar simpan Anda'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, listingId, isSaved, toast, navigate]);

  return {
    isSaved,
    loading,
    toggleSave,
    checkIfSaved,
  };
};
