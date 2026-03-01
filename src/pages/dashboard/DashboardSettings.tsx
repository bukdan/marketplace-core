import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useKyc } from '@/hooks/useKyc';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, CreditCard, LogOut, FileCheck, Loader2, CheckCircle, Clock, XCircle, Upload, Pencil } from 'lucide-react';

export default function DashboardSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DashboardLayout title="Pengaturan" description="Kelola preferensi akun Anda">
      <div className="max-w-2xl space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
            <CardDescription>Detail akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="secondary">Terverifikasi</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">ID Akun</p>
                <p className="text-sm text-muted-foreground font-mono">{user?.id?.slice(0, 8)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikasi
            </CardTitle>
            <CardDescription>Atur preferensi notifikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif">Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">Terima update via email</p>
              </div>
              <Switch id="email-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promo-notif">Promo & Penawaran</Label>
                <p className="text-sm text-muted-foreground">Info promo terbaru</p>
              </div>
              <Switch id="promo-notif" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="chat-notif">Notifikasi Chat</Label>
                <p className="text-sm text-muted-foreground">Pesan dari pembeli/penjual</p>
              </div>
              <Switch id="chat-notif" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pembayaran
            </CardTitle>
            <CardDescription>Kelola metode pembayaran dan kredit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={() => navigate('/credits')}>
              Kelola Kredit
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/wallet')}>
              Lihat Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
            <CardDescription>Tindakan yang tidak bisa dibatalkan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Keluar dari Akun
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
