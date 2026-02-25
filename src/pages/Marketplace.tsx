import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { SearchFilter } from '@/components/marketplace/SearchFilter';
import { MainLayout } from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Smartphone,
  Car,
  Home,
  Shirt,
  Gamepad2,
  Sofa,
  Wrench,
  MoreHorizontal,
  Grid3X3,
  Package,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const categoryIcons: Record<string, React.ReactNode> = {
  'elektronik': <Smartphone className="h-4 w-4" />,
  'kendaraan': <Car className="h-4 w-4" />,
  'properti': <Home className="h-4 w-4" />,
  'fashion': <Shirt className="h-4 w-4" />,
  'hobi-koleksi': <Gamepad2 className="h-4 w-4" />,
  'rumah-tangga': <Sofa className="h-4 w-4" />,
  'jasa': <Wrench className="h-4 w-4" />,
  'lainnya': <MoreHorizontal className="h-4 w-4" />,
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [condition, setCondition] = useState<string | null>(null);
  const [priceType, setPriceType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const { listings, categories, loading, error } = useListings({
    category_id: selectedCategory || undefined,
    search: search || undefined,
    sort_by: sortBy,
    condition: condition || undefined,
    price_type: priceType || undefined,
  });

  const featuredListings = listings.filter(l => l.is_featured);
  const regularListings = listings.filter(l => !l.is_featured);

  const activeFilters = [
    selectedCategory && categories.find(c => c.id === selectedCategory)?.name,
    condition,
    priceType,
  ].filter(Boolean);

  return (
    <MainLayout>
      <div className="container px-4 py-4">
        {/* Top Search Bar */}
        <div className="mb-4 p-4 rounded-xl bg-card border shadow-sm">
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

        <div className="flex gap-4">
          {/* ===== Sidebar ===== */}
          <aside className={cn(
            "shrink-0 transition-all duration-300",
            sidebarOpen ? "w-56" : "w-0 overflow-hidden",
            isMobile && sidebarOpen && "fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-2xl pt-16"
          )}>
            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
              <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
            )}
            <div className={cn(
              "sticky top-20 space-y-2",
              isMobile && sidebarOpen && "relative z-50 p-4"
            )}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Kategori
                </h3>
                {isMobile && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-0.5 pr-2">
                  {/* All categories */}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      selectedCategory === null
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      selectedCategory === null ? "bg-primary-foreground/20" : "bg-muted group-hover:bg-primary/10"
                    )}>
                      <Grid3X3 className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-left">Semua Kategori</span>
                    <ChevronRight className={cn("h-3.5 w-3.5 opacity-0 transition-all", selectedCategory === null && "opacity-100")} />
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); if (isMobile) setSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md transition-colors",
                        selectedCategory === cat.id ? "bg-primary-foreground/20" : "bg-muted group-hover:bg-primary/10"
                      )}>
                        {categoryIcons[cat.slug] || <Grid3X3 className="h-4 w-4" />}
                      </div>
                      <span className="flex-1 text-left truncate">{cat.name}</span>
                      <ChevronRight className={cn("h-3.5 w-3.5 opacity-0 transition-all", selectedCategory === cat.id && "opacity-100")} />
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* Pasang Iklan CTA in sidebar */}
              {user && (
                <div className="pt-4 border-t mt-4">
                  <Button onClick={() => navigate('/listing/create')} className="w-full shadow-lg" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Pasang Iklan
                  </Button>
                </div>
              )}
            </div>
          </aside>

          {/* ===== Main Content ===== */}
          <main className="flex-1 min-w-0">
            {/* Header bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {!sidebarOpen && (
                  <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="gap-2">
                    <Filter className="h-4 w-4" />
                    Kategori
                  </Button>
                )}
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
              
              <div className="flex items-center gap-2">
                {user && !sidebarOpen && (
                  <Button onClick={() => navigate('/listing/create')} size="sm" className="shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Pasang Iklan
                  </Button>
                )}
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
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
                <p className="font-medium">Terjadi kesalahan: {error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Coba Lagi
                </Button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' 
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-2"
              )}>
                {Array.from({ length: 8 }).map((_, i) => (
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
                {featuredListings.length > 0 && (
                  <div className="mb-6">
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
                        ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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

                {regularListings.length > 0 ? (
                  <div>
                    {featuredListings.length > 0 && (
                      <h2 className="text-lg font-bold text-foreground mb-4">Semua Produk</h2>
                    )}
                    <div className={cn(
                      "grid gap-4",
                      viewMode === 'grid' 
                        ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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

            {!loading && !error && listings.length >= 20 && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" size="lg" className="px-8">
                  Muat Lebih Banyak
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default Marketplace;
