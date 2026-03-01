import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bell, Megaphone, Users } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AdminBroadcast() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [userCount, setUserCount] = useState(0);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'promo',
  });

  const notifTypes = [
    { value: 'promo', label: 'Promo & Diskon', icon: '🎁' },
    { value: 'announcement', label: 'Pengumuman', icon: '📢' },
    { value: 'update', label: 'Update Platform', icon: '🔄' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'event', label: 'Event', icon: '🎉' },
  ];

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('channel', 'broadcast')
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Deduplicate by title+created_at (broadcasts create multiple rows)
    const seen = new Set<string>();
    const unique = (data || []).filter(n => {
      const key = `${n.title}_${n.created_at}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setHistory(unique);
    setLoadingHistory(false);
  };

  const fetchUserCount = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    setUserCount(count || 0);
  };

  useEffect(() => {
    fetchHistory();
    fetchUserCount();
  }, []);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Judul dan pesan wajib diisi' });
      return;
    }

    setSending(true);
    try {
      // Get all active user IDs
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('is_active', true);

      if (!profiles || profiles.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Tidak ada user aktif' });
        setSending(false);
        return;
      }

      const now = new Date().toISOString();
      const notifications = profiles.map(p => ({
        user_id: p.user_id,
        title: form.title,
        message: form.message,
        type: form.type,
        channel: 'broadcast',
        is_read: false,
        data: { broadcast: true, sent_by: user?.id },
        created_at: now,
      }));

      // Insert in batches of 100
      for (let i = 0; i < notifications.length; i += 100) {
        const batch = notifications.slice(i, i + 100);
        const { error } = await supabase.from('notifications').insert(batch);
        if (error) throw error;
      }

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'broadcast_notification',
        user_id: user?.id,
        entity_type: 'notification',
        details: { title: form.title, type: form.type, recipients: profiles.length },
      });

      toast({ title: 'Berhasil!', description: `Notifikasi dikirim ke ${profiles.length} pengguna` });
      setForm({ title: '', message: '', type: 'promo' });
      fetchHistory();
    } catch (error) {
      console.error('Broadcast error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengirim notifikasi' });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout title="Broadcast Notifikasi" description="Kirim notifikasi massal ke pengguna">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Buat Notifikasi Baru
              </CardTitle>
              <CardDescription>
                Notifikasi akan dikirim ke <strong>{userCount}</strong> pengguna aktif
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipe Notifikasi</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notifTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Judul</Label>
                <Input 
                  placeholder="Contoh: Promo Akhir Tahun! Diskon 50% Kredit"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Pesan</Label>
                <Textarea 
                  placeholder="Tulis pesan notifikasi..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{form.message.length}/500</p>
              </div>
              <Button onClick={handleSend} disabled={sending} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Mengirim...' : `Kirim ke ${userCount} Pengguna`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userCount}</p>
                <p className="text-sm text-muted-foreground">User Aktif</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-sm text-muted-foreground">Broadcast Terkirim</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Riwayat Broadcast</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Pesan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHistory ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada broadcast</TableCell></TableRow>
              ) : (
                history.map(n => (
                  <TableRow key={n.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(n.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{n.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{n.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
