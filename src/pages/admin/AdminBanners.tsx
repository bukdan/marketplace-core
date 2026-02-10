import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Image, MoreHorizontal, CheckCircle, XCircle, Pause, Play } from 'lucide-react';
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

export default function AdminBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('banners')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('banners').update({ status: status as any }).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status' });
    } else {
      toast({ title: 'Berhasil', description: `Banner status: ${status}` });
      fetchData();
    }
  };

  return (
    <AdminLayout title="Banner Management" description="Kelola iklan banner platform">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Daftar Banner ({banners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : banners.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada banner</TableCell></TableRow>
              ) : (
                banners.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{b.title}</TableCell>
                    <TableCell><Badge variant="outline">{b.position}</Badge></TableCell>
                    <TableCell className="uppercase text-xs">{b.pricing_model}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatCurrency(b.budget_spent)} / {formatCurrency(b.budget_total)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div>{b.impressions || 0} views</div>
                        <div>{b.clicks || 0} clicks</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[b.status] || ''}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(b.starts_at), 'dd MMM', { locale: idLocale })}
                      {b.ends_at && ` - ${format(new Date(b.ends_at), 'dd MMM', { locale: idLocale })}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {b.status === 'pending' && (
                            <DropdownMenuItem onClick={() => updateStatus(b.id, 'active')}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {b.status === 'pending' && (
                            <DropdownMenuItem onClick={() => updateStatus(b.id, 'rejected')}>
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
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
