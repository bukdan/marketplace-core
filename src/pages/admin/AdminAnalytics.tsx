import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, Users, Package, ShoppingCart, Eye, Clock, MousePointerClick,
  Globe, Monitor, Smartphone, ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface AnalyticsData {
  timeSeries: {
    visitors: { total: number; data: { date: string; value: number }[] };
    pageviews: { total: number; data: { date: string; value: number }[] };
    pageviewsPerVisit: { total: number; data: { date: string; value: number }[] };
    sessionDuration: { total: number; data: { date: string; value: number }[] };
    bounceRate: { total: number; data: { date: string; value: number }[] };
  };
  lists: {
    page: { data: { label: string; value: number }[] };
    source: { data: { label: string; value: number }[] };
    device: { data: { label: string; value: number }[] };
    country: { data: { label: string; value: number }[] };
  };
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [orderTrend, setOrderTrend] = useState<any[]>([]);
  const [listingsByStatus, setListingsByStatus] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // Fetch website analytics from window - we'll use the data from the project analytics
      // For now, fetch DB analytics
      const [{ data: profiles }, { data: orders }, { data: listings }] = await Promise.all([
        supabase.from('profiles').select('created_at').order('created_at', { ascending: true }),
        supabase.from('orders').select('created_at, amount, status'),
        supabase.from('listings').select('status, created_at').is('deleted_at', null),
      ]);

      // User growth
      const days = 30;
      const userMap: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        userMap[d] = 0;
      }
      profiles?.forEach(p => {
        const d = format(new Date(p.created_at!), 'yyyy-MM-dd');
        if (userMap[d] !== undefined) userMap[d]++;
      });
      setUserGrowth(Object.entries(userMap).map(([date, count]) => ({
        date: format(new Date(date), 'dd/MM'),
        users: count,
      })));

      // Orders & revenue
      const orderMap: Record<string, { count: number; revenue: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        orderMap[d] = { count: 0, revenue: 0 };
      }
      orders?.forEach(o => {
        const d = format(new Date(o.created_at), 'yyyy-MM-dd');
        if (orderMap[d]) {
          orderMap[d].count++;
          orderMap[d].revenue += Number(o.amount);
        }
      });
      setOrderTrend(Object.entries(orderMap).map(([date, v]) => ({
        date: format(new Date(date), 'dd/MM'),
        orders: v.count,
      })));
      setRevenueTrend(Object.entries(orderMap).map(([date, v]) => ({
        date: format(new Date(date), 'dd/MM'),
        revenue: v.revenue,
      })));

      // Listings by status
      const statusCount: Record<string, number> = {};
      listings?.forEach(l => {
        statusCount[l.status] = (statusCount[l.status] || 0) + 1;
      });
      setListingsByStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Set mock website analytics from latest data snapshot
      setAnalytics({
        timeSeries: {
          visitors: {
            total: 193,
            data: [
              { date: '2026-02-22', value: 17 }, { date: '2026-02-23', value: 37 },
              { date: '2026-02-24', value: 24 }, { date: '2026-02-25', value: 18 },
              { date: '2026-02-26', value: 22 }, { date: '2026-02-27', value: 33 },
              { date: '2026-02-28', value: 32 }, { date: '2026-03-01', value: 10 },
            ],
          },
          pageviews: {
            total: 779,
            data: [
              { date: '2026-02-22', value: 41 }, { date: '2026-02-23', value: 142 },
              { date: '2026-02-24', value: 116 }, { date: '2026-02-25', value: 50 },
              { date: '2026-02-26', value: 138 }, { date: '2026-02-27', value: 105 },
              { date: '2026-02-28', value: 105 }, { date: '2026-03-01', value: 82 },
            ],
          },
          pageviewsPerVisit: { total: 4.04, data: [] },
          sessionDuration: { total: 1627, data: [] },
          bounceRate: {
            total: 69,
            data: [
              { date: '2026-02-22', value: 59 }, { date: '2026-02-23', value: 70 },
              { date: '2026-02-24', value: 54 }, { date: '2026-02-25', value: 83 },
              { date: '2026-02-26', value: 64 }, { date: '2026-02-27', value: 79 },
              { date: '2026-02-28', value: 75 }, { date: '2026-03-01', value: 70 },
            ],
          },
        },
        lists: {
          page: {
            data: [
              { label: '/', value: 118 }, { label: '/user/profile/199228', value: 15 },
              { label: '/marketplace', value: 15 }, { label: '/auth', value: 12 },
              { label: '/listing/create', value: 12 }, { label: '/dashboard', value: 12 },
              { label: '/dashboard/wallet', value: 10 }, { label: '/admin/users', value: 10 },
              { label: '/admin/listings', value: 10 }, { label: '/admin', value: 9 },
            ],
          },
          source: {
            data: [
              { label: 'Direct', value: 171 }, { label: 'google.com', value: 12 },
              { label: 'Android Search', value: 4 }, { label: 'accounts.google.com', value: 3 },
              { label: 'm.facebook.com', value: 2 }, { label: 'bing.com', value: 1 },
              { label: 'facebook.com', value: 1 },
            ],
          },
          device: {
            data: [
              { label: 'Desktop', value: 139 }, { label: 'Mobile', value: 50 },
            ],
          },
          country: {
            data: [
              { label: 'Indonesia', value: 82 }, { label: 'Unknown', value: 58 },
              { label: 'China', value: 24 }, { label: 'USA', value: 16 },
              { label: 'Thailand', value: 4 }, { label: 'UK', value: 1 },
              { label: 'Russia', value: 1 }, { label: 'Poland', value: 1 },
            ],
          },
        },
      });

      setLoading(false);
    };
    fetchAll();
  }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact' }).format(v);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const visitorChartData = analytics?.timeSeries.visitors.data.map(d => ({
    date: format(new Date(d.date), 'dd/MM'),
    visitors: d.value,
  })) || [];

  const pageviewChartData = analytics?.timeSeries.pageviews.data.map(d => ({
    date: format(new Date(d.date), 'dd/MM'),
    pageviews: d.value,
  })) || [];

  const bounceChartData = analytics?.timeSeries.bounceRate.data.map(d => ({
    date: format(new Date(d.date), 'dd/MM'),
    bounceRate: d.value,
  })) || [];

  // Combined visitors + pageviews chart
  const combinedTrafficData = analytics?.timeSeries.visitors.data.map((d, i) => ({
    date: format(new Date(d.date), 'dd/MM'),
    visitors: d.value,
    pageviews: analytics.timeSeries.pageviews.data[i]?.value || 0,
  })) || [];

  return (
    <AdminLayout title="Analytics Dashboard" description="Website traffic & platform analytics">
      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="traffic">Website Traffic</TabsTrigger>
          <TabsTrigger value="platform">Platform Data</TabsTrigger>
        </TabsList>

        {/* Website Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Users className="h-3.5 w-3.5" /> Visitors
                </div>
                <p className="text-2xl font-bold">{analytics?.timeSeries.visitors.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">7 hari terakhir</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Eye className="h-3.5 w-3.5" /> Pageviews
                </div>
                <p className="text-2xl font-bold">{analytics?.timeSeries.pageviews.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">7 hari terakhir</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <MousePointerClick className="h-3.5 w-3.5" /> Pages/Visit
                </div>
                <p className="text-2xl font-bold">{analytics?.timeSeries.pageviewsPerVisit.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Clock className="h-3.5 w-3.5" /> Avg Duration
                </div>
                <p className="text-2xl font-bold">{formatDuration(analytics?.timeSeries.sessionDuration.total || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <ArrowDownRight className="h-3.5 w-3.5" /> Bounce Rate
                </div>
                <p className="text-2xl font-bold">{analytics?.timeSeries.bounceRate.total || 0}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" /> Visitors & Pageviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={combinedTrafficData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} className="fill-muted-foreground" />
                  <YAxis fontSize={11} tickLine={false} className="fill-muted-foreground" />
                  <Tooltip />
                  <Area type="monotone" dataKey="pageviews" fill="hsl(var(--chart-2))" fillOpacity={0.2} stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Area type="monotone" dataKey="visitors" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bounce Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownRight className="h-4 w-4" /> Bounce Rate (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bounceChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} className="fill-muted-foreground" />
                  <YAxis fontSize={11} tickLine={false} domain={[0, 100]} className="fill-muted-foreground" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="bounceRate" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tables Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Halaman Populer</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Halaman</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.lists.page.data.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs max-w-[200px] truncate">{p.label}</TableCell>
                        <TableCell className="text-right font-medium">{p.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sumber Traffic</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sumber</TableHead>
                      <TableHead className="text-right">Visitors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.lists.source.data.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{s.label}</TableCell>
                        <TableCell className="text-right font-medium">{s.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Monitor className="h-4 w-4" /> Perangkat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics?.lists.device.data.map(d => ({ name: d.label, value: d.value })) || []}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analytics?.lists.device.data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4" /> Negara
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Negara</TableHead>
                      <TableHead className="text-right">Visitors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.lists.country.data.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{c.label}</TableCell>
                        <TableCell className="text-right font-medium">{c.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Platform Data Tab */}
        <TabsContent value="platform" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" /> User Growth (30 hari)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} className="fill-muted-foreground" />
                    <YAxis fontSize={10} tickLine={false} className="fill-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-4 w-4" /> Order Trend (30 hari)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={orderTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} className="fill-muted-foreground" />
                    <YAxis fontSize={10} tickLine={false} className="fill-muted-foreground" />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" /> Revenue Trend (30 hari)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} className="fill-muted-foreground" />
                    <YAxis fontSize={10} tickLine={false} tickFormatter={formatCurrency} className="fill-muted-foreground" />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Listings by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" /> Listings by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={listingsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}>
                      {listingsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
