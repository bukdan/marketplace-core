import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUmkmProfile } from '@/hooks/useUmkmProfile';
import { useUmkmSubscriptions } from '@/hooks/useUmkmSubscriptions';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Crown, Zap, Star } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    icon: Zap,
    features: ['Maks 10 produk', 'Halaman toko dasar', 'Dukungan komunitas'],
    recommended: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 99000,
    icon: Star,
    features: ['Maks 50 produk', 'Halaman toko kustom', 'Analitik dasar', 'Prioritas dukungan'],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299000,
    icon: Crown,
    features: ['Produk unlimited', 'Halaman toko premium', 'Analitik lengkap', 'Dukungan prioritas', 'Badge terverifikasi', 'Promosi eksklusif'],
    recommended: false,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function UmkmSubscription() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUmkmProfile();
  const { subscription, isLoading: subLoading, subscribe } = useUmkmSubscriptions();

  if (authLoading || profileLoading || subLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) { navigate('/auth'); return null; }
  if (!profile) { navigate('/umkm/register'); return null; }

  const currentPlan = subscription?.plan || 'free';

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Pilih Paket Langganan</h1>
          <p className="text-muted-foreground">Tingkatkan toko UMKM Anda dengan fitur premium</p>
          {subscription && (
            <Badge className="mt-3" variant="secondary">
              Paket aktif: {plans.find(p => p.id === currentPlan)?.name || currentPlan}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isActive = currentPlan === plan.id;
            return (
              <Card key={plan.id} className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''} ${isActive ? 'ring-2 ring-primary' : ''}`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Rekomendasi</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto mb-3 rounded-full bg-primary/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">
                      {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-muted-foreground">/bulan</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isActive ? 'outline' : plan.recommended ? 'default' : 'outline'}
                    disabled={isActive || subscribe.isPending}
                    onClick={() => subscribe.mutate(plan.id)}
                  >
                    {subscribe.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isActive ? 'Paket Aktif' : plan.price === 0 ? 'Mulai Gratis' : 'Berlangganan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
