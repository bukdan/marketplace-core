import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Crown, Sparkles } from 'lucide-react';

interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
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
  listing_images: ListingImage[];
  categories: { name: string };
}

interface PremiumListingsSectionProps {
  listings: Listing[];
  highlightedIds?: Set<string>;
}

export const PremiumListingsSection = ({ listings, highlightedIds }: PremiumListingsSectionProps) => {
  const navigate = useNavigate();

  if (listings.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-primary/5 to-background py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-primary" />
          <GradientHeading className="text-lg font-bold">Iklan Premium</GradientHeading>
          <Badge className="bg-gradient-to-r from-primary to-primary/80 border-0 text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            Boosted
          </Badge>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => navigate(`/marketplace/${listing.id}`)}
              isHighlighted={highlightedIds?.has(listing.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
