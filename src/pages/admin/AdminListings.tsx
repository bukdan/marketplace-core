import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Check, X, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function AdminListings() {
  const navigate = useNavigate();
  const { listings, loading, updateListingStatus } = useAdminData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; listingId: string | null }>({
    open: false,
    listingId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

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
      sold: 'bg-blue-500/10 text-blue-600 border-blue-200',
      expired: 'bg-gray-500/10 text-gray-600 border-gray-200',
    };
    const labels: Record<string, string> = {
      pending_review: 'Pending Review',
      active: 'Active',
      rejected: 'Rejected',
      sold: 'Sold',
      expired: 'Expired',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleApprove = async (listingId: string) => {
    const { error } = await updateListingStatus(listingId, 'active');
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyetujui listing',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Listing telah disetujui',
      });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.listingId || !rejectReason.trim()) return;

    const { error } = await updateListingStatus(rejectDialog.listingId, 'rejected', rejectReason);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menolak listing',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Listing telah ditolak',
      });
    }
    setRejectDialog({ open: false, listingId: null });
    setRejectReason('');
  };

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(search.toLowerCase())
  );

  const pendingListings = filteredListings.filter((l) => l.status === 'pending_review');
  const activeListings = filteredListings.filter((l) => l.status === 'active');
  const otherListings = filteredListings.filter(
    (l) => !['pending_review', 'active'].includes(l.status)
  );

  const ListingTable = ({ data }: { data: typeof listings }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              Tidak ada listing
            </TableCell>
          </TableRow>
        ) : (
          data.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {listing.title}
              </TableCell>
              <TableCell>{formatCurrency(listing.price)}</TableCell>
              <TableCell>{getStatusBadge(listing.status)}</TableCell>
              <TableCell>
                {format(new Date(listing.created_at), 'dd MMM yyyy', { locale: idLocale })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {listing.status === 'pending_review' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(listing.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setRejectDialog({ open: true, listingId: listing.id })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout title="Listings Management" description="Kelola dan review listing">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Listings</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari listing..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Review
                {pendingListings.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingListings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
              <TabsTrigger value="other">Other ({otherListings.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <ListingTable data={pendingListings} />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <ListingTable data={activeListings} />
            </TabsContent>
            <TabsContent value="other" className="mt-4">
              <ListingTable data={otherListings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, listingId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Listing</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk listing ini.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, listingId: null })}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
