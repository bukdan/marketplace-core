import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Edit, Sparkles, Search, Crown, LayoutDashboard } from 'lucide-react';

const boostIconMap: Record<string, React.ElementType> = {
  highlight: Sparkles,
  top_search: Search,
  premium: Crown,
};

export default function AdminBoostSettings() {
  const { toast } = useToast();
  const [boostTypes, setBoostTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    credits_per_day: 0,
    multiplier: 1,
    is_active: true,
  });

  // Platform settings for credit costs
  const [settings, setSettings] = useState<any[]>([]);
  const [editSetting, setEditSetting] = useState<any>(null);
  const [settingValue, setSettingValue] = useState('');

  // Premium homepage setting
  const [premiumCount, setPremiumCount] = useState(6);
  const [savingPremiumCount, setSavingPremiumCount] = useState(false);

  // Active boosts
  const [activeBoosts, setActiveBoosts] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: types }, { data: platformSettings }, { data: boosts }] = await Promise.all([
      supabase.from('boost_types').select('*').order('credits_per_day', { ascending: true }),
      supabase.from('platform_settings').select('*').order('key', { ascending: true }),
      supabase
        .from('listing_boosts')
        .select('*, listings(title)')
        .eq('status', 'active')
        .gte('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    setBoostTypes(types || []);
    setActiveBoosts(boosts || []);

    // Filter credit-related settings
    const creditSettings = (platformSettings || []).filter(
      (s: any) => (s.key.includes('credit') || s.key.includes('cost') || s.key.includes('fee') || s.key.includes('initial')) && s.key !== 'premium_homepage_count'
    );
    setSettings(creditSettings);

    // Get premium homepage count
    const premSetting = (platformSettings || []).find((s: any) => s.key === 'premium_homepage_count');
    if (premSetting?.value && typeof premSetting.value === 'object' && 'amount' in premSetting.value) {
      setPremiumCount((premSetting.value as any).amount);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      credits_per_day: item.credits_per_day,
      multiplier: item.multiplier || 1,
      is_active: item.is_active !== false,
    });
  };

  const saveBoostType = async () => {
    if (!editItem) return;
    const { error } = await supabase
      .from('boost_types')
      .update({
        name: form.name,
        description: form.description,
        credits_per_day: form.credits_per_day,
        multiplier: form.multiplier,
        is_active: form.is_active,
      })
      .eq('id', editItem.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' });
    } else {
      toast({ title: 'Berhasil', description: 'Tipe boost diperbarui' });
      setEditItem(null);
      fetchData();
    }
  };

  const openSettingEdit = (setting: any) => {
    setEditSetting(setting);
    setSettingValue(JSON.stringify(setting.value, null, 2));
  };

  const saveSetting = async () => {
    if (!editSetting) return;
    try {
      const parsed = JSON.parse(settingValue);
      const { error } = await supabase
        .from('platform_settings')
        .update({ value: parsed })
        .eq('id', editSetting.id);

      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Pengaturan diperbarui' });
      setEditSetting(null);
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Format JSON tidak valid' });
    }
  };

  const savePremiumCount = async () => {
    setSavingPremiumCount(true);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: { amount: premiumCount } })
      .eq('key', 'premium_homepage_count');

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan' });
    } else {
      toast({ title: 'Berhasil', description: `Jumlah card premium di homepage: ${premiumCount}` });
    }
    setSavingPremiumCount(false);
  };

  return (
    <AdminLayout title="Boost & Credit Settings" description="Kelola tipe boost dan pengaturan kredit">
      {/* Premium Homepage Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Pengaturan Iklan Premium Homepage
          </CardTitle>
          <CardDescription>Atur jumlah card iklan premium yang tampil di halaman utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Jumlah Card Premium di Homepage</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={premiumCount}
                onChange={(e) => setPremiumCount(+e.target.value)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">Iklan dengan boost "Premium" aktif akan muncul di section khusus setelah kategori di halaman utama.</p>
            </div>
            <Button onClick={savePremiumCount} disabled={savingPremiumCount}>
              {savingPremiumCount ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Boosts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Boost Aktif ({activeBoosts.length})
          </CardTitle>
          <CardDescription>Daftar iklan yang sedang di-boost</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Iklan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kredit</TableHead>
                <TableHead>Berakhir</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBoosts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada boost aktif</TableCell></TableRow>
              ) : (
                activeBoosts.map((boost) => {
                  const Icon = boostIconMap[boost.boost_type] || Zap;
                  return (
                    <TableRow key={boost.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {(boost.listings as any)?.title || boost.listing_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <Badge variant="outline">{boost.boost_type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{boost.credits_used}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(boost.ends_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Boost Types */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Tipe Boost ({boostTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kredit/Hari</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : boostTypes.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada tipe boost</TableCell></TableRow>
              ) : (
                boostTypes.map((bt) => {
                  const Icon = boostIconMap[bt.type] || Zap;
                  return (
                    <TableRow key={bt.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <Badge variant="outline">{bt.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{bt.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{bt.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{bt.credits_per_day} kredit</Badge>
                      </TableCell>
                      <TableCell>{bt.multiplier || 1}x</TableCell>
                      <TableCell>
                        <Badge variant={bt.is_active !== false ? 'default' : 'secondary'}>
                          {bt.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(bt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Platform Credit Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Pengaturan Kredit Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada pengaturan kredit</TableCell></TableRow>
              ) : (
                settings.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.key}</TableCell>
                    <TableCell className="text-muted-foreground">{s.description || '-'}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {JSON.stringify(s.value)}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openSettingEdit(s)}>
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

      {/* Edit Boost Type Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tipe Boost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Kredit/Hari</Label><Input type="number" value={form.credits_per_day} onChange={e => setForm({ ...form, credits_per_day: +e.target.value })} /></div>
              <div><Label>Multiplier</Label><Input type="number" step="0.1" value={form.multiplier} onChange={e => setForm({ ...form, multiplier: +e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
            <Button onClick={saveBoostType}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Setting Dialog */}
      <Dialog open={!!editSetting} onOpenChange={() => setEditSetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengaturan: {editSetting?.key}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nilai (JSON)</Label>
              <Textarea
                className="font-mono text-sm"
                rows={4}
                value={settingValue}
                onChange={e => setSettingValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSetting(null)}>Batal</Button>
            <Button onClick={saveSetting}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
