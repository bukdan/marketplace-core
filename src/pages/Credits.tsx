import { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Sparkles, Check, CreditCard, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ManualTransferForm } from '@/components/credits/ManualTransferForm';

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
  const [selectedTransferPkg, setSelectedTransferPkg] = useState<any>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const handlePurchase = async (packageId: string) => {
    if (!user) { toast.error('Silakan login terlebih dahulu'); navigate('/auth'); return; }
    setProcessingPackage(packageId);
    try {
      const result = await purchaseCredits(packageId);
      if (result.snap_token && window.snap) {
        window.snap.pay(result.snap_token, {
          onSuccess: () => { toast.success('Pembelian kredit berhasil!'); refetchCredits(); },
          onPending: () => { toast.info('Pembayaran sedang diproses'); },
          onError: () => { toast.error('Pembayaran gagal'); },
          onClose: () => { setProcessingPackage(null); },
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
      <MainLayout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
          <Coins className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-bold">Login untuk Membeli Kredit</h2>
          <p className="mb-4 text-muted-foreground">Anda perlu login untuk membeli kredit</p>
          <Button onClick={() => navigate('/auth')}>Login Sekarang</Button>
        </div>
      </MainLayout>
    );
  }

  // If user selected manual transfer package
  if (selectedTransferPkg) {
    return (
      <MainLayout>
        <main className="container max-w-2xl px-4 py-6">
          <ManualTransferForm
            selectedPackage={selectedTransferPkg}
            onBack={() => setSelectedTransferPkg(null)}
            onSuccess={() => {}}
          />
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /><span><strong>1 Kredit</strong> = Pasang 1 Iklan</span></li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /><span><strong>1 Kredit</strong> = Tambah Gambar Extra</span></li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /><span><strong>5-20 Kredit/hari</strong> = Boost Iklan</span></li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /><span><strong>2 Kredit</strong> = Buat Lelang</span></li>
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
                className={`relative transition-all hover:shadow-lg ${pkg.is_featured ? 'ring-2 ring-primary' : ''}`}
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
                      <span className="ml-1 text-primary"> + {pkg.bonus_credits} Bonus</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
                    <span className="text-sm text-muted-foreground">
                      {' '}({formatPrice(pkg.price / (pkg.credits + pkg.bonus_credits))}/kredit)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant={pkg.is_featured ? 'default' : 'outline'}
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={processingPackage !== null}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {processingPackage === pkg.id ? 'Memproses...' : 'Bayar Online'}
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setSelectedTransferPkg(pkg)}
                    >
                      <Banknote className="mr-2 h-4 w-4" />
                      Transfer Manual BNI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
};

export default Credits;
