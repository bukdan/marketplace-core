import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { CategoryFilter } from '@/components/marketplace/CategoryFilter';
import { SearchFilter } from '@/components/marketplace/SearchFilter';
import { MainLayout } from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [condition, setCondition] = useState<string | null>(null);
  const [priceType, setPriceType] = useState<string | null>(null);

  const { listings, categories, loading, error } = useListings({
    category_id: selectedCategory || undefined,
    search: search || undefined,
    sort_by: sortBy,
    condition: condition || undefined,
    price_type: priceType || undefined,
  });

  return (
    <MainLayout>
      <main className="container px-4 py-4">
        {/* Search & Filter */}
        <div className="mb-4">
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

        {/* Results Count */}
        {!loading && (
          <p className="mb-4 text-sm text-muted-foreground">
            Menampilkan {listings.length} iklan
            {selectedCategory && categories.find(c => c.id === selectedCategory) && 
              ` di ${categories.find(c => c.id === selectedCategory)?.name}`
            }
          </p>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            <p>Terjadi kesalahan: {error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && (
          <>
            {listings.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">Tidak ada iklan</h3>
                <p className="mb-4 text-muted-foreground">
                  {search 
                    ? `Tidak ditemukan iklan dengan kata kunci "${search}"`
                    : 'Belum ada iklan yang tersedia'
                  }
                </p>
                {user && (
                  <Button onClick={() => navigate('/listing/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Pasang Iklan Pertama
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </MainLayout>
  );
};

export default Marketplace;
