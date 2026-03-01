import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, FolderTree, Layers } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number | null;
  listing_count: number;
  created_at: string | null;
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    parent_id: '' as string | null,
    is_active: true,
    is_featured: false,
    sort_order: 0,
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      toast.error('Gagal memuat kategori');
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      icon_url: '',
      parent_id: parentId || null,
      is_active: true,
      is_featured: false,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon_url: cat.icon_url || '',
      parent_id: cat.parent_id || null,
      is_active: cat.is_active,
      is_featured: cat.is_featured,
      sort_order: cat.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editing ? f.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Nama dan slug wajib diisi');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description || null,
      icon_url: form.icon_url || null,
      parent_id: form.parent_id || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      sort_order: form.sort_order,
    };

    if (editing) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editing.id);
      if (error) {
        toast.error('Gagal mengupdate kategori: ' + error.message);
        return;
      }
      toast.success('Kategori berhasil diupdate');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        toast.error('Gagal menambah kategori: ' + error.message);
        return;
      }
      toast.success('Kategori berhasil ditambahkan');
    }

    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string, name: string) => {
    const subs = getSubcategories(id);
    if (subs.length > 0) {
      toast.error(`Tidak bisa menghapus "${name}" karena masih memiliki subkategori`);
      return;
    }

    if (!confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus: ' + error.message);
      return;
    }
    toast.success('Kategori dihapus');
    fetchCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id);
    fetchCategories();
  };

  return (
    <AdminLayout title="Kategori" description="Kelola kategori dan subkategori produk">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FolderTree className="h-6 w-6" />
              Manajemen Kategori
            </h1>
            <p className="text-muted-foreground text-sm">
              Kelola kategori dan subkategori produk
            </p>
          </div>
          <Button onClick={() => openCreate()} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Memuat...</div>
        ) : parentCategories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Belum ada kategori. Klik "Tambah Kategori" untuk memulai.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {parentCategories.map((parent) => {
              const subs = getSubcategories(parent.id);
              return (
                <Card key={parent.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        {parent.name}
                        {!parent.is_active && (
                          <Badge variant="secondary" className="text-xs">Nonaktif</Badge>
                        )}
                        {parent.is_featured && (
                          <Badge variant="default" className="text-xs">Featured</Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({parent.listing_count} listing)
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreate(parent.id)}
                          className="gap-1 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                          Sub
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(parent)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={parent.is_active}
                          onCheckedChange={() => toggleActive(parent.id, parent.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(parent.id, parent.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {subs.length > 0 && (
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-center">Listing</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subs.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-medium">{sub.name}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {sub.slug}
                              </TableCell>
                              <TableCell className="text-center">{sub.listing_count}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={sub.is_active}
                                  onCheckedChange={() => toggleActive(sub.id, sub.is_active)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEdit(sub)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(sub.id, sub.name)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Kategori' : form.parent_id ? 'Tambah Subkategori' : 'Tambah Kategori'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nama *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nama kategori"
                />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="slug-kategori"
                />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Deskripsi kategori"
                  rows={2}
                />
              </div>
              <div>
                <Label>Parent Kategori</Label>
                <Select
                  value={form.parent_id || 'none'}
                  onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === 'none' ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih parent (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Tidak ada (Kategori utama)</SelectItem>
                    {parentCategories
                      .filter((c) => c.id !== editing?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Icon URL</Label>
                <Input
                  value={form.icon_url}
                  onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                  />
                  <Label>Aktif</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                  />
                  <Label>Featured</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                {editing ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
