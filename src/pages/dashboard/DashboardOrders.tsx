import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useOrders } from '@/hooks/useOrders';
import { useOrderPayment } from '@/hooks/useOrderPayment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useState } from 'react';

export default function DashboardOrders() {
  const { orders, buyingOrders, sellingOrders, loading, updateOrderStatus, isUpdating } = useOrders();
  const { payOrder, loading: paymentLoading } = useOrderPayment();
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Menunggu Pembayaran', variant: 'outline' },
      paid: { label: 'Dibayar', variant: 'default' },
      shipped: { label: 'Dikirim', variant: 'secondary' },
      delivered: { label: 'Diterima', variant: 'default' },
      completed: { label: 'Selesai', variant: 'default' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'paid': return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const handleShip = async (orderId: string) => {
    const trackingNumber = trackingInputs[orderId];
    if (trackingNumber) {
      await updateOrderStatus(orderId, 'shipped', trackingNumber);
    }
  };

  const renderOrderCard = (order: any, type: 'buying' | 'selling') => (
    <Card key={order.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            {getStatusIcon(order.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate">{order.listing?.title || 'Produk'}</h3>
                <p className="text-lg font-bold text-primary">{formatCurrency(order.amount)}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                {type === 'buying' ? 'Penjual' : 'Pembeli'}:{' '}
                {type === 'buying' ? order.seller?.name || order.seller?.email : order.buyer?.name || order.buyer?.email}
              </p>
              <p>{format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}</p>
              {order.tracking_number && <p>Resi: {order.tracking_number}</p>}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {type === 'buying' && order.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => payOrder(order.id)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Bayar Sekarang
                </Button>
              )}
              {type === 'selling' && order.status === 'paid' && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nomor Resi"
                    className="w-40"
                    value={trackingInputs[order.id] || ''}
                    onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleShip(order.id)}
                    disabled={isUpdating || !trackingInputs[order.id]}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim'}
                  </Button>
                </div>
              )}
              {type === 'buying' && order.status === 'shipped' && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  disabled={isUpdating}
                >
                  Konfirmasi Terima
                </Button>
              )}
              {type === 'buying' && order.status === 'delivered' && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  disabled={isUpdating}
                >
                  Selesaikan Pesanan
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Pesanan" description="Kelola pesanan jual beli Anda">
      <Tabs defaultValue="buying">
        <TabsList>
          <TabsTrigger value="buying">Membeli ({buyingOrders.length})</TabsTrigger>
          <TabsTrigger value="selling">Menjual ({sellingOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buying" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : buyingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada pesanan pembelian</p>
              </CardContent>
            </Card>
          ) : (
            buyingOrders.map((order) => renderOrderCard(order, 'buying'))
          )}
        </TabsContent>

        <TabsContent value="selling" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sellingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada pesanan penjualan</p>
              </CardContent>
            </Card>
          ) : (
            sellingOrders.map((order) => renderOrderCard(order, 'selling'))
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
