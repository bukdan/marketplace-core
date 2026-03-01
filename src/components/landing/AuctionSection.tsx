import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientHeading } from '@/components/ui/gradient-heading';

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

interface AuctionSectionProps {
  auctions: Auction[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const CountdownTimer = ({ endsAt }: { endsAt: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Berakhir');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}h ${hours}j ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}d`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <span className={timeLeft === 'Berakhir' ? 'text-destructive' : ''}>
      {timeLeft}
    </span>
  );
};

export const AuctionSection = ({ auctions }: AuctionSectionProps) => {
  const navigate = useNavigate();

  if (auctions.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Gavel className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <GradientHeading className="text-2xl font-bold md:text-3xl">
                Lelang Aktif
              </GradientHeading>
              <p className="text-muted-foreground">
                Ikuti lelang dan dapatkan harga terbaik
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/marketplace?price_type=auction')}>
            Lihat Semua Lelang
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => {
            const primaryImage = auction.listing?.listing_images?.find((img) => img.is_primary) 
              || auction.listing?.listing_images?.[0];

            return (
              <Card 
                key={auction.id} 
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                onClick={() => navigate(`/marketplace/${auction.listing?.id}`)}
              >
                <div className="relative aspect-video overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={auction.listing?.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Gavel className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <CountdownTimer endsAt={auction.ends_at} />
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-medium text-foreground">
                    {auction.listing?.title}
                  </h3>
                  
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Harga Saat Ini</p>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(auction.current_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Harga Awal</p>
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(auction.starting_price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {auction.total_bids || 0} penawaran
                    </span>
                    <Button size="sm" variant="secondary">
                      Ikut Lelang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
