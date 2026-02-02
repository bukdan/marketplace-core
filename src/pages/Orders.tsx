import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/hooks/useOrders';
import { useOrderPayment } from '@/hooks/useOrderPayment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, ShoppingBag, Truck, CheckCircle, XCircle, 
  Clock, MessageCircle, Loader2, Eye, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: Clock },
  paid: { label: 'Dibayar', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle },
  processing: { label: 'Diproses', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: Package },
  shipped: { label: 'Dikirim', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', icon: Truck },
  delivered: { label: 'Sampai', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle },
  completed: { label: 'Selesai', color: 'bg-green-500/10 text-green-700 border-green-300', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-600 border-red-200', icon: XCircle },
};

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { orders, loading, updateOrderStatus, refetchOrders } = useOrders();
  const { payOrder, loading: paymentLoading } = useOrderPayment();
  const { toast } = useToast();
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const buyerOrders = orders.filter(o => o.buyer_id === user?.id);
  const sellerOrders = orders.filter(o => o.seller_id === user?.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleUpdateStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, status, trackingNumber);
      toast({ title: 'Status pesanan berhasil diupdate' });
    } catch (error) {
      toast({ title: 'Gagal update status', variant: 'destructive' });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const renderOrderCard = (order: typeof orders[0], isSeller: boolean) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const image = order.listing?.listing_images?.[0]?.image_url;

    return (
      <Card key={order.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {image ? (
                <img src={image} alt={order.listing?.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium truncate">{order.listing?.title || 'Produk'}</h3>
                  <p className="text-lg font-bold text-primary">{formatPrice(order.amount)}</p>
                </div>
                <Badge variant="outline" className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>
                  {isSeller ? `Pembeli: ${order.buyer?.name || 'User'}` : `Penjual: ${order.seller?.name || 'User'}`}
                </span>
                <span>{format(new Date(order.created_at), 'dd MMM yyyy', { locale: id })}</span>
              </div>

              {order.tracking_number && (
                <p className="text-sm mt-1">
                  No. Resi: <span className="font-mono font-medium">{order.tracking_number}</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t px-4 py-3 bg-muted/30 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/listing/${order.listing_id}`)}>
              <Eye className="h-4 w-4 mr-1" />
              Lihat Produk
            </Button>

            {isSeller ? (
              // Seller actions
              <>
                {order.status === 'paid' && (
                  <div className="flex gap-2 flex-1">
                    <Input
                      placeholder="Nomor resi"
                      value={trackingInput[order.id] || ''}
                      onChange={(e) => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                      className="max-w-[200px]"
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, 'shipped', trackingInput[order.id])}
                      disabled={updatingOrder === order.id}
                    >
                      {updatingOrder === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // Buyer actions
              <>
                {order.status === 'pending' && (
                  <Button 
                    size="sm" 
                    onClick={() => payOrder(order.id, refetchOrders)}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CreditCard className="h-4 w-4 mr-1" />}
                    Bayar Sekarang
                  </Button>
                )}
                {order.status === 'shipped' && (
                  <Button 
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    disabled={updatingOrder === order.id}
                  >
                    {updatingOrder === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Konfirmasi Terima'}
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button 
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    disabled={updatingOrder === order.id}
                  >
                    {updatingOrder === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Selesaikan Pesanan'}
                  </Button>
                )}
              </>
            )}

            <Button size="sm" variant="ghost">
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container py-6 max-w-4xl space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          Pesanan Saya
        </h1>

        <Tabs defaultValue="buying">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="buying" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pembelian ({buyerOrders.length})
            </TabsTrigger>
            <TabsTrigger value="selling" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Penjualan ({sellerOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buying" className="mt-6 space-y-4">
            {buyerOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada pesanan pembelian</p>
                  <Button className="mt-4" onClick={() => navigate('/marketplace')}>
                    Mulai Belanja
                  </Button>
                </CardContent>
              </Card>
            ) : (
              buyerOrders.map((order) => renderOrderCard(order, false))
            )}
          </TabsContent>

          <TabsContent value="selling" className="mt-6 space-y-4">
            {sellerOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada pesanan penjualan</p>
                  <Button className="mt-4" onClick={() => navigate('/listing/create')}>
                    Pasang Iklan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sellerOrders.map((order) => renderOrderCard(order, true))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
