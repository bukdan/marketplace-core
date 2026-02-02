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
import { Check, X, Eye, Image } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface KycData {
  id: string;
  user_id: string;
  ktp_number: string | null;
  ktp_image_url: string | null;
  selfie_image_url: string | null;
  status: string;
  submitted_at: string | null;
  created_at: string;
  profile?: { name: string | null; email: string | null };
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

      // Fetch profile data for each KYC
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
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyetujui KYC',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'KYC telah disetujui',
      });
      fetchKycData();
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menolak KYC',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'KYC telah ditolak',
      });
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
          <TableHead>No. KTP</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Submit</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              Tidak ada data KYC
            </TableCell>
          </TableRow>
        ) : (
          data.map((kyc) => (
            <TableRow key={kyc.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{kyc.profile?.name || 'No Name'}</p>
                  <p className="text-xs text-muted-foreground">{kyc.profile?.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {kyc.ktp_number || '-'}
              </TableCell>
              <TableCell>{getStatusBadge(kyc.status || 'pending')}</TableCell>
              <TableCell>
                {kyc.submitted_at
                  ? format(new Date(kyc.submitted_at), 'dd MMM yyyy', { locale: idLocale })
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewDialog({ open: true, kyc })}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {kyc.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(kyc.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
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
          <CardTitle>Daftar KYC</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {pendingKyc.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingKyc.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processed">Processed ({processedKyc.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <KycTable data={pendingKyc} />
            </TabsContent>
            <TabsContent value="processed" className="mt-4">
              <KycTable data={processedKyc} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, kyc: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail KYC</DialogTitle>
            <DialogDescription>
              {viewDialog.kyc?.profile?.name} - {viewDialog.kyc?.profile?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Nomor KTP</p>
              <p className="font-mono bg-muted p-2 rounded">{viewDialog.kyc?.ktp_number || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Foto KTP</p>
                {viewDialog.kyc?.ktp_image_url ? (
                  <img
                    src={viewDialog.kyc.ktp_image_url}
                    alt="KTP"
                    className="w-full rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Foto Selfie</p>
                {viewDialog.kyc?.selfie_image_url ? (
                  <img
                    src={viewDialog.kyc.selfie_image_url}
                    alt="Selfie"
                    className="w-full rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog({ open: false, kyc: null })}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, kycId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak KYC</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk verifikasi KYC ini.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, kycId: null })}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
