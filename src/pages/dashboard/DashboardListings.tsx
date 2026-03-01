import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, Plus, Eye, Edit, Rocket, Search, Loader2 } from 'lucide-react';
import { BoostModal } from '@/components/listing/BoostModal';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  view_count: number | null;
  created_at: string | null;
  listing_images: { image_url: string; is_primary: boolean }[];
}

export default function DashboardListings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [boostModal, setBoostModal] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });

  const fetchListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('listings')
        .select(`
          id, title, price, status, view_count, created_at,
          listing_images(image_url, is_primary)
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (data) setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || listing.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusCounts = {
    all: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    pending_review: listings.filter((l) => l.status === 'pending_review').length,
    draft: listings.filter((l) => l.status === 'draft').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-200',
      draft: 'bg-gray-500/10 text-gray-600 border-gray-200',
      pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      sold: 'bg-blue-500/10 text-blue-600 border-blue-200',
      expired: 'bg-red-500/10 text-red-600 border-red-200',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      draft: 'Draft',
      pending_review: 'Pending',
      sold: 'Terjual',
      expired: 'Expired',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title="Iklan Saya" description="Kelola semua iklan Anda">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari iklan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate('/listing/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Jual Barang Baru
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Semua ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="active">Aktif ({statusCounts.active})</TabsTrigger>
          <TabsTrigger value="pending_review">Pending ({statusCounts.pending_review})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
          <TabsTrigger value="sold">Terjual ({statusCounts.sold})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredListings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Tidak ada iklan yang cocok' : 'Belum ada iklan'}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => navigate('/listing/create')}>
                    Buat Iklan Pertama
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => {
                const primaryImage = listing.listing_images?.find((img) => img.is_primary)?.image_url
                  || listing.listing_images?.[0]?.image_url;

                return (
                  <Card key={listing.id}>
                    <CardContent className="flex gap-4 p-4">
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium truncate">{listing.title}</h3>
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(listing.price)}
                            </p>
                          </div>
                          {getStatusBadge(listing.status)}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.view_count || 0} views
                          </span>
                          <span>
                            {listing.created_at && new Date(listing.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/listing/edit/${listing.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {listing.status === 'active' && (
                            <Button
                              size="sm"
                              onClick={() => setBoostModal({ open: true, listing })}
                            >
                              <Rocket className="h-4 w-4 mr-1" />
                              Boost
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {boostModal.listing && (
        <BoostModal
          open={boostModal.open}
          onOpenChange={(open) => setBoostModal({ ...boostModal, open })}
          listingId={boostModal.listing.id}
          listingTitle={boostModal.listing.title}
          onSuccess={fetchListings}
        />
      )}
    </DashboardLayout>
  );
}
