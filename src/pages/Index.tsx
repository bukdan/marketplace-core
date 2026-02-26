import { useLandingData } from '@/hooks/useLandingData';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategorySection } from '@/components/landing/CategorySection';
import { ListingsSection } from '@/components/landing/ListingsSection';
import { AuctionSection } from '@/components/landing/AuctionSection';
import { BannerSection } from '@/components/landing/BannerSection';
import { AdBanner } from '@/components/ads/AdBanner';
import { Footer } from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, TrendingUp, ChevronRight, Sparkles, Timer } from 'lucide-react';

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-muted/30">
    <div className="container mx-auto px-4 py-4">
      <Skeleton className="h-48 w-full rounded-xl mb-4" />
      <div className="flex gap-3 overflow-hidden mb-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const {
    categories,
    featuredListings,
    latestListings,
    popularListings,
    activeAuctions,
    banners,
    loading,
    trackBannerEvent,
  } = useLandingData();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-muted/30">
        {/* Top Banner Carousel - Full width like Lazada */}
        <BannerSection
          banners={banners.filter((b) => b.position === 'inline')}
          onImpression={(id) => trackBannerEvent(id, 'impression')}
          onClick={(id) => trackBannerEvent(id, 'click')}
        />

        {/* Category Icons Row - Compact like Lazada */}
        <CategorySection categories={categories} />

        {/* Flash Deal / Featured Section */}
        <section className="py-6 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-destructive px-3 py-1.5">
                  <Flame className="h-5 w-5 text-destructive-foreground animate-pulse" />
                  <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">Flash Sale</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-muted-foreground text-sm">
                  <Timer className="h-4 w-4" />
                  <span>Penawaran terbatas!</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/marketplace?featured=true')}
                className="text-primary gap-1"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Featured Listings as product grid */}
        <div className="-mt-4">
          <ListingsSection
            title=""
            listings={featuredListings}
            filterParam="featured=true"
            showViewAll={false}
          />
        </div>

        {/* Inline Ad between sections */}
        <div className="container mx-auto px-4 py-4">
          <AdBanner position="inline" className="rounded-lg" />
        </div>

        {/* Active Auctions */}
        <AuctionSection auctions={activeAuctions} />

        {/* Latest Listings Section */}
        <section className="bg-background">
          <div className="container mx-auto px-4 pt-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Produk Terbaru</h2>
                <Badge variant="secondary" className="text-xs">Baru</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/marketplace?sort=newest')}
                className="text-primary gap-1"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <ListingsSection
          title=""
          listings={latestListings}
          filterParam="sort=newest"
          showViewAll={false}
        />

        {/* Inline Ad between sections */}
        <div className="container mx-auto px-4 py-4">
          <AdBanner position="inline" className="rounded-lg" />
        </div>

        {/* Popular Listings Section */}
        <section className="bg-background">
          <div className="container mx-auto px-4 pt-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Populer Minggu Ini</h2>
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/marketplace?sort=popular')}
                className="text-primary gap-1"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <ListingsSection
          title=""
          listings={popularListings}
          filterParam="sort=popular"
          showViewAll={false}
        />

        {/* Minimal CTA Banner */}
        <section className="py-8 bg-primary">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-primary-foreground">
                  Mulai jualan di UMKM ID sekarang!
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Gratis daftar · Jutaan pembeli · Transaksi aman
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/auth')}
                >
                  Daftar Gratis
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20"
                  onClick={() => navigate('/listing/create')}
                >
                  Pasang Iklan
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </MainLayout>
  );
};

export default Index;
