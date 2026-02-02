import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface RelatedListing {
  id: string;
  title: string;
  price: number;
  price_type: 'fixed' | 'negotiable' | 'auction';
  condition: 'new' | 'like_new' | 'good' | 'fair' | null;
  status?: string;
  city: string | null;
  province: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  listing_images: ListingImage[];
  categories: { name: string } | null;
}

interface RelatedProductsProps {
  categoryId: string;
  currentListingId: string;
  categoryName: string;
}

export const RelatedProducts = ({ 
  categoryId, 
  currentListingId, 
  categoryName 
}: RelatedProductsProps) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<RelatedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [categoryId, currentListingId]);

  const fetchRelatedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id, title, price, price_type, condition, status,
          city, province, view_count, is_featured, created_at,
          listing_images(id, image_url, is_primary),
          categories(name)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .neq('id', currentListingId)
        .is('deleted_at', null)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setListings((data as unknown as RelatedListing[]) || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Produk Serupa</h2>
            <p className="text-sm text-muted-foreground">
              Dalam kategori {categoryName}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="gap-1 group"
          onClick={() => navigate(`/marketplace?category=${categoryId}`)}
        >
          Lihat Semua
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map((listing, index) => (
          <div 
            key={listing.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
};