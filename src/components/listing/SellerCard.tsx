import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Shield, Star, MessageCircle, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface SellerProfile {
  name: string | null;
  phone_number: string | null;
  created_at: string | null;
  avatar_url?: string | null;
  address?: string | null;
}

interface SellerRating {
  total_reviews: number;
  average_rating: number;
}

interface SellerCardProps {
  profile: SellerProfile | null;
  rating?: SellerRating | null;
  listingLocation?: string;
  isOwnListing?: boolean;
  onChat?: () => void;
  onCall?: () => void;
  chatLoading?: boolean;
}

export const SellerCard = ({
  profile,
  rating,
  listingLocation,
  isOwnListing = false,
  onChat,
  onCall,
  chatLoading = false,
}: SellerCardProps) => {
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMMM yyyy', { locale: localeId })
    : 'baru-baru ini';

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20">
              <User className="h-8 w-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {profile?.name || 'Pengguna'}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Bergabung {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Rating Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (rating?.average_rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{rating?.average_rating || 0}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({rating?.total_reviews || 0} ulasan)
          </span>
        </div>

        {/* Verification Badge */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5 bg-emerald-50 border-emerald-200 text-emerald-700">
            <Shield className="h-3.5 w-3.5" />
            Identitas Terverifikasi
          </Badge>
        </div>

        {/* Location */}
        {listingLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{listingLocation}</span>
          </div>
        )}

        {/* Action Buttons */}
        {!isOwnListing && (
          <div className="space-y-2 pt-2">
            <Button 
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
              onClick={onChat}
              disabled={chatLoading}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {chatLoading ? 'Memproses...' : 'Chat WhatsApp'}
            </Button>
            
            {profile?.phone_number && (
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onCall}
              >
                <Phone className="h-4 w-4" />
                Hubungi via Telepon
              </Button>
            )}
          </div>
        )}

        {isOwnListing && (
          <div className="text-center py-2">
            <Badge variant="secondary" className="text-sm">
              Ini adalah iklan Anda
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
