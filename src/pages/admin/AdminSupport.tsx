import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const statusStyles: Record<string, string> = {
  open: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-200',
  resolved: 'bg-green-500/10 text-green-600 border-green-200',
  closed: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const priorityStyles: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-600 border-gray-200',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  high: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function AdminSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status' });
    } else {
      toast({ title: 'Berhasil', description: `Status tiket: ${status}` });
      fetchData();
      if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status });
    }
  };

  return (
    <AdminLayout title="Support Tickets" description="Kelola tiket bantuan pengguna">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Tiket Bantuan ({tickets.filter(t => t.status === 'open').length} open)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : tickets.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada tiket</TableCell></TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">{t.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityStyles[t.priority] || ''}>{t.priority || 'medium'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[t.status] || ''}>{t.status || 'open'}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(t.created_at), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedTicket(t)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {t.status !== 'resolved' && t.status !== 'closed' && (
                          <Select value={t.status || 'open'} onValueChange={(v) => updateStatus(t.id, v)}>
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.created_at && format(new Date(selectedTicket.created_at), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge variant="outline" className={priorityStyles[selectedTicket?.priority] || ''}>
                {selectedTicket?.priority || 'medium'}
              </Badge>
              <Badge variant="outline" className={statusStyles[selectedTicket?.status] || ''}>
                {selectedTicket?.status || 'open'}
              </Badge>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{selectedTicket?.message || 'Tidak ada pesan'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
