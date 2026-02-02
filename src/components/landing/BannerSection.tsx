import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  position: 'hero' | 'sidebar' | 'inline' | 'footer';
}

interface BannerSectionProps {
  banners: Banner[];
  onImpression?: (bannerId: string) => void;
  onClick?: (bannerId: string) => void;
}

export const BannerSection = ({ banners, onImpression, onClick }: BannerSectionProps) => {
  // Track impressions on mount
  useEffect(() => {
    banners.forEach((banner) => {
      onImpression?.(banner.id);
    });
  }, [banners, onImpression]);

  if (banners.length === 0) {
    return null;
  }

  const handleClick = (banner: Banner) => {
    onClick?.(banner.id);
    window.open(banner.target_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Sponsor
          </Badge>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id} className="md:basis-1/2 lg:basis-1/3">
                <div 
                  className="group relative cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handleClick(banner)}
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="aspect-[2/1] w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-background">
                        {banner.title}
                      </span>
                      <ExternalLink className="h-4 w-4 text-background" />
                    </div>
                  </div>
                </div>
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
