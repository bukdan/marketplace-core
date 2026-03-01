import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number | null;
  price: number;
  is_featured: boolean;
}

interface PricingSectionProps {
  packages: CreditPackage[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const features = [
  'Posting iklan (1 kredit)',
  'Gambar tambahan (1 kredit)',
  'Listing lelang (2 kredit)',
  'Boost highlight (5 kredit/hari)',
  'Top search (10 kredit/hari)',
  'Premium boost (20 kredit/hari)',
];

export const PricingSection = ({ packages }: PricingSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            <span className="gradient-heading">Paket Kredit</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Pilih paket kredit sesuai kebutuhan bisnis Anda. 
            Semakin besar paket, semakin banyak bonus yang didapat.
          </p>
        </div>

        {/* Credit Usage Info */}
        <div className="mb-12 rounded-lg bg-muted p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Penggunaan Kredit:
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all hover:shadow-lg ${
                pkg.is_featured ? 'ring-2 ring-primary' : ''
              }`}
            >
              {pkg.is_featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Populer
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {pkg.credits}
                  </span>
                  <span className="text-muted-foreground"> kredit</span>
                </div>
                
                {pkg.bonus_credits && pkg.bonus_credits > 0 && (
                  <Badge variant="secondary" className="mb-4">
                    +{pkg.bonus_credits} bonus
                  </Badge>
                )}
                
                <div className="mb-6">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(pkg.price)}
                  </span>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={pkg.is_featured ? 'default' : 'outline'}
                  onClick={() => navigate('/credits')}
                >
                  Pilih Paket
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
