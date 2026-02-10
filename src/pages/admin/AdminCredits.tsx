import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Edit, Star } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function AdminCredits() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPkg, setEditPkg] = useState<any>(null);
  const [form, setForm] = useState({ name: '', credits: 0, price: 0, bonus_credits: 0, is_active: true, is_featured: false });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('credit_packages')
      .select('*')
      .order('sort_order', { ascending: true });
    setPackages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (pkg: any) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      bonus_credits: pkg.bonus_credits || 0,
      is_active: pkg.is_active !== false,
      is_featured: pkg.is_featured || false,
    });
  };

  const saveEdit = async () => {
    if (!editPkg) return;
    const { error } = await supabase
      .from('credit_packages')
      .update({
        name: form.name,
        credits: form.credits,
        price: form.price,
        bonus_credits: form.bonus_credits,
        is_active: form.is_active,
        is_featured: form.is_featured,
      })
      .eq('id', editPkg.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' });
    } else {
      toast({ title: 'Berhasil', description: 'Paket kredit diperbarui' });
      setEditPkg(null);
      fetchData();
    }
  };

  return (
    <AdminLayout title="Credits & Packages" description="Kelola paket kredit & harga">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Paket Kredit ({packages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kredit</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : packages.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada paket</TableCell></TableRow>
              ) : (
                packages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.credits}</TableCell>
                    <TableCell>{p.bonus_credits || 0}</TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active !== false ? 'default' : 'secondary'}>
                        {p.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.is_featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editPkg} onOpenChange={() => setEditPkg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paket Kredit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Kredit</Label><Input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: +e.target.value })} /></div>
              <div><Label>Bonus</Label><Input type="number" value={form.bonus_credits} onChange={e => setForm({ ...form, bonus_credits: +e.target.value })} /></div>
              <div><Label>Harga (IDR)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Featured</Label><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPkg(null)}>Batal</Button>
            <Button onClick={saveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
