import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useKyc } from '@/hooks/useKyc';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle, XCircle, Clock, Loader2, AlertTriangle, Upload, MapPin } from 'lucide-react';
import { provinceNames, getCitiesByProvince } from '@/data/indonesiaRegions';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  not_submitted: { label: 'Belum Diajukan', icon: Upload, color: 'text-muted-foreground' },
  pending: { label: 'Menunggu Review', icon: Clock, color: 'text-warning' },
  approved: { label: 'Terverifikasi', icon: CheckCircle, color: 'text-green-600' },
  rejected: { label: 'Ditolak', icon: XCircle, color: 'text-destructive' },
};

export default function DashboardKyc() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { kyc, isLoading, submitKyc } = useKyc();
  const [form, setForm] = useState({
    full_name: '',
    ktp_number: '',
    province: '',
    city: '',
    district: '',
    village: '',
    full_address: '',
    ktp_image_url: '',
    selfie_image_url: '',
  });

  // Auto-fill from profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('name, address')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setForm(prev => ({
          ...prev,
          full_name: prev.full_name || data.name || '',
          full_address: prev.full_address || data.address || '',
        }));
      }
    };
    loadProfile();
  }, [user?.id]);

  // Auto-fill from existing KYC data
  useEffect(() => {
    if (kyc) {
      setForm(prev => ({
        ...prev,
        full_name: kyc.full_name || prev.full_name || '',
        ktp_number: kyc.ktp_number || '',
        province: kyc.province || '',
        city: kyc.city || '',
        district: kyc.district || '',
        village: kyc.village || '',
        full_address: kyc.full_address || prev.full_address || '',
        ktp_image_url: kyc.ktp_image_url || '',
        selfie_image_url: kyc.selfie_image_url || '',
      }));
    }
  }, [kyc]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout title="Verifikasi KYC" description="Verifikasi identitas Anda">
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!user) { navigate('/auth'); return null; }

  const status = kyc?.status || 'not_submitted';
  const config = statusConfig[status] || statusConfig.not_submitted;
  const StatusIcon = config.icon;
  const canSubmit = status === 'not_submitted' || status === 'rejected';

  const handleSubmit = async () => {
    if (!form.full_name || !form.ktp_number || !form.province || !form.city) {
      return;
    }
    await submitKyc.mutateAsync({
      full_name: form.full_name,
      ktp_number: form.ktp_number,
      ktp_image_url: form.ktp_image_url,
      selfie_image_url: form.selfie_image_url,
      province: form.province,
      city: form.city,
      district: form.district,
      village: form.village,
      full_address: form.full_address,
    });
  };

  return (
    <DashboardLayout title="Verifikasi KYC" description="Verifikasi identitas untuk keamanan akun">
      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-muted">
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
          </div>
          <div>
            <p className="text-lg font-semibold">Status Verifikasi</p>
            <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
          </div>
        </CardContent>
      </Card>

      {status === 'rejected' && kyc?.rejection_reason && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Alasan Penolakan</p>
              <p className="text-sm text-muted-foreground">{kyc.rejection_reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'approved' ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-semibold">Identitas Anda Telah Terverifikasi</p>
            <p className="text-sm text-muted-foreground mt-1">Anda dapat mengakses semua fitur platform.</p>
          </CardContent>
        </Card>
      ) : canSubmit ? (
        <div className="space-y-6">
          {/* Data Pribadi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Pribadi
              </CardTitle>
              <CardDescription>Isi data sesuai KTP Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap (sesuai KTP) *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Nama lengkap sesuai KTP"
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor KTP *</Label>
                <Input
                  value={form.ktp_number}
                  onChange={(e) => setForm(p => ({ ...p, ktp_number: e.target.value }))}
                  placeholder="3171XXXXXXXXXXXX"
                  maxLength={16}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alamat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Alamat (sesuai KTP)
              </CardTitle>
              <CardDescription>Pilih lokasi sesuai alamat di KTP Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Provinsi *</Label>
                  <Select
                    value={form.province}
                    onValueChange={(value) => setForm(p => ({ ...p, province: value, city: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinceNames.map((prov) => (
                        <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kabupaten/Kota *</Label>
                  <Select
                    value={form.city}
                    onValueChange={(value) => setForm(p => ({ ...p, city: value }))}
                    disabled={!form.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.province ? "Pilih kabupaten/kota" : "Pilih provinsi dulu"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCitiesByProvince(form.province).map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kecamatan</Label>
                  <Input
                    value={form.district}
                    onChange={(e) => setForm(p => ({ ...p, district: e.target.value }))}
                    placeholder="Masukkan nama kecamatan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desa/Kelurahan</Label>
                  <Input
                    value={form.village}
                    onChange={(e) => setForm(p => ({ ...p, village: e.target.value }))}
                    placeholder="Masukkan nama desa/kelurahan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Textarea
                  value={form.full_address}
                  onChange={(e) => setForm(p => ({ ...p, full_address: e.target.value }))}
                  placeholder="RT/RW, nama jalan, nomor rumah, dll."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dokumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Dokumen
              </CardTitle>
              <CardDescription>Upload foto KTP dan selfie untuk verifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL Foto KTP</Label>
                <Input
                  value={form.ktp_image_url}
                  onChange={(e) => setForm(p => ({ ...p, ktp_image_url: e.target.value }))}
                  placeholder="https://... (upload via storage terlebih dahulu)"
                />
                <p className="text-xs text-muted-foreground">Upload foto KTP yang jelas dan terbaca</p>
              </div>
              <div className="space-y-2">
                <Label>URL Foto Selfie dengan KTP</Label>
                <Input
                  value={form.selfie_image_url}
                  onChange={(e) => setForm(p => ({ ...p, selfie_image_url: e.target.value }))}
                  placeholder="https://... (upload via storage terlebih dahulu)"
                />
                <p className="text-xs text-muted-foreground">Foto selfie sambil memegang KTP</p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={submitKyc.isPending || !form.full_name || !form.ktp_number || !form.province || !form.city}
            className="w-full"
            size="lg"
          >
            {submitKyc.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Verifikasi
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Clock className="h-16 w-16 text-warning mb-4" />
            <p className="text-lg font-semibold">Dokumen Sedang Direview</p>
            <p className="text-sm text-muted-foreground mt-1">Proses verifikasi membutuhkan 1-3 hari kerja.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
