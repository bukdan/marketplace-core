import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminAnalytics() {
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [orderTrend, setOrderTrend] = useState<any[]>([]);
  const [listingsByStatus, setListingsByStatus] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      // Fetch all data in parallel
      const [{ data: profiles }, { data: orders }, { data: listings }] = await Promise.all([
        supabase.from('profiles').select('created_at').order('created_at', { ascending: true }),
        supabase.from('orders').select('created_at, amount, status'),
        supabase.from('listings').select('status, created_at').is('deleted_at', null),
      ]);

      // User growth: group by day (last 30 days)
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

      // Order trend & revenue: group by day (last 30 days)
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

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact' }).format(v);

  return (
    <AdminLayout title="Analytics Dashboard" description="Grafik tren revenue, user growth, dan lainnya">
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
                <Pie data={listingsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
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
    </AdminLayout>
  );
}
