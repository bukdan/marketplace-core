import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, Banknote, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusColors: Record<string, string> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

export default function AdminTopupRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewReq, setViewReq] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('credit_topup_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!viewReq) return;
    setProcessing(true);

    try {
      // Update request status
      const { error } = await supabase
        .from('credit_topup_requests')
        .update({
          status: action,
          admin_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', viewReq.id);

      if (error) throw error;

      // If approved, add credits
      if (action === 'approved') {
        const totalCredits = viewReq.credits_amount + (viewReq.bonus_credits || 0);
        const { data: result } = await supabase.rpc('admin_add_credits', {
          p_user_id: viewReq.user_id,
          p_amount: totalCredits,
          p_description: `Transfer Manual BNI - ${formatCurrency(viewReq.amount)}`,
          p_admin_id: user?.id,
        });

        // Notify user
        await supabase.from('notifications').insert({
          user_id: viewReq.user_id,
          title: 'Top Up Kredit Berhasil',
          message: `${totalCredits} kredit telah ditambahkan ke akun Anda dari transfer manual.`,
          type: 'credit',
        });
      } else {
        // Notify rejection
        await supabase.from('notifications').insert({
          user_id: viewReq.user_id,
          title: 'Top Up Kredit Ditolak',
          message: adminNotes || 'Permintaan top up kredit Anda ditolak. Silakan hubungi support.',
          type: 'credit',
        });
      }

      toast({ title: 'Berhasil', description: action === 'approved' ? 'Kredit berhasil ditambahkan' : 'Permintaan ditolak' });
      setViewReq(null);
      setAdminNotes('');
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memproses' });
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout title="Verifikasi Transfer Manual" description="Kelola permintaan top up kredit via transfer bank">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</p>
              <p className="text-sm text-muted-foreground">Disetujui</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</p>
              <p className="text-sm text-muted-foreground">Ditolak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Daftar Permintaan ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Kredit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada permintaan</TableCell></TableRow>
              ) : (
                requests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(r.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.user_id?.slice(0, 8)}...</TableCell>
                    <TableCell>{formatCurrency(r.amount)}</TableCell>
                    <TableCell>{r.credits_amount}{r.bonus_credits > 0 && <span className="text-primary"> +{r.bonus_credits}</span>}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[r.status] as any || 'secondary'}>
                        {r.status === 'pending' ? 'Menunggu' : r.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.proof_image_url ? (
                        <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">Lihat</a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setViewReq(r); setAdminNotes(r.admin_notes || ''); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!viewReq} onOpenChange={() => setViewReq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Permintaan Top Up</DialogTitle>
          </DialogHeader>
          {viewReq && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono">{viewReq.user_id?.slice(0, 12)}...</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal</p>
                  <p>{format(new Date(viewReq.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jumlah Transfer</p>
                  <p className="font-bold text-lg">{formatCurrency(viewReq.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kredit</p>
                  <p className="font-bold">{viewReq.credits_amount}{viewReq.bonus_credits > 0 && ` + ${viewReq.bonus_credits} bonus`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bank</p>
                  <p>{viewReq.bank_name} - {viewReq.account_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusColors[viewReq.status] as any || 'secondary'}>
                    {viewReq.status}
                  </Badge>
                </div>
              </div>

              {viewReq.proof_image_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bukti Transfer</p>
                  <img src={viewReq.proof_image_url} alt="Bukti transfer" className="rounded-lg border max-h-64 w-full object-contain" />
                </div>
              )}

              {viewReq.status === 'pending' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Catatan Admin</p>
                    <Textarea 
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="Opsional..."
                      rows={2}
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="destructive" onClick={() => handleAction('rejected')} disabled={processing}>
                      <XCircle className="mr-2 h-4 w-4" /> Tolak
                    </Button>
                    <Button onClick={() => handleAction('approved')} disabled={processing}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Setujui & Tambah Kredit
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
