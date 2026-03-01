import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
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

  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-28">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Floating glow orbs */}
      <div className="absolute top-10 left-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-10 right-1/4 h-48 w-48 rounded-full bg-secondary/20 blur-[80px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary-foreground/5 blur-[120px]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Platform UMKM #1 Indonesia</span>
          </div>

          <h1 className="mb-5 text-4xl font-extrabold tracking-tight md:text-6xl">
            <span className="gradient-heading-light">
              Marketplace UMKM Indonesia
            </span>
          </h1>
          <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl leading-relaxed">
            Platform digital terpadu untuk memberdayakan UMKM Indonesia. 
            Jual, beli, dan lelang produk lokal berkualitas.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mx-auto mb-10 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari produk, kategori, atau penjual..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 bg-background text-foreground rounded-lg border-0 shadow-[0_0_20px_hsl(var(--primary-foreground)/0.1)]"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary" className="h-12">
              <Search className="mr-1 h-4 w-4" />
              Cari
            </Button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/marketplace')}
              className="px-8"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Jelajahi Marketplace
            </Button>
            <Button 
              size="lg" 
              variant="success"
              onClick={() => navigate('/auth')}
              className="px-8"
            >
              Mulai Jualan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
