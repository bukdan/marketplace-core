import { useLandingData } from '@/hooks/useLandingData';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategorySection } from '@/components/landing/CategorySection';
import { ListingsSection } from '@/components/landing/ListingsSection';
import { AuctionSection } from '@/components/landing/AuctionSection';
import { BannerSection } from '@/components/landing/BannerSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => (
  <div className="min-h-screen">
    {/* Hero Skeleton */}
    <div className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-3/4 bg-primary-foreground/20" />
          <Skeleton className="mx-auto mb-8 h-6 w-1/2 bg-primary-foreground/20" />
          <Skeleton className="mx-auto mb-8 h-12 w-full max-w-xl bg-primary-foreground/20" />
        </div>
      </div>
    </div>
    
    {/* Content Skeletons */}
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  </div>
);

const Index = () => {
  const {
    categories,
    featuredListings,
    latestListings,
    popularListings,
    activeAuctions,
    testimonials,
    creditPackages,
    banners,
    stats,
    loading,
    trackBannerEvent,
  } = useLandingData();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search & Stats */}
      <HeroSection stats={stats} />

      {/* Category Carousel */}
      <CategorySection categories={categories} />

      {/* Featured/Premium Listings */}
      <ListingsSection
        title="Iklan Premium"
        subtitle="Produk pilihan dari penjual terpercaya"
        listings={featuredListings}
        filterParam="featured=true"
      />

      {/* Banner Sponsor Ads */}
      <BannerSection
        banners={banners.filter((b) => b.position === 'inline')}
        onImpression={(id) => trackBannerEvent(id, 'impression')}
        onClick={(id) => trackBannerEvent(id, 'click')}
      />

      {/* Latest Listings */}
      <ListingsSection
        title="Produk Terbaru"
        subtitle="Temukan produk baru yang baru saja diposting"
        listings={latestListings}
        filterParam="sort=newest"
      />

      {/* Active Auctions */}
      <AuctionSection auctions={activeAuctions} />

      {/* Popular Listings */}
      <ListingsSection
        title="Produk Populer"
        subtitle="Paling banyak dilihat minggu ini"
        listings={popularListings}
        filterParam="sort=popular"
      />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Pricing / Credit Packages */}
      <PricingSection packages={creditPackages} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
