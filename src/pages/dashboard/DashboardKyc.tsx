import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useKyc } from '@/hooks/useKyc';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';

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
  const [form, setForm] = useState({ ktp_number: '', ktp_image_url: '', selfie_image_url: '' });

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
    await submitKyc.mutateAsync({
      ktp_number: form.ktp_number || kyc?.ktp_number || '',
      ktp_image_url: form.ktp_image_url || kyc?.ktp_image_url || '',
      selfie_image_url: form.selfie_image_url || kyc?.selfie_image_url || '',
    });
  };

  return (
    <DashboardLayout title="Verifikasi KYC" description="Verifikasi identitas untuk keamanan akun">
      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-6">
          <div className={`rounded-full p-3 bg-muted`}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Formulir Verifikasi
            </CardTitle>
            <CardDescription>Upload dokumen identitas Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Nomor KTP</Label>
              <Input
                value={form.ktp_number}
                onChange={(e) => setForm(p => ({ ...p, ktp_number: e.target.value }))}
                placeholder="3171XXXXXXXXXXXX"
                maxLength={16}
              />
            </div>
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
            <Button
              onClick={handleSubmit}
              disabled={submitKyc.isPending || !form.ktp_number}
              className="w-full"
            >
              {submitKyc.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Verifikasi
            </Button>
          </CardContent>
        </Card>
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
