import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, Clock, Gavel } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface ListingCardProps {
  listing: {
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
  };
  onClick?: () => void;
}

const conditionLabels: Record<string, string> = {
  new: 'Baru',
  like_new: 'Seperti Baru',
  good: 'Bagus',
  fair: 'Cukup',
};

const priceTypeLabels: Record<string, string> = {
  fixed: 'Harga Pas',
  negotiable: 'Nego',
  auction: 'Lelang',
};

export const ListingCard = ({ listing, onClick }: ListingCardProps) => {
  const navigate = useNavigate();
  const primaryImage = listing.listing_images.find((img) => img.is_primary) || listing.listing_images[0];
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/listing/${listing.id}`);
    }
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all hover:shadow-lg ${
        listing.is_featured ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {listing.is_featured && (
            <Badge className="bg-primary text-primary-foreground">Premium</Badge>
          )}
          {listing.price_type === 'auction' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Gavel className="h-3 w-3" /> Lelang
            </Badge>
          )}
        </div>

        {/* Condition badge */}
        <Badge 
          variant="outline" 
          className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
        >
          {conditionLabels[listing.condition]}
        </Badge>
      </div>

      <CardContent className="p-3">
        {/* Price */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(listing.price)}
          </span>
          {listing.price_type === 'negotiable' && (
            <Badge variant="outline" className="text-xs">Nego</Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-foreground">
          {listing.title}
        </h3>

        {/* Category */}
        <Badge variant="secondary" className="mb-2 text-xs">
          {listing.categories?.name}
        </Badge>

        {/* Location & Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {listing.city || listing.province || 'Indonesia'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {listing.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(listing.created_at), { 
                addSuffix: true,
                locale: id 
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
