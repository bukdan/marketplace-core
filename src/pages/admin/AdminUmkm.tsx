import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, MoreHorizontal, CheckCircle, XCircle, Store, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface UmkmData {
  id: string;
  umkm_name: string;
  brand_name: string | null;
  city: string | null;
  province: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  owner_id: string;
  phone: string | null;
  email: string | null;
}

export default function AdminUmkm() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [umkms, setUmkms] = useState<UmkmData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUmkms = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('umkm_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUmkms(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUmkms(); }, []);

  const toggleVerification = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('umkm_profiles')
      .update({ is_verified: !current })
      .eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status verifikasi' });
    } else {
      toast({ title: 'Berhasil', description: `UMKM ${!current ? 'diverifikasi' : 'unverified'}` });
      fetchUmkms();
    }
  };

  const filtered = umkms.filter(u =>
    u.umkm_name.toLowerCase().includes(search.toLowerCase()) ||
    u.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="UMKM Management" description="Kelola toko UMKM">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Daftar UMKM ({umkms.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari UMKM..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama UMKM</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Verifikasi</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada UMKM</TableCell></TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.umkm_name}</TableCell>
                    <TableCell>{u.brand_name || '-'}</TableCell>
                    <TableCell>{[u.city, u.province].filter(Boolean).join(', ') || '-'}</TableCell>
                    <TableCell>{u.phone || u.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_verified ? 'default' : 'secondary'}>
                        {u.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.created_at ? format(new Date(u.created_at), 'dd MMM yyyy', { locale: idLocale }) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/umkm/store/${u.id}`, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" /> Lihat Toko
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleVerification(u.id, !!u.is_verified)}>
                            {u.is_verified ? (
                              <><XCircle className="mr-2 h-4 w-4" /> Unverify</>
                            ) : (
                              <><CheckCircle className="mr-2 h-4 w-4" /> Verifikasi</>
                            )}
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
    </AdminLayout>
  );
}
