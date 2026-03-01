import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, Clock, Gavel, Heart, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
    condition: 'new' | 'like_new' | 'good' | 'fair' | null;
    status?: string;
    city: string | null;
    province: string | null;
    view_count: number;
    is_featured: boolean;
    created_at: string;
    listing_images: ListingImage[];
    categories: { name: string } | null;
  };
  onClick?: () => void;
  variant?: 'default' | 'compact';
  isHighlighted?: boolean;
}

const conditionConfig: Record<string, { label: string; color: string; icon?: React.ElementType }> = {
  new: { label: 'Baru', color: 'bg-emerald-500 text-white', icon: Sparkles },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500 text-white' },
  good: { label: 'Bagus', color: 'bg-amber-500 text-white' },
  fair: { label: 'Cukup', color: 'bg-gray-500 text-white' },
};

const priceTypeConfig: Record<string, { label: string; color: string }> = {
  fixed: { label: 'Harga Pas', color: 'bg-primary/10 text-primary border-primary/20' },
  negotiable: { label: 'Bisa Nego', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  auction: { label: 'Lelang', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
};

export const ListingCard = ({ listing, onClick, variant = 'default', isHighlighted = false }: ListingCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  const primaryImage = listing.listing_images?.find((img) => img.is_primary) || listing.listing_images?.[0];
  
  useEffect(() => {
    if (user) checkIfSaved();
  }, [user, listing.id]);

  const checkIfSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();
    setIsSaved(!!data);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Login diperlukan', description: 'Silakan login untuk menyimpan iklan' });
      navigate('/auth');
      return;
    }
    setSavingWishlist(true);
    try {
      if (isSaved) {
        await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listing.id);
        setIsSaved(false);
        toast({ title: '❌ Dihapus dari wishlist' });
      } else {
        await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listing.id });
        setIsSaved(true);
        toast({ title: '❤️ Ditambahkan ke wishlist' });
      }
    } finally {
      setSavingWishlist(false);
    }
  };

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

  const condition = listing.condition || 'good';
  const conditionData = conditionConfig[condition] || conditionConfig.good;
  const priceTypeData = priceTypeConfig[listing.price_type] || priceTypeConfig.fixed;
  const isSold = listing.status === 'sold';

  if (variant === 'compact') {
    // List view - horizontal card
    return (
      <Card
        className={cn(
          "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg",
          listing.is_featured && "ring-2 ring-primary shadow-primary/10",
          isSold && "opacity-75"
        )}
        onClick={handleClick}
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-40 sm:w-48 shrink-0 overflow-hidden bg-muted">
            {primaryImage ? (
              <img
                src={primaryImage.image_url}
                alt={listing.title}
                className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", isSold && "grayscale")}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <Tag className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            {listing.is_featured && (
              <Badge className="absolute left-2 top-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                <Sparkles className="mr-1 h-3 w-3" />Premium
              </Badge>
            )}
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge className="bg-red-500 text-white border-0"><CheckCircle2 className="mr-1 h-4 w-4" />TERJUAL</Badge>
              </div>
            )}
            <button
              className={cn(
                "absolute right-2 top-2 rounded-full p-1.5 shadow-lg transition-all",
                isSaved ? "bg-red-500 text-white opacity-100" : "bg-white/90 opacity-0 group-hover:opacity-100"
              )}
              onClick={toggleWishlist}
              disabled={savingWishlist}
            >
              <Heart className={cn("h-3.5 w-3.5", isSaved ? "fill-white" : "text-muted-foreground")} />
            </button>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-lg font-bold text-foreground">{formatPrice(listing.price)}</span>
                <Badge variant="outline" className={cn("text-xs", priceTypeData.color)}>{priceTypeData.label}</Badge>
                <Badge className={cn("text-xs border-0", conditionData.color)}>{conditionData.label}</Badge>
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground mb-2">{listing.title}</h3>
              {listing.categories?.name && (
                <Badge variant="secondary" className="text-xs bg-muted mb-2">{listing.categories.name}</Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="truncate font-medium">{listing.city || listing.province || 'Indonesia'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.view_count || 0}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: false, locale: id })}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        isHighlighted && "ring-2 ring-amber-400 shadow-lg shadow-amber-200/30 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20 dark:to-background",
        listing.is_featured && !isHighlighted && "ring-2 ring-primary shadow-lg shadow-primary/10",
        isSold && "opacity-75"
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={listing.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              "group-hover:scale-110",
              isSold && "grayscale"
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <Tag className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Top badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {isHighlighted && (
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-0 shadow-lg animate-pulse">
              <Sparkles className="mr-1 h-3 w-3" />
              Highlight
            </Badge>
          )}
          {listing.is_featured && !isHighlighted && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <Sparkles className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
          {listing.price_type === 'auction' && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
              <Gavel className="mr-1 h-3 w-3" />
              Lelang
            </Badge>
          )}
        </div>

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge className="bg-red-500 text-white text-lg px-4 py-2 border-0 shadow-xl">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              TERJUAL
            </Badge>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute bottom-2 left-2">
          <Badge 
            className={cn(
              "shadow-lg border-0 font-medium",
              conditionData.color
            )}
          >
            {conditionData.icon && <conditionData.icon className="mr-1 h-3 w-3" />}
            {conditionData.label}
          </Badge>
        </div>

        {/* Wishlist button */}
        <button 
          className={cn(
            "absolute right-2 top-2 rounded-full p-2 shadow-lg transition-all",
            isSaved 
              ? "bg-red-500 text-white opacity-100" 
              : "bg-white/90 opacity-0 group-hover:opacity-100 hover:bg-white"
          )}
          onClick={toggleWishlist}
          disabled={savingWishlist}
        >
          <Heart className={cn("h-4 w-4 transition-colors", isSaved ? "fill-white" : "text-muted-foreground hover:text-red-500")} />
        </button>
      </div>

      <CardContent className="p-3">
        {/* Price Row */}
        <div className="mb-1 flex items-center justify-between gap-1">
          <span className="text-base font-bold text-foreground">
            {formatPrice(listing.price)}
          </span>
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium shrink-0", priceTypeData.color)}
          >
            {priceTypeData.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-xs font-semibold text-foreground leading-snug min-h-[2rem]">
          {listing.title}
        </h3>

        {/* Category Tag */}
        {listing.categories?.name && (
          <Badge variant="secondary" className="mb-2 text-[10px] bg-muted">
            {listing.categories.name}
          </Badge>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-1 truncate max-w-[50%]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">
              {listing.city || listing.province || 'Indonesia'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span className="font-medium">{listing.view_count || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">
                {formatDistanceToNow(new Date(listing.created_at), { 
                  addSuffix: false,
                  locale: id 
                })}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
