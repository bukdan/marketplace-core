import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
}

export const ListingsSection = ({
  title,
  subtitle,
  listings,
  showViewAll = true,
  filterParam,
}: ListingsSectionProps) => {
  const navigate = useNavigate();

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {showViewAll && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/marketplace${filterParam ? `?${filterParam}` : ''}`)}
            >
              Lihat Semua
            </Button>
          )}
        </div>

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
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <ListingCard 
                  listing={listing}
                  onClick={() => navigate(`/marketplace/${listing.id}`)}
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
