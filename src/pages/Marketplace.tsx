import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { CategoryFilter } from '@/components/marketplace/CategoryFilter';
import { SearchFilter } from '@/components/marketplace/SearchFilter';
import { MainLayout } from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [condition, setCondition] = useState<string | null>(null);
  const [priceType, setPriceType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { listings, categories, loading, error } = useListings({
    category_id: selectedCategory || undefined,
    search: search || undefined,
    sort_by: sortBy,
    condition: condition || undefined,
    price_type: priceType || undefined,
  });

  // Separate featured listings
  const featuredListings = listings.filter(l => l.is_featured);
  const regularListings = listings.filter(l => !l.is_featured);

  const activeFilters = [
    selectedCategory && categories.find(c => c.id === selectedCategory)?.name,
    condition,
    priceType,
  ].filter(Boolean);

  return (
    <MainLayout>
      <main className="container px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-7 w-7 text-primary" />
              Marketplace
            </h1>
            {user && (
              <Button onClick={() => navigate('/listing/create')} className="shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Pasang Iklan
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            Temukan produk terbaik dengan harga terjangkau
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 p-4 rounded-xl bg-card border shadow-sm">
          <SearchFilter
            onSearchChange={setSearch}
            onSortChange={(v) => setSortBy(v as typeof sortBy)}
            onConditionChange={setCondition}
            onPriceTypeChange={setPriceType}
            currentSort={sortBy}
            currentCondition={condition}
            currentPriceType={priceType}
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Active Filters & View Toggle */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {!loading && (
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                {listings.length} Produk
              </Badge>
            )}
            {activeFilters.map((filter, idx) => (
              <Badge key={idx} variant="outline" className="px-3 py-1.5">
                <Filter className="mr-1.5 h-3 w-3" />
                {filter}
              </Badge>
            ))}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setCondition(null);
                  setPriceType(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Reset Filter
              </Button>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
            <p className="font-medium">Terjadi kesalahan: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2"
          )}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Listings */}
        {!loading && !error && (
          <>
            {/* Featured Section */}
            {featuredListings.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-foreground">Produk Premium</h2>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Featured
                  </Badge>
                </div>
                <div className={cn(
                  "grid gap-4",
                  viewMode === 'grid' 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    : "grid-cols-1 md:grid-cols-2"
                )}>
                  {featuredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Listings */}
            {regularListings.length > 0 ? (
              <div>
                {featuredListings.length > 0 && (
                  <h2 className="text-lg font-bold text-foreground mb-4">Semua Produk</h2>
                )}
                <div className={cn(
                  "grid gap-4",
                  viewMode === 'grid' 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    : "grid-cols-1 md:grid-cols-2"
                )}>
                  {regularListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    />
                  ))}
                </div>
              </div>
            ) : listings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Tidak ada iklan</h3>
                <p className="mb-6 text-muted-foreground max-w-md">
                  {search 
                    ? `Tidak ditemukan iklan dengan kata kunci "${search}". Coba kata kunci lain atau reset filter.`
                    : 'Belum ada iklan yang tersedia saat ini. Jadilah yang pertama!'
                  }
                </p>
                {user && (
                  <Button size="lg" onClick={() => navigate('/listing/create')} className="shadow-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Pasang Iklan Pertama
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Load More (placeholder for pagination) */}
        {!loading && !error && listings.length >= 20 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" className="px-8">
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </main>
    </MainLayout>
  );
};

export default Marketplace;
