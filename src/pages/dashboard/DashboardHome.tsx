import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Coins,
  Package,
  ShoppingCart,
  MessageCircle,
  ArrowRight,
  Eye,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { stats, transactions, listings, orders, loading } = useDashboardData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-200',
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      paid: 'bg-blue-500/10 text-blue-600 border-blue-200',
      shipped: 'bg-purple-500/10 text-purple-600 border-purple-200',
      completed: 'bg-green-500/10 text-green-600 border-green-200',
      cancelled: 'bg-red-500/10 text-red-600 border-red-200',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      pending: 'Pending',
      paid: 'Dibayar',
      shipped: 'Dikirim',
      completed: 'Selesai',
      cancelled: 'Batal',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Dashboard" description="Selamat datang di dashboard Anda">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Saldo Wallet"
          value={formatCurrency(stats.walletBalance)}
          icon={Wallet}
          description="Indonesian Rupiah"
          isLoading={loading}
        />
        <StatsCard
          title="Kredit"
          value={stats.creditsBalance.toString()}
          icon={Coins}
          description="Untuk boost & fitur premium"
          isLoading={loading}
        />
        <StatsCard
          title="Iklan Aktif"
          value={`${stats.activeListings}/${stats.totalListings}`}
          icon={Package}
          description="Iklan yang sedang tayang"
          isLoading={loading}
        />
        <StatsCard
          title="Pesanan"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          description={`${stats.pendingOrders} menunggu proses`}
          isLoading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto py-4 justify-start gap-3"
          onClick={() => navigate('/listing/create')}
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">Jual Barang Baru</div>
            <div className="text-sm text-muted-foreground">Jual produk atau jasa</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 justify-start gap-3"
          onClick={() => navigate('/credits')}
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">Beli Kredit</div>
            <div className="text-sm text-muted-foreground">Untuk boost iklan</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 justify-start gap-3"
          onClick={() => navigate('/dashboard/messages')}
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center relative">
            <MessageCircle className="h-5 w-5 text-primary" />
            {stats.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground">
                {stats.unreadMessages > 9 ? '9+' : stats.unreadMessages}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">Pesan</div>
            <div className="text-sm text-muted-foreground">
              {stats.unreadMessages > 0 ? `${stats.unreadMessages} belum dibaca` : 'Lihat semua pesan'}
            </div>
          </div>
        </Button>
      </div>

      {/* Analytics Charts */}
      <div className="mt-6">
        <AnalyticsCharts />
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Transaksi Terakhir</CardTitle>
              <CardDescription>Riwayat wallet Anda</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/wallet')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tx.type === 'credit' ? (
                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'dd MMM', { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pesanan Terakhir</CardTitle>
              <CardDescription>Aktivitas jual beli</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">
                        {order.listing?.title || 'Produk'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'dd MMM', { locale: idLocale })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(order.amount)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Iklan Saya</CardTitle>
            <CardDescription>Kelola iklan Anda</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/listings')}>
            Lihat Semua
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Anda belum memiliki iklan</p>
              <Button className="mt-4" onClick={() => navigate('/listing/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Iklan Pertama
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 6).map((listing) => {
                const primaryImage = listing.listing_images?.find(img => img.is_primary)?.image_url
                  || listing.listing_images?.[0]?.image_url;

                return (
                  <div
                    key={listing.id}
                    className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(listing.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(listing.status)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {listing.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
