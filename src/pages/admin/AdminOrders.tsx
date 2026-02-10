import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  paid: 'bg-blue-500/10 text-blue-600 border-blue-200',
  shipped: 'bg-purple-500/10 text-purple-600 border-purple-200',
  delivered: 'bg-green-500/10 text-green-600 border-green-200',
  completed: 'bg-green-500/10 text-green-600 border-green-200',
  cancelled: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [umkmOrders, setUmkmOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [{ data: o1 }, { data: o2 }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('umkm_orders').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      setOrders(o1 || []);
      setUmkmOrders(o2 || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const OrderTable = ({ data, type }: { data: any[]; type: 'marketplace' | 'umkm' }) => {
    const filtered = data.filter(o =>
      o.id.includes(search) ||
      (o.order_number && o.order_number.includes(search))
    );
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{type === 'umkm' ? 'No. Order' : 'ID'}</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Tanggal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada order</TableCell></TableRow>
          ) : (
            filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{type === 'umkm' ? (o.order_number || o.id.slice(0, 8)) : o.id.slice(0, 8)}</TableCell>
                <TableCell>{formatCurrency(type === 'umkm' ? (o.total_amount || 0) : o.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[o.status] || ''}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[o.payment_status] || ''}>
                    {o.payment_status || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(o.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <AdminLayout title="Orders Management" description="Monitor semua pesanan & pembayaran">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Semua Orders
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari order..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="marketplace">
            <TabsList>
              <TabsTrigger value="marketplace">Marketplace ({orders.length})</TabsTrigger>
              <TabsTrigger value="umkm">UMKM ({umkmOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace">
              <OrderTable data={orders} type="marketplace" />
            </TabsContent>
            <TabsContent value="umkm">
              <OrderTable data={umkmOrders} type="umkm" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
