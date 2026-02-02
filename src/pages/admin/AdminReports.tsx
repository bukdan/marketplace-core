import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
  const navigate = useNavigate();
  const { reports, loading, updateReportStatus, updateListingStatus } = useAdminData();
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      reviewed: 'bg-blue-500/10 text-blue-600 border-blue-200',
      action_taken: 'bg-purple-500/10 text-purple-600 border-purple-200',
      dismissed: 'bg-gray-500/10 text-gray-600 border-gray-200',
    };
    const labels: Record<string, string> = {
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

  const getReasonBadge = (reason: string) => {
    const styles: Record<string, string> = {
      spam: 'bg-orange-500/10 text-orange-600',
      fraud: 'bg-red-500/10 text-red-600',
      inappropriate: 'bg-pink-500/10 text-pink-600',
      wrong_category: 'bg-blue-500/10 text-blue-600',
      duplicate: 'bg-purple-500/10 text-purple-600',
      other: 'bg-gray-500/10 text-gray-600',
    };
    const labels: Record<string, string> = {
      spam: 'Spam',
      fraud: 'Fraud',
      inappropriate: 'Konten Tidak Pantas',
      wrong_category: 'Kategori Salah',
      duplicate: 'Duplikat',
      other: 'Lainnya',
    };
    return (
      <Badge variant="secondary" className={styles[reason] || ''}>
        {labels[reason] || reason}
      </Badge>
    );
  };

  const handleDismiss = async (reportId: string) => {
    const { error } = await updateReportStatus(reportId, 'dismissed');
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengabaikan laporan',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Laporan telah diabaikan',
      });
    }
  };

  const handleTakeAction = async (reportId: string, listingId: string) => {
    // Mark listing as rejected/deleted and update report status
    const { error: listingError } = await updateListingStatus(listingId, 'rejected', 'Reported by users');
    const { error: reportError } = await updateReportStatus(reportId, 'action_taken');
    
    if (listingError || reportError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengambil tindakan',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Tindakan telah diambil, listing ditolak',
      });
    }
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const processedReports = reports.filter((r) => r.status !== 'pending');

  const ReportTable = ({ data }: { data: typeof reports }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Listing</TableHead>
          <TableHead>Alasan</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Tidak ada laporan
            </TableCell>
          </TableRow>
        ) : (
          data.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium max-w-[150px] truncate">
                {report.listing?.title || 'Unknown'}
              </TableCell>
              <TableCell>{getReasonBadge(report.reason)}</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {report.description || '-'}
              </TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell>
                {format(new Date(report.created_at), 'dd MMM yyyy', { locale: idLocale })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/listing/${report.listing_id}`)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Lihat Listing
                    </DropdownMenuItem>
                    {report.status === 'pending' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleTakeAction(report.id, report.listing_id)}
                          className="text-destructive"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Ambil Tindakan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDismiss(report.id)}>
                          <X className="mr-2 h-4 w-4" />
                          Abaikan
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout title="Reports Management" description="Kelola laporan dari pengguna">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {pendingReports.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingReports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processed">Processed ({processedReports.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <ReportTable data={pendingReports} />
            </TabsContent>
            <TabsContent value="processed" className="mt-4">
              <ReportTable data={processedReports} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
