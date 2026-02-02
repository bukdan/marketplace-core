import { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: unknown) => void;
        onPending?: (result: unknown) => void;
        onError?: (result: unknown) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const Credits = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, packages, loading, purchaseCredits, refetchCredits } = useCredits();
  const [processingPackage, setProcessingPackage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth');
      return;
    }

    setProcessingPackage(packageId);

    try {
      const result = await purchaseCredits(packageId);

      if (result.snap_token && window.snap) {
        window.snap.pay(result.snap_token, {
          onSuccess: () => {
            toast.success('Pembelian kredit berhasil!');
            refetchCredits();
          },
          onPending: () => {
            toast.info('Pembayaran sedang diproses');
          },
          onError: () => {
            toast.error('Pembayaran gagal');
          },
          onClose: () => {
            setProcessingPackage(null);
          },
        });
      } else if (result.redirect_url) {
        window.location.href = result.redirect_url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Gagal memproses pembelian');
    } finally {
      setProcessingPackage(null);
    }
  };

  if (!user) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center px-4">
        <Coins className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold">Login untuk Membeli Kredit</h2>
        <p className="mb-4 text-muted-foreground">Anda perlu login untuk membeli kredit</p>
        <Button onClick={() => navigate('/auth')}>Login Sekarang</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-xl font-bold">Beli Kredit</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Current Balance */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Kredit Anda</p>
              {loading ? (
                <Skeleton className="mt-1 h-8 w-24" />
              ) : (
                <p className="text-3xl font-bold text-primary">
                  {credits?.balance || 0} <span className="text-lg">Kredit</span>
                </p>
              )}
            </div>
            <Coins className="h-12 w-12 text-primary/50" />
          </CardContent>
        </Card>

        {/* Credit Usage Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Kegunaan Kredit</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span><strong>1 Kredit</strong> = Pasang 1 Iklan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span><strong>1 Kredit</strong> = Tambah Gambar Extra</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span><strong>5-20 Kredit/hari</strong> = Boost Iklan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span><strong>2 Kredit</strong> = Buat Lelang</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <h2 className="mb-4 text-lg font-bold">Pilih Paket Kredit</h2>
        
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative transition-all hover:shadow-lg ${
                  pkg.is_featured ? 'ring-2 ring-primary' : ''
                }`}
              >
                {pkg.is_featured && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    <Sparkles className="mr-1 h-3 w-3" /> Terpopuler
                  </Badge>
                )}
                
                <CardHeader className="pb-2">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.credits} Kredit
                    {pkg.bonus_credits > 0 && (
                      <span className="ml-1 text-primary">
                        + {pkg.bonus_credits} Bonus
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {' '}({formatPrice(pkg.price / (pkg.credits + pkg.bonus_credits))}/kredit)
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={pkg.is_featured ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={processingPackage !== null}
                  >
                    {processingPackage === pkg.id ? 'Memproses...' : 'Beli Sekarang'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Credits;
