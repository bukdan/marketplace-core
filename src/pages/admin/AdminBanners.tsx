import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Image, MoreHorizontal, CheckCircle, XCircle, Pause, Play,
  Plus, Trash2, Eye, MousePointerClick, TrendingUp, Upload,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  active: 'bg-green-500/10 text-green-600 border-green-200',
  paused: 'bg-gray-500/10 text-gray-600 border-gray-200',
  expired: 'bg-red-500/10 text-red-600 border-red-200',
  rejected: 'bg-red-500/10 text-red-600 border-red-200',
};

const POSITIONS = [
  { value: 'hero', label: 'Header / Hero' },
  { value: 'footer', label: 'Footer' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'inline', label: 'Inline' },
];

const PRICING_MODELS = [
  { value: 'cpc', label: 'CPC (Cost Per Click)' },
  { value: 'cpm', label: 'CPM (Cost Per 1000 Views)' },
  { value: 'flat', label: 'Flat Rate' },
];

interface BannerForm {
  title: string;
  target_url: string;
  position: string;
  pricing_model: string;
  budget_total: string;
  cost_per_click: string;
  cost_per_mille: string;
  starts_at: string;
  ends_at: string;
  priority: string;
}

const emptyForm: BannerForm = {
  title: '',
  target_url: '',
  position: 'inline',
  pricing_model: 'cpc',
  budget_total: '100000',
  cost_per_click: '500',
  cost_per_mille: '5000',
  starts_at: new Date().toISOString().slice(0, 10),
  ends_at: '',
  priority: '0',
};

export default function AdminBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('banners')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    setBanners(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = {
    total: banners.length,
    active: banners.filter(b => b.status === 'active').length,
    totalImpressions: banners.reduce((s, b) => s + (b.impressions || 0), 0),
    totalClicks: banners.reduce((s, b) => s + (b.clicks || 0), 0),
    totalRevenue: banners.reduce((s, b) => s + (b.budget_spent || 0), 0),
  };

  const filteredBanners = tab === 'all' ? banners : banners.filter(b => b.status === tab);

  const updateStatus = async (id: string, status: string) => {
    const updateData: any = { status: status as any };
    if (status === 'active') {
      updateData.approved_at = new Date().toISOString();
    }
    const { error } = await supabase.from('banners').update(updateData).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status' });
    } else {
      toast({ title: 'Berhasil', description: `Banner status: ${status}` });
      fetchData();
    }
  };

  const softDelete = async (id: string) => {
    const { error } = await supabase.from('banners').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus banner' });
    } else {
      toast({ title: 'Berhasil', description: 'Banner dihapus' });
      setDeleteConfirm(null);
      fetchData();
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({
      title: b.title || '',
      target_url: b.target_url || '',
      position: b.position || 'inline',
      pricing_model: b.pricing_model || 'cpc',
      budget_total: String(b.budget_total || 0),
      cost_per_click: String(b.cost_per_click || 500),
      cost_per_mille: String(b.cost_per_mille || 5000),
      starts_at: b.starts_at ? b.starts_at.slice(0, 10) : '',
      ends_at: b.ends_at ? b.ends_at.slice(0, 10) : '',
      priority: String(b.priority || 0),
    });
    setImageFile(null);
    setImagePreview(b.image_url || null);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title || !form.target_url) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title dan Target URL wajib diisi' });
      return;
    }
    if (!editingId && !imageFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gambar banner wajib diupload' });
      return;
    }

    setSaving(true);
    try {
      let image_url = editingId ? (banners.find(b => b.id === editingId)?.image_url || '') : '';

      // Upload image if new file selected
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `banners/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('banner-images').upload(path, imageFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('banner-images').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload: any = {
        title: form.title,
        target_url: form.target_url,
        image_url,
        position: form.position as any,
        pricing_model: form.pricing_model as any,
        budget_total: Number(form.budget_total) || 0,
        cost_per_click: Number(form.cost_per_click) || 500,
        cost_per_mille: Number(form.cost_per_mille) || 5000,
        starts_at: form.starts_at || new Date().toISOString(),
        ends_at: form.ends_at || null,
        priority: Number(form.priority) || 0,
      };

      if (editingId) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Banner diperbarui' });
      } else {
        payload.user_id = user.id;
        payload.status = 'active' as any;
        const { error } = await supabase.from('banners').insert(payload);
        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Banner dibuat' });
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Gagal menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const ctr = (clicks: number, impressions: number) => {
    if (!impressions) return '0%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  return (
    <AdminLayout title="Banner Management" description="Kelola iklan banner platform">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Image className="h-3.5 w-3.5" /> Total Banner
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle className="h-3.5 w-3.5" /> Aktif
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Eye className="h-3.5 w-3.5" /> Total Views
            </div>
            <p className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <MousePointerClick className="h-3.5 w-3.5" /> Total Clicks
            </div>
            <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Revenue
            </div>
            <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Daftar Banner ({filteredBanners.length})
          </CardTitle>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Buat Banner
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="paused">Dijeda</TabsTrigger>
              <TabsTrigger value="rejected">Ditolak</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredBanners.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Tidak ada banner</TableCell></TableRow>
              ) : (
                filteredBanners.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.image_url ? (
                        <img src={b.image_url} alt={b.title} className="h-12 w-20 object-cover rounded border" />
                      ) : (
                        <div className="h-12 w-20 bg-muted rounded border flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">{b.title}</TableCell>
                    <TableCell><Badge variant="outline">{b.position}</Badge></TableCell>
                    <TableCell className="uppercase text-xs">{b.pricing_model}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatCurrency(b.budget_spent)} / {formatCurrency(b.budget_total)}</div>
                        <div className="h-1.5 bg-muted rounded-full mt-1 w-20">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, b.budget_total ? (b.budget_spent / b.budget_total) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div>{(b.impressions || 0).toLocaleString()} views</div>
                        <div>{(b.clicks || 0).toLocaleString()} clicks</div>
                        <div className="text-muted-foreground">CTR: {ctr(b.clicks || 0, b.impressions || 0)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[b.status] || ''}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(b.starts_at), 'dd MMM yy', { locale: idLocale })}
                      {b.ends_at && ` - ${format(new Date(b.ends_at), 'dd MMM yy', { locale: idLocale })}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(b)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {b.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => updateStatus(b.id, 'active')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(b.id, 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {b.status === 'active' && (
                            <DropdownMenuItem onClick={() => updateStatus(b.id, 'paused')}>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </DropdownMenuItem>
                          )}
                          {b.status === 'paused' && (
                            <DropdownMenuItem onClick={() => updateStatus(b.id, 'active')}>
                              <Play className="mr-2 h-4 w-4" /> Resume
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeleteConfirm(b.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Banner' : 'Buat Banner Baru'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Perbarui informasi banner iklan' : 'Tambah banner iklan baru ke platform'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Judul Banner *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nama iklan..." />
            </div>
            <div>
              <Label>Target URL *</Label>
              <Input value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>Gambar Banner *</Label>
              <div className="mt-1">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-24 w-full object-cover rounded border mb-2" />
                )}
                <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{imageFile ? imageFile.name : 'Pilih gambar...'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Posisi</Label>
                <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Model Harga</Label>
                <Select value={form.pricing_model} onValueChange={v => setForm(f => ({ ...f, pricing_model: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRICING_MODELS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Budget Total</Label>
                <Input type="number" value={form.budget_total} onChange={e => setForm(f => ({ ...f, budget_total: e.target.value }))} />
              </div>
              <div>
                <Label>CPC (Rp)</Label>
                <Input type="number" value={form.cost_per_click} onChange={e => setForm(f => ({ ...f, cost_per_click: e.target.value }))} />
              </div>
              <div>
                <Label>CPM (Rp)</Label>
                <Input type="number" value={form.cost_per_mille} onChange={e => setForm(f => ({ ...f, cost_per_mille: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Mulai</Label>
                <Input type="date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} />
              </div>
              <div>
                <Label>Selesai</Label>
                <Input type="date" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
              </div>
              <div>
                <Label>Prioritas</Label>
                <Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Simpan' : 'Buat Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Banner?</DialogTitle>
            <DialogDescription>Banner akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && softDelete(deleteConfirm)}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
