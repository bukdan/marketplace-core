import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Shield, Bell, Database, Coins, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [initialCredits, setInitialCredits] = useState(500);
  const [savingCredits, setSavingCredits] = useState(false);

  useEffect(() => {
    fetchInitialCredits();
  }, []);

  const fetchInitialCredits = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'initial_user_credits')
      .single();
    if (data) {
      const val = (data.value as any)?.amount;
      if (val) setInitialCredits(Number(val));
    }
  };

  const saveInitialCredits = async () => {
    setSavingCredits(true);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: { amount: initialCredits } as any })
      .eq('key', 'initial_user_credits');
    setSavingCredits(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan pengaturan' });
    } else {
      toast({ title: 'Berhasil', description: `Kredit awal user baru diatur ke ${initialCredits}` });
    }
  };

  return (
    <AdminLayout title="Admin Settings" description="Konfigurasi platform">
      <div className="grid gap-6">
        {/* Initial Credits Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Kredit User Baru
            </CardTitle>
            <CardDescription>Jumlah kredit yang diberikan otomatis saat user baru mendaftar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="space-y-2 flex-1 max-w-xs">
                <Label>Jumlah Kredit Awal</Label>
                <Input
                  type="number"
                  min={0}
                  max={100000}
                  value={initialCredits}
                  onChange={e => setInitialCredits(Number(e.target.value))}
                />
              </div>
              <Button onClick={saveInitialCredits} disabled={savingCredits}>
                <Save className="h-4 w-4 mr-2" />
                {savingCredits ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Setiap user baru yang mendaftar akan otomatis mendapatkan {initialCredits} kredit.
            </p>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>Konfigurasi umum platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan untuk menonaktifkan akses publik
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve KYC Verified Listings</Label>
                <p className="text-sm text-muted-foreground">
                  Listing dari user KYC verified langsung aktif
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Platform Fee (%)</Label>
              <Input type="number" placeholder="5" defaultValue="5" className="max-w-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Pengaturan keamanan platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  User harus verifikasi email untuk login
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable 2FA for Admin</Label>
                <p className="text-sm text-muted-foreground">
                  Wajibkan 2FA untuk akses admin
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Pengaturan notifikasi admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Report Notification</Label>
                <p className="text-sm text-muted-foreground">
                  Email ketika ada laporan baru
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>New KYC Submission</Label>
                <p className="text-sm text-muted-foreground">
                  Email ketika ada pengajuan KYC baru
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Informasi database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Database dikelola oleh Lovable Cloud. Untuk akses langsung ke database, gunakan Cloud View.
            </p>
            <Button className="mt-4" variant="outline" disabled>
              Open Cloud View
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
