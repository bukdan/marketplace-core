import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Eye, Image, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface KycData {
  id: string;
  user_id: string;
  full_name: string | null;
  ktp_number: string | null;
  ktp_image_url: string | null;
  selfie_image_url: string | null;
  status: string;
  submitted_at: string | null;
  created_at: string;
  province: string | null;
  city: string | null;
  district: string | null;
  village: string | null;
  full_address: string | null;
  rejection_reason: string | null;
  profile?: { name: string | null; email: string | null };
}

// Komponen untuk menampilkan gambar dari bucket private (signed URL)
function KycImage({ path, alt }: { path: string | null; alt: string }) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) return;
    // Jika sudah URL lengkap
    if (path.startsWith('http')) {
      setUrl(path);
      return;
    }
    // Buat signed URL untuk path di bucket private
    setLoading(true);
    supabase.storage
      .from('kyc-documents')
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (data) setUrl(data.signedUrl);
      })
      .finally(() => setLoading(false));
  }, [path]);

  if (!path) {
    return (
      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
        <Image className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return url ? (
    <img src={url} alt={alt} className="w-full rounded-lg border object-cover max-h-64" />
  ) : (
    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
      <Image className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

export default function AdminKyc() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kycList, setKycList] = useState<KycData[]>([]);
  const [viewDialog, setViewDialog] = useState<{ open: boolean; kyc: KycData | null }>({
    open: false,
    kyc: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; kycId: string | null }>({
    open: false,
    kycId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  const fetchKycData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('kyc_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const userIds = data.map(k => k.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        const enrichedData = data.map(kyc => ({
          ...kyc,
          profile: profiles?.find(p => p.user_id === kyc.user_id),
        }));

        setKycList(enrichedData);
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      approved: 'bg-green-500/10 text-green-600 border-green-200',
      rejected: 'bg-red-500/10 text-red-600 border-red-200',
      not_submitted: 'bg-muted text-muted-foreground',
    };
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      not_submitted: 'Belum Diajukan',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleApprove = async (kycId: string) => {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', kycId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyetujui KYC' });
    } else {
      toast({ title: 'Berhasil', description: 'KYC telah disetujui' });
      fetchKycData();
      setViewDialog({ open: false, kyc: null });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.kycId || !rejectReason.trim()) return;

    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'rejected',
        rejection_reason: rejectReason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', rejectDialog.kycId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menolak KYC' });
    } else {
      toast({ title: 'Berhasil', description: 'KYC telah ditolak' });
      fetchKycData();
    }
    setRejectDialog({ open: false, kycId: null });
    setRejectReason('');
  };

  const pendingKyc = kycList.filter((k) => k.status === 'pending');
  const processedKyc = kycList.filter((k) => k.status !== 'pending');

  const KycTable = ({ data }: { data: typeof kycList }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pengguna</TableHead>
          <TableHead>Nama KTP</TableHead>
          <TableHead>No. KTP</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Submit</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Tidak ada data KYC
            </TableCell>
          </TableRow>
        ) : (
          data.map((kyc) => (
            <TableRow key={kyc.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{kyc.profile?.name || '-'}</p>
                  <p className="text-xs text-muted-foreground">{kyc.profile?.email}</p>
                </div>
              </TableCell>
              <TableCell>{kyc.full_name || '-'}</TableCell>
              <TableCell className="font-mono text-sm">{kyc.ktp_number || '-'}</TableCell>
              <TableCell>{getStatusBadge(kyc.status || 'not_submitted')}</TableCell>
              <TableCell>
                {kyc.submitted_at
                  ? format(new Date(kyc.submitted_at), 'dd MMM yyyy', { locale: idLocale })
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setViewDialog({ open: true, kyc })}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {kyc.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary"
                        onClick={() => handleApprove(kyc.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRejectDialog({ open: true, kycId: kyc.id })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout title="KYC Verifications" description="Verifikasi identitas pengguna">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Verifikasi KYC</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Menunggu
                  {pendingKyc.length > 0 && (
                    <Badge variant="destructive" className="ml-2">{pendingKyc.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="processed">Selesai ({processedKyc.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                <KycTable data={pendingKyc} />
              </TabsContent>
              <TabsContent value="processed" className="mt-4">
                <KycTable data={processedKyc} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => !open && setViewDialog({ open: false, kyc: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail KYC</DialogTitle>
            <DialogDescription>
              {viewDialog.kyc?.profile?.name} — {viewDialog.kyc?.profile?.email}
            </DialogDescription>
          </DialogHeader>

          {viewDialog.kyc && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(viewDialog.kyc.status)}
              </div>

              {viewDialog.kyc.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                  <p className="text-sm font-medium text-destructive">Alasan Penolakan:</p>
                  <p className="text-sm text-muted-foreground">{viewDialog.kyc.rejection_reason}</p>
                </div>
              )}

              {/* Data Identitas */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Nama Lengkap (KTP)</p>
                  <p className="font-medium">{viewDialog.kyc.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nomor KTP</p>
                  <p className="font-mono font-medium">{viewDialog.kyc.ktp_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provinsi</p>
                  <p className="font-medium">{viewDialog.kyc.province || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kabupaten/Kota</p>
                  <p className="font-medium">{viewDialog.kyc.city || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kecamatan</p>
                  <p className="font-medium">{viewDialog.kyc.district || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Desa/Kelurahan</p>
                  <p className="font-medium">{viewDialog.kyc.village || '-'}</p>
                </div>
              </div>
              {viewDialog.kyc.full_address && (
                <div>
                  <p className="text-xs text-muted-foreground">Alamat Lengkap</p>
                  <p className="font-medium">{viewDialog.kyc.full_address}</p>
                </div>
              )}

              {/* Dokumen */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Foto KTP</p>
                  <KycImage path={viewDialog.kyc.ktp_image_url} alt="KTP" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Foto Selfie + KTP</p>
                  <KycImage path={viewDialog.kyc.selfie_image_url} alt="Selfie" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setViewDialog({ open: false, kyc: null })}>
              Tutup
            </Button>
            {viewDialog.kyc?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewDialog({ open: false, kyc: null });
                    setRejectDialog({ open: true, kycId: viewDialog.kyc!.id });
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Tolak
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleApprove(viewDialog.kyc!.id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Setujui
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, kycId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak KYC</DialogTitle>
            <DialogDescription>Berikan alasan penolakan untuk verifikasi KYC ini.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan... (contoh: foto KTP buram, data tidak sesuai, dll)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, kycId: null })}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Tolak KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
