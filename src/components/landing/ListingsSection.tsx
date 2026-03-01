import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { ListingCard } from '@/components/marketplace/ListingCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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

interface ListingsSectionProps {
  title: string;
  subtitle?: string;
  listings: Listing[];
  showViewAll?: boolean;
  filterParam?: string;
  highlightedIds?: Set<string>;
}

export const ListingsSection = ({
  title,
  subtitle,
  listings,
  showViewAll = true,
  filterParam,
  highlightedIds,
}: ListingsSectionProps) => {
  const navigate = useNavigate();

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="pb-2 bg-background">
      <div className="container mx-auto px-4">
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {showViewAll && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/marketplace${filterParam ? `?${filterParam}` : ''}`)}
                className="text-primary gap-1 text-xs"
              >
                Lihat Semua
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {listings.map((listing) => (
              <CarouselItem 
                key={listing.id} 
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
              >
                <ListingCard 
                  listing={listing}
                  onClick={() => navigate(`/marketplace/${listing.id}`)}
                  isHighlighted={highlightedIds?.has(listing.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
};
