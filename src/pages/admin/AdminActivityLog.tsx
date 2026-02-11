import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ScrollText, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const actionStyles: Record<string, string> = {
  create: 'bg-green-500/10 text-green-600 border-green-200',
  update: 'bg-blue-500/10 text-blue-600 border-blue-200',
  delete: 'bg-red-500/10 text-red-600 border-red-200',
  approve: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  reject: 'bg-orange-500/10 text-orange-600 border-orange-200',
  login: 'bg-purple-500/10 text-purple-600 border-purple-200',
};

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filterEntity !== 'all') {
      query = query.eq('entity_type', filterEntity);
    }

    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filterEntity]);

  const filtered = logs.filter(l =>
    !search || l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(l.details)?.toLowerCase().includes(search.toLowerCase())
  );

  const entityTypes = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

  return (
    <AdminLayout title="Activity Log" description="Riwayat aktivitas dan audit trail">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Activity Log ({filtered.length})
          </CardTitle>
          <div className="flex gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari aktivitas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Entity</SelectItem>
                {entityTypes.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>User ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada log aktivitas</TableCell></TableRow>
              ) : (
                filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(l.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionStyles[l.action] || ''}>
                        {l.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{l.entity_type || '-'}</span>
                      {l.entity_id && (
                        <span className="block text-xs text-muted-foreground truncate max-w-[120px]">
                          {l.entity_id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <pre className="text-xs whitespace-pre-wrap break-all">
                        {l.details && Object.keys(l.details).length > 0
                          ? JSON.stringify(l.details, null, 1)
                          : '-'}
                      </pre>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {l.user_id ? l.user_id.slice(0, 8) + '...' : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
