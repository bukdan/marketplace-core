import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminData } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Search, Check, X, ExternalLink, MoreHorizontal, Trash2, Clock, Flag, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function AdminListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading, updateListingStatus, refetch } = useAdminData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; listingId: string | null }>({
    open: false, listingId: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listingId: string | null }>({ open: false, listingId: null });
  const [deleting, setDeleting] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; listingId: string | null }>({ open: false, listingId: null });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      active: 'bg-green-500/10 text-green-600 border-green-200',
      rejected: 'bg-red-500/10 text-red-600 border-red-200',
      sold: 'bg-blue-500/10 text-blue-600 border-blue-200',
      expired: 'bg-gray-500/10 text-gray-600 border-gray-200',
      suspended: 'bg-orange-500/10 text-orange-600 border-orange-200',
    };
    const labels: Record<string, string> = {
      pending_review: 'Pending Review',
      active: 'Active',
      rejected: 'Rejected',
      sold: 'Sold',
      expired: 'Expired',
      suspended: 'Suspended',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleApprove = async (listingId: string) => {
    const { error } = await updateListingStatus(listingId, 'active');
    toast(error
      ? { variant: 'destructive', title: 'Error', description: 'Gagal menyetujui listing' }
      : { title: 'Berhasil', description: 'Listing telah disetujui' }
    );
  };

  const handleReject = async () => {
    if (!rejectDialog.listingId || !rejectReason.trim()) return;
    const { error } = await updateListingStatus(rejectDialog.listingId, 'rejected', rejectReason);
    toast(error
      ? { variant: 'destructive', title: 'Error', description: 'Gagal menolak listing' }
      : { title: 'Berhasil', description: 'Listing telah ditolak' }
    );
    setRejectDialog({ open: false, listingId: null });
    setRejectReason('');
  };

  const handleDelete = async () => {
    if (!deleteDialog.listingId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ deleted_at: new Date().toISOString(), status: 'expired' as any })
        .eq('id', deleteDialog.listingId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'listing_deleted',
        entity_type: 'listing',
        entity_id: deleteDialog.listingId,
        details: { action: 'admin_delete' } as any,
      });

      toast({ title: 'Berhasil', description: 'Listing telah dihapus' });
      refetch();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus listing' });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, listingId: null });
    }
  };

  const handleSetPending = async (listingId: string) => {
    const { error } = await updateListingStatus(listingId, 'pending_review');
    toast(error
      ? { variant: 'destructive', title: 'Error', description: 'Gagal mengubah status' }
      : { title: 'Berhasil', description: 'Listing dikembalikan ke Pending Review' }
    );
  };

  const handleSuspend = async () => {
    if (!suspendDialog.listingId) return;
    const { error } = await updateListingStatus(suspendDialog.listingId, 'rejected', 'Ditangguhkan oleh admin');

    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: 'listing_suspended',
      entity_type: 'listing',
      entity_id: suspendDialog.listingId,
      details: { action: 'admin_suspend' } as any,
    });

    toast(error
      ? { variant: 'destructive', title: 'Error', description: 'Gagal menangguhkan listing' }
      : { title: 'Berhasil', description: 'Listing telah ditangguhkan' }
    );
    setSuspendDialog({ open: false, listingId: null });
  };

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(search.toLowerCase())
  );

  const pendingListings = filteredListings.filter((l) => l.status === 'pending_review');
  const activeListings = filteredListings.filter((l) => l.status === 'active');
  const otherListings = filteredListings.filter((l) => !['pending_review', 'active'].includes(l.status));

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
              <TableCell className="font-medium max-w-[200px] truncate">{listing.title}</TableCell>
              <TableCell>{formatCurrency(listing.price)}</TableCell>
              <TableCell>{getStatusBadge(listing.status)}</TableCell>
              <TableCell>{format(new Date(listing.created_at), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {listing.status === 'pending_review' && (
                    <>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(listing.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setRejectDialog({ open: true, listingId: listing.id })}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/listing/${listing.id}`)}>
                        <ExternalLink className="h-4 w-4 mr-2" /> Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {listing.status !== 'pending_review' && (
                        <DropdownMenuItem onClick={() => handleSetPending(listing.id)}>
                          <Clock className="h-4 w-4 mr-2" /> Set Pending Review
                        </DropdownMenuItem>
                      )}
                      {listing.status === 'active' && (
                        <DropdownMenuItem onClick={() => setSuspendDialog({ open: true, listingId: listing.id })}>
                          <Ban className="h-4 w-4 mr-2" /> Tangguhkan Iklan
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ open: true, listingId: listing.id })}>
                        <Trash2 className="h-4 w-4 mr-2" /> Hapus Iklan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <Input placeholder="Cari listing..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Review
                {pendingListings.length > 0 && <Badge variant="destructive" className="ml-2">{pendingListings.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
              <TabsTrigger value="other">Other ({otherListings.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4"><ListingTable data={pendingListings} /></TabsContent>
            <TabsContent value="active" className="mt-4"><ListingTable data={activeListings} /></TabsContent>
            <TabsContent value="other" className="mt-4"><ListingTable data={otherListings} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, listingId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Listing</DialogTitle>
            <DialogDescription>Berikan alasan penolakan untuk listing ini.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Alasan penolakan..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, listingId: null })}>Batal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>Tolak</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, listingId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Listing akan dihapus secara permanen (soft delete). Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog({ open, listingId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tangguhkan Iklan?</AlertDialogTitle>
            <AlertDialogDescription>
              Iklan akan ditangguhkan dan tidak akan tampil di marketplace. Penjual akan menerima notifikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend}>Tangguhkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
