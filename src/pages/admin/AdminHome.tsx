import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Flag,
  UserCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AdminHome() {
  const navigate = useNavigate();
  const { stats, listings, reports, loading } = useAdminData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      active: 'bg-green-500/10 text-green-600 border-green-200',
      rejected: 'bg-red-500/10 text-red-600 border-red-200',
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      reviewed: 'bg-blue-500/10 text-blue-600 border-blue-200',
      action_taken: 'bg-purple-500/10 text-purple-600 border-purple-200',
      dismissed: 'bg-gray-500/10 text-gray-600 border-gray-200',
    };
    const labels: Record<string, string> = {
      pending_review: 'Pending Review',
      active: 'Active',
      rejected: 'Rejected',
      pending: 'Pending',
      reviewed: 'Reviewed',
      action_taken: 'Action Taken',
      dismissed: 'Dismissed',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Admin Overview" description="Kelola platform UMKM ID">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={Users}
          description="Pengguna terdaftar"
          isLoading={loading}
        />
        <StatsCard
          title="Total Listings"
          value={`${stats.activeListings}/${stats.totalListings}`}
          icon={Package}
          description={`${stats.pendingListings} pending review`}
          isLoading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          description="Transaksi"
          isLoading={loading}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description="Platform revenue"
          isLoading={loading}
        />
      </div>

      {/* Alerts */}
      {(stats.pendingListings > 0 || stats.pendingReports > 0 || stats.pendingKyc > 0) && (
        <Card className="mt-6 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Perlu Tindakan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {stats.pendingListings > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/listings')}
                className="border-yellow-500/50"
              >
                <Package className="mr-2 h-4 w-4" />
                {stats.pendingListings} Listing Pending
              </Button>
            )}
            {stats.pendingReports > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/reports')}
                className="border-yellow-500/50"
              >
                <Flag className="mr-2 h-4 w-4" />
                {stats.pendingReports} Report Pending
              </Button>
            )}
            {stats.pendingKyc > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/kyc')}
                className="border-yellow-500/50"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {stats.pendingKyc} KYC Pending
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pending Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Listings Pending Review</CardTitle>
              <CardDescription>Iklan yang perlu di-review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/listings')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {listings.filter(l => l.status === 'pending_review').length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada listing pending</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listings
                  .filter(l => l.status === 'pending_review')
                  .slice(0, 5)
                  .map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {listing.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(listing.created_at), 'dd MMM yyyy', { locale: idLocale })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{formatCurrency(listing.price)}</span>
                        {getStatusBadge(listing.status)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Reports</CardTitle>
              <CardDescription>Laporan dari pengguna</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reports')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {reports.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada laporan pending</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports
                  .filter(r => r.status === 'pending')
                  .slice(0, 5)
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {report.listing?.title || 'Unknown Listing'}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {report.reason.replace('_', ' ')}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
