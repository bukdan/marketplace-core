import { useNavigate, Link } from 'react-router-dom';
import { usePublicProducts } from '@/hooks/useUmkmProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ShoppingCart, MapPin, Store, Building2 } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const UmkmProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: products, isLoading } = usePublicProducts();
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

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Produk UMKM</h1>
            <p className="text-muted-foreground">Temukan produk berkualitas dari UMKM lokal</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/umkm/stores')}>
              <Building2 className="h-4 w-4 mr-2" />
              Lihat Toko
            </Button>
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

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !products?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Belum Ada Produk</h2>
              <p className="text-muted-foreground mb-6">Produk UMKM akan muncul di sini</p>
              <Button onClick={() => navigate('/umkm/register')}>
                <Store className="mr-2 h-4 w-4" />
                Daftar UMKM
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => {
              const primaryImage = product.images?.find((i: any) => i.is_primary)?.image_url;
              
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
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {product.is_service && (
                      <Badge className="absolute top-2 left-2">Jasa</Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-lg font-bold text-primary mb-2">
                      {formatCurrency(product.price)}
                    </p>
                    {product.umkm && (
                      <Link 
                        to={`/umkm/store/${product.umkm.id}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Store className="h-3 w-3" />
                        <span className="line-clamp-1">{product.umkm.umkm_name}</span>
                      </Link>
                    )}
                    {product.umkm?.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{product.umkm.city}</span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddToCart(product)}
                      disabled={addToCart.isPending}
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
    </MainLayout>
  );
};

export default UmkmProducts;
