import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UmkmProfile {
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
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUmkmProfileData {
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
  latitude?: number;
  longitude?: number;
}

export const useUmkmProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['umkm-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('umkm_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UmkmProfile | null;
    },
    enabled: !!user?.id,
  });

  const createProfile = useMutation({
    mutationFn: async (data: CreateUmkmProfileData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: newProfile, error } = await supabase
        .from('umkm_profiles')
        .insert({
          owner_id: user.id,
          ...data,
        })
        .select()
        .single();
      
      if (error) throw error;
      return newProfile as UmkmProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-profile'] });
      toast({
        title: 'Berhasil!',
        description: 'Profil UMKM berhasil dibuat.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal membuat profil',
        description: error.message,
      });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<CreateUmkmProfileData> & { id: string }) => {
      const { id, ...updateData } = data;
      
      const { data: updated, error } = await supabase
        .from('umkm_profiles')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated as UmkmProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['umkm-profile'] });
      toast({
        title: 'Berhasil!',
        description: 'Profil UMKM berhasil diperbarui.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui profil',
        description: error.message,
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    hasProfile: !!profile,
    createProfile,
    updateProfile,
  };
};
