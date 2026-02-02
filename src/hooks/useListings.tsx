import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  sort_order: number;
}

interface ListingImage {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

interface Listing {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  price: number;
  price_type: 'fixed' | 'negotiable' | 'auction';
  listing_type: 'sale' | 'rent' | 'service' | 'wanted';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: string;
  city: string | null;
  province: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  listing_images: ListingImage[];
  categories: Category;
}

interface ListingsFilter {
  category_id?: string;
  price_type?: string;
  condition?: string;
  city?: string;
  search?: string;
  sort_by?: 'newest' | 'price_low' | 'price_high' | 'popular';
}

export const useListings = (filters: ListingsFilter = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [filters.category_id, filters.price_type, filters.condition, filters.city, filters.search, filters.sort_by]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('listings')
      .select(`
        *,
        listing_images (*),
        categories (*)
      `)
      .eq('status', 'active')
      .is('deleted_at', null);

    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.price_type) {
      query = query.eq('price_type', filters.price_type as 'fixed' | 'negotiable' | 'auction');
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition as 'new' | 'like_new' | 'good' | 'fair');
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.limit(50);

    const { data, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching listings:', queryError);
      setError(queryError.message);
    } else {
      setListings((data as unknown as Listing[]) || []);
    }
    setLoading(false);
  };

  return {
    listings,
    categories,
    loading,
    error,
    refetchListings: fetchListings,
  };
};
