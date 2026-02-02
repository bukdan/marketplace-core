import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Users, ShoppingBag, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroSectionProps {
  stats: {
    total_listings: number;
    total_sellers: number;
    total_categories: number;
    active_auctions: number;
  };
}

export const HeroSection = ({ stats }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const statItems = [
    { icon: ShoppingBag, label: 'Total Iklan', value: stats.total_listings },
    { icon: Users, label: 'Penjual Aktif', value: stats.total_sellers },
    { icon: TrendingUp, label: 'Kategori', value: stats.total_categories },
    { icon: Gavel, label: 'Lelang Aktif', value: stats.active_auctions },
  ];

  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-primary-foreground md:text-5xl">
            Marketplace UMKM Indonesia
          </h1>
          <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl">
            Platform digital terpadu untuk memberdayakan UMKM Indonesia. 
            Jual, beli, dan lelang produk lokal berkualitas.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mx-auto mb-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari produk, kategori, atau penjual..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 bg-background text-foreground"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary" className="h-12">
              Cari
            </Button>
          </form>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/marketplace')}
            >
              Jelajahi Marketplace
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/auth')}
            >
              Mulai Jualan
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statItems.map((item) => (
              <div 
                key={item.label} 
                className="rounded-lg bg-primary-foreground/10 p-4 backdrop-blur-sm"
              >
                <item.icon className="mx-auto mb-2 h-6 w-6 text-primary-foreground" />
                <div className="text-2xl font-bold text-primary-foreground">
                  {item.value.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-primary-foreground/70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
