import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  approved: 'bg-green-500/10 text-green-600 border-green-200',
  rejected: 'bg-red-500/10 text-red-600 border-red-200',
  processed: 'bg-blue-500/10 text-blue-600 border-blue-200',
};

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
    setWithdrawals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const update: any = { status, processed_at: new Date().toISOString(), processed_by: user?.id };
    if (notes) update.notes = notes;

    const { error } = await supabase.from('withdrawals').update(update).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status' });
    } else {
      toast({ title: 'Berhasil', description: `Withdrawal ${status}` });
      fetchData();
    }
    setRejectDialog(null);
    setRejectNote('');
  };

  return (
    <AdminLayout title="Withdrawals Management" description="Approve/reject penarikan saldo">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Daftar Penarikan ({withdrawals.filter(w => w.status === 'pending').length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead>No. Rekening</TableHead>
                <TableHead>Atas Nama</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : withdrawals.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada penarikan</TableCell></TableRow>
              ) : (
                withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.bank_name || '-'}</TableCell>
                    <TableCell className="font-mono">{w.account_number || '-'}</TableCell>
                    <TableCell>{w.account_holder || '-'}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(w.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[w.status] || ''}>{w.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(w.created_at), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                    <TableCell className="text-right">
                      {w.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="default" onClick={() => updateStatus(w.id, 'approved')}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setRejectDialog(w.id)}>
                            <XCircle className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Penarikan</DialogTitle>
            <DialogDescription>Berikan alasan penolakan</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Alasan penolakan..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => rejectDialog && updateStatus(rejectDialog, 'rejected', rejectNote)}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
