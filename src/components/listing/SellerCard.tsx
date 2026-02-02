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
              className="w-full gap-2" 
              onClick={onChat}
              disabled={chatLoading}
            >
              <MessageCircle className="h-4 w-4" />
              {chatLoading ? 'Memproses...' : 'Chat Penjual'}
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
