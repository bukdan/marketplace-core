import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUmkmStore, useUmkmStoreProducts } from '@/hooks/useUmkmStore';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Loader2, Package, ShoppingCart, MapPin, Store, Phone, 
  Mail, Globe, CheckCircle, MessageCircle, ChevronLeft 
} from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const UmkmStore = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: store, isLoading: storeLoading } = useUmkmStore(id);
  const { data: products, isLoading: productsLoading } = useUmkmStoreProducts(id);
  const { addToCart, totalItems } = useCart();

  const handleAddToCart = (product: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    addToCart.mutate({
      productId: product.id,
      quantity: 1,
      price: product.price,
    });
  };

  const handleWhatsApp = () => {
    if (store?.whatsapp) {
      const phone = store.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  if (storeLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </MainLayout>
    );
  }

  if (!store) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Toko Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">Toko UMKM yang Anda cari tidak tersedia.</p>
          <Button onClick={() => navigate('/umkm/stores')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Toko
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5">
          {store.banner_url && (
            <img 
              src={store.banner_url} 
              alt={`${store.umkm_name} banner`}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="container relative -mt-16 pb-8">
          {/* Store Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Logo */}
            <div className="relative z-10 flex-shrink-0">
              <div className="h-32 w-32 rounded-xl border-4 border-background bg-muted shadow-lg overflow-hidden">
                {store.logo_url ? (
                  <img 
                    src={store.logo_url} 
                    alt={store.umkm_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <Store className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1 pt-4 md:pt-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{store.umkm_name}</h1>
                    {store.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Terverifikasi
                      </Badge>
                    )}
                  </div>
                  {store.brand_name && (
                    <p className="text-muted-foreground mb-2">{store.brand_name}</p>
                  )}
                  {(store.city || store.province) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{[store.city, store.province].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {store.whatsapp && (
                    <Button variant="outline" onClick={handleWhatsApp}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  {user && (
                    <Button variant="outline" onClick={() => navigate('/cart')} className="relative">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Keranjang
                      {totalItems > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {totalItems}
                        </Badge>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Store Description & Contact */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* About */}
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h2 className="font-semibold mb-2">Tentang Toko</h2>
                <p className="text-muted-foreground">
                  {store.description || 'Belum ada deskripsi toko.'}
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h2 className="font-semibold mb-2">Kontak</h2>
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{store.email}</span>
                  </div>
                )}
                {store.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {store.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {store.address && (
                  <div className="flex items-start gap-2 text-sm pt-2 border-t">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{store.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Produk ({products?.length || 0})</h2>
            </div>

            {productsLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !products?.length ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">Belum Ada Produk</h3>
                  <p className="text-sm text-muted-foreground">Toko ini belum menambahkan produk.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  const primaryImage = product.images?.find((i) => i.is_primary)?.image_url 
                    || product.images?.[0]?.image_url;
                  
                  return (
                    <Card key={product.id} className="overflow-hidden group">
                      <div className="aspect-square relative bg-muted">
                        {primaryImage ? (
                          <img 
                            src={primaryImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        {product.is_service && (
                          <Badge className="absolute top-2 left-2">Jasa</Badge>
                        )}
                        {product.stock <= 0 && !product.is_service && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="destructive">Stok Habis</Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </p>
                        {!product.is_service && product.stock > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Stok: {product.stock}
                          </p>
                        )}
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          className="w-full" 
                          onClick={() => handleAddToCart(product)}
                          disabled={addToCart.isPending || (product.stock <= 0 && !product.is_service)}
                        >
                          {addToCart.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Tambah ke Keranjang
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UmkmStore;
