import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelpCircle, Plus, Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const statusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  open: { label: 'Terbuka', variant: 'default' },
  in_progress: { label: 'Diproses', variant: 'secondary' },
  resolved: { label: 'Selesai', variant: 'default' },
  closed: { label: 'Ditutup', variant: 'secondary' },
};

const priorityBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  low: { label: 'Rendah', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'Tinggi', variant: 'destructive' },
  urgent: { label: 'Urgent', variant: 'destructive' },
};

export default function DashboardSupport() {
  const { tickets, isLoading, createTicket } = useSupportTickets();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });

  const handleSubmit = async () => {
    await createTicket.mutateAsync(form);
    setForm({ subject: '', message: '', priority: 'normal' });
    setIsOpen(false);
  };

  return (
    <DashboardLayout title="Pusat Bantuan" description="Kirim tiket bantuan atau lihat status tiket Anda">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tiket Bantuan</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Buat Tiket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Tiket Bantuan</DialogTitle>
              <DialogDescription>Jelaskan masalah Anda dan tim kami akan membantu</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subjek</Label>
                <Input value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Masalah dengan..." />
              </div>
              <div className="space-y-2">
                <Label>Pesan</Label>
                <Textarea value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Jelaskan masalah Anda secara detail..." rows={5} />
              </div>
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={createTicket.isPending || !form.subject || !form.message}>
                {createTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada tiket bantuan</p>
              <p className="text-sm text-muted-foreground mt-1">Klik "Buat Tiket" untuk mengirim pertanyaan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const st = statusBadge[ticket.status || 'open'];
                  const pr = priorityBadge[ticket.priority || 'normal'];
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          {ticket.message && <p className="text-sm text-muted-foreground line-clamp-1">{ticket.message}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={pr?.variant || 'secondary'}>{pr?.label || ticket.priority}</Badge></TableCell>
                      <TableCell><Badge variant={st?.variant || 'secondary'}>{st?.label || ticket.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.created_at ? format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
