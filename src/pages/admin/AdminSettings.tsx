import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Shield, Bell, Database } from 'lucide-react';

export default function AdminSettings() {
  return (
    <AdminLayout title="Admin Settings" description="Konfigurasi platform">
      <div className="grid gap-6">
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
