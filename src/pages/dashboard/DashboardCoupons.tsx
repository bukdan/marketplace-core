import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { Ticket, Loader2, Gift, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardCoupons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { credits, refetchCredits } = useCredits();
  const [couponCode, setCouponCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim() || !user) return;
    setRedeemLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_coupon', {
        p_code: couponCode.trim().toUpperCase(),
        p_user_id: user.id,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Gagal', description: result.message });
      } else {
        toast({ title: '🎉 Kupon Berhasil!', description: result.message });
        setCouponCode('');
        refetchCredits();
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <DashboardLayout title="Kupon" description="Tukarkan kode kupon untuk mendapatkan kredit gratis">
      {/* Credit Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Saldo Kredit Anda</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{credits?.balance || 0}</p>
          <p className="text-sm text-muted-foreground">Kredit tersedia untuk boost & fitur premium</p>
        </CardContent>
      </Card>

      {/* Redeem Coupon */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-5 w-5 text-primary" />
            Tukar Kupon Kredit
          </CardTitle>
          <CardDescription>Punya kode kupon? Masukkan di sini untuk mendapatkan kredit gratis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Contoh: PROMO2025 atau ADFFDS2311_4"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
              className="font-mono uppercase"
              maxLength={30}
            />
            <Button
              onClick={handleRedeemCoupon}
              disabled={redeemLoading || !couponCode.trim()}
              className="shrink-0"
            >
              {redeemLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="mr-2 h-4 w-4" />
                  Tukar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-primary" />
            Cara Mendapatkan Kupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">1</Badge>
              Ikuti event dan promosi dari UMKM ID di media sosial
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">2</Badge>
              Dapatkan kode kupon dari admin atau program referral
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">3</Badge>
              Masukkan kode kupon di kolom di atas dan klik "Tukar"
            </li>
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
