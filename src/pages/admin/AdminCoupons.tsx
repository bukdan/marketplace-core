import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Ticket, Trash2, ToggleLeft, ToggleRight, RefreshCw, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Coupon {
  id: string;
  code: string;
  credits_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export default function AdminCoupons() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    credits_amount: '',
    max_uses: '1',
    expires_at: '',
    description: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat kupon' });
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 12 }, (_, i) =>
      i === 4 || i === 8 ? '-' : chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    setForm(f => ({ ...f, code }));
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.credits_amount) {
      toast({ variant: 'destructive', title: 'Error', description: 'Kode dan jumlah kredit wajib diisi' });
      return;
    }
    const amount = parseInt(form.credits_amount);
    const maxUses = parseInt(form.max_uses) || 1;
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Jumlah kredit tidak valid' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('coupons').insert({
        code: form.code.toUpperCase().trim(),
        credits_amount: amount,
        max_uses: maxUses,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        description: form.description || null,
        created_by: user?.id,
      });

      if (error) {
        if (error.code === '23505') throw new Error('Kode kupon sudah digunakan, coba kode lain');
        throw error;
      }

      toast({ title: 'Kupon Dibuat', description: `Kupon ${form.code.toUpperCase()} berhasil dibuat` });
      setCreateDialogOpen(false);
      setForm({ code: '', credits_amount: '', max_uses: '1', expires_at: '', description: '' });
      fetchCoupons();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status kupon' });
    } else {
      toast({ title: 'Status Diperbarui' });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  const handleDelete = async () => {
    const coupon = deleteDialogOpen.coupon;
    if (!coupon) return;

    const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus kupon' });
    } else {
      toast({ title: 'Kupon Dihapus' });
      setCoupons(prev => prev.filter(c => c.id !== coupon.id));
    }
    setDeleteDialogOpen({ open: false, coupon: null });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Disalin!', description: `Kode ${code} berhasil disalin` });
  };

  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUsed = coupons.reduce((sum, c) => sum + c.used_count, 0);
  const totalCreditsIssued = coupons.reduce((sum, c) => sum + (c.used_count * c.credits_amount), 0);

  return (
    <AdminLayout title="Manajemen Kupon" description="Buat dan kelola kupon kredit untuk pengguna">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{coupons.length}</p>
              <p className="text-sm text-muted-foreground">Total Kupon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <ToggleRight className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{activeCoupons}</p>
              <p className="text-sm text-muted-foreground">Kupon Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">Cr</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCreditsIssued.toLocaleString('id-ID')}</p>
              <p className="text-sm text-muted-foreground">Total Kredit Diberikan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Kupon</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCoupons}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Kupon
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Kredit</TableHead>
                  <TableHead>Penggunaan</TableHead>
                  <TableHead>Kadaluarsa</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Belum ada kupon. Klik "Buat Kupon" untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                            {coupon.code}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(coupon.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">{coupon.credits_amount.toLocaleString('id-ID')}</span>
                        <span className="text-muted-foreground text-xs ml-1">kredit</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{coupon.used_count}</span>
                          <span className="text-muted-foreground">/ {coupon.max_uses}</span>
                        </div>
                        <div className="h-1.5 w-20 bg-muted rounded-full mt-1">
                          <div
                            className="h-1.5 bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (coupon.used_count / coupon.max_uses) * 100)}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {coupon.expires_at
                          ? format(new Date(coupon.expires_at), 'dd MMM yyyy', { locale: idLocale })
                          : <span className="italic">Tidak ada</span>}
                      </TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">{coupon.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(coupon)}
                            title={coupon.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {coupon.is_active
                              ? <ToggleRight className="h-4 w-4 text-primary" />
                              : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialogOpen({ open: true, coupon })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Buat Kupon Baru
            </DialogTitle>
            <DialogDescription>Isi detail kupon kredit yang akan dibuat</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Kode Kupon *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Contoh: PROMO2025"
                  value={form.code}
                  onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  maxLength={30}
                  className="font-mono uppercase"
                />
                <Button type="button" variant="outline" onClick={generateCode} className="shrink-0">
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jumlah Kredit *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="200"
                  value={form.credits_amount}
                  onChange={(e) => setForm(f => ({ ...f, credits_amount: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Maks. Penggunaan</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.max_uses}
                  onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Kadaluarsa (opsional)</Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Deskripsi (opsional)</Label>
              <Input
                placeholder="Contoh: Kupon promo Hari Kemerdekaan"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1"
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Buat Kupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen.open} onOpenChange={(open) => setDeleteDialogOpen({ open, coupon: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Kupon <strong>{deleteDialogOpen.coupon?.code}</strong> akan dihapus permanen. Riwayat penggunaan yang sudah ada tidak terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
