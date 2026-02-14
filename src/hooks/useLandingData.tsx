import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  listing_count?: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  price_type: 'fixed' | 'negotiable' | 'auction';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  city: string | null;
  province: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  listing_images: { id: string; image_url: string; is_primary: boolean }[];
  categories: { name: string };
}

interface Auction {
  id: string;
  current_price: number;
  starting_price: number;
  ends_at: string;
  total_bids: number;
  listing: {
    id: string;
    title: string;
    listing_images: { image_url: string; is_primary: boolean }[];
  };
}

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  content: string;
  rating: number;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number | null;
  price: number;
  is_featured: boolean;
}

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  position: 'hero' | 'sidebar' | 'inline' | 'footer';
}

interface PlatformStats {
  total_listings: number;
  total_sellers: number;
  total_categories: number;
  active_auctions: number;
}

export const useLandingData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [latestListings, setLatestListings] = useState<Listing[]>([]);
  const [popularListings, setPopularListings] = useState<Listing[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    total_listings: 0,
    total_sellers: 0,
    total_categories: 0,
    active_auctions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCategories(),
      fetchFeaturedListings(),
      fetchLatestListings(),
      fetchPopularListings(),
      fetchActiveAuctions(),
      fetchTestimonials(),
      fetchCreditPackages(),
      fetchBanners(),
      fetchStats(),
    ]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, icon_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    setCategories(data || []);
  };

  const fetchFeaturedListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`*, listing_images (*), categories!listings_category_id_fkey (name)`)
      .eq('status', 'active')
      .eq('is_featured', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8);
    setFeaturedListings((data as unknown as Listing[]) || []);
  };

  const fetchLatestListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`*, listing_images (*), categories!listings_category_id_fkey (name)`)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8);
    setLatestListings((data as unknown as Listing[]) || []);
  };

  const fetchPopularListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`*, listing_images (*), categories!listings_category_id_fkey (name)`)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(8);
    setPopularListings((data as unknown as Listing[]) || []);
  };

  const fetchActiveAuctions = async () => {
    const { data } = await supabase
      .from('listing_auctions')
      .select(`
        id, current_price, starting_price, ends_at, total_bids,
        listing:listings (id, title, listing_images (*))
      `)
      .eq('status', 'active')
      .order('ends_at', { ascending: true })
      .limit(6);
    setActiveAuctions((data as unknown as Auction[]) || []);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('id, name, role, avatar_url, content, rating')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);
    setTestimonials(data || []);
  };

  const fetchCreditPackages = async () => {
    const { data } = await supabase
      .from('credit_packages')
      .select('id, name, credits, bonus_credits, price, is_featured')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    setCreditPackages(data || []);
  };

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('id, title, image_url, target_url, position')
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .limit(5);
    setBanners(data || []);
  };

  const fetchStats = async () => {
    const { data } = await supabase.rpc('get_platform_stats');
    if (data && data.length > 0) {
      setStats({
        total_listings: Number(data[0].total_listings) || 0,
        total_sellers: Number(data[0].total_sellers) || 0,
        total_categories: Number(data[0].total_categories) || 0,
        active_auctions: Number(data[0].active_auctions) || 0,
      });
    }
  };

  const trackBannerEvent = async (bannerId: string, eventType: 'impression' | 'click') => {
    await supabase.from('banner_events').insert({
      banner_id: bannerId,
      event_type: eventType,
    });
  };

  return {
    categories,
    featuredListings,
    latestListings,
    popularListings,
    activeAuctions,
    testimonials,
    creditPackages,
    banners,
    stats,
    loading,
    trackBannerEvent,
  };
};
