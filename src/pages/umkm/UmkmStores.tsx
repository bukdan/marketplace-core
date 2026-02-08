import { useNavigate, Link } from 'react-router-dom';
import { useUmkmStores } from '@/hooks/useUmkmStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Store, MapPin, Package, CheckCircle, Search, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

const UmkmStores = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stores, isLoading } = useUmkmStores();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = useMemo(() => {
    if (!stores) return [];
    if (!searchQuery.trim()) return stores;
    
    const query = searchQuery.toLowerCase();
    return stores.filter(store => 
      store.umkm_name.toLowerCase().includes(query) ||
      store.brand_name?.toLowerCase().includes(query) ||
      store.city?.toLowerCase().includes(query) ||
      store.province?.toLowerCase().includes(query)
    );
  }, [stores, searchQuery]);

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Toko UMKM</h1>
            <p className="text-muted-foreground">Temukan toko UMKM terpercaya di sekitar Anda</p>
          </div>
          {user && (
            <Button onClick={() => navigate('/umkm/register')}>
              <Plus className="h-4 w-4 mr-2" />
              Daftar UMKM
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari toko berdasarkan nama atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filteredStores?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Store className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Toko UMKM'}
              </h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {searchQuery 
                  ? 'Coba kata kunci lain untuk menemukan toko yang Anda cari.'
                  : 'Jadilah yang pertama mendaftarkan UMKM Anda di platform kami.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/umkm/register')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Daftar UMKM Sekarang
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <Link key={store.id} to={`/umkm/store/${store.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {/* Banner */}
                  <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/5">
                    {store.banner_url && (
                      <img 
                        src={store.banner_url} 
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    
                    {/* Logo */}
                    <div className="absolute -bottom-6 left-4">
                      <div className="h-14 w-14 rounded-lg border-2 border-background bg-muted shadow overflow-hidden">
                        {store.logo_url ? (
                          <img 
                            src={store.logo_url} 
                            alt={store.umkm_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-10 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold line-clamp-1">{store.umkm_name}</h3>
                      {store.is_verified && (
                        <Badge variant="secondary" className="gap-1 flex-shrink-0">
                          <CheckCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Terverifikasi</span>
                        </Badge>
                      )}
                    </div>
                    
                    {store.brand_name && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {store.brand_name}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {(store.city || store.province) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {[store.city, store.province].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{store.productCount} produk</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UmkmStores;
