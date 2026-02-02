import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Eye, ShoppingCart } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface DailyStats {
  date: string;
  views: number;
  orders: number;
  revenue: number;
}

export function AnalyticsCharts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totals, setTotals] = useState({ views: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get last 7 days
      const days = 7;
      const stats: DailyStats[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();

        // Get listings for views (we'll simulate view data based on listing creation and view_count)
        const { data: listingsData } = await supabase
          .from('listings')
          .select('id, view_count, created_at')
          .eq('user_id', user.id)
          .is('deleted_at', null);

        // Get orders for this day
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, amount, created_at')
          .eq('seller_id', user.id)
          .gte('created_at', dayStart)
          .lte('created_at', dayEnd);

        // Simulate views distribution (in real app, you'd track this)
        const totalViews = listingsData?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0;
        const avgDailyViews = Math.floor(totalViews / days);
        const randomVariance = Math.floor(Math.random() * 10) - 5;
        const dayViews = Math.max(0, avgDailyViews + randomVariance);

        const dayOrders = ordersData?.length || 0;
        const dayRevenue = ordersData?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

        stats.push({
          date: format(date, 'dd MMM', { locale: idLocale }),
          views: dayViews,
          orders: dayOrders,
          revenue: dayRevenue,
        });
      }

      setDailyStats(stats);
      setTotals({
        views: stats.reduce((sum, s) => sum + s.views, 0),
        orders: stats.reduce((sum, s) => sum + s.orders, 0),
        revenue: stats.reduce((sum, s) => sum + s.revenue, 0),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analytics
            </CardTitle>
            <CardDescription>Performa iklan 7 hari terakhir</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Views</p>
              <p className="font-bold text-lg">{totals.views}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Pesanan</p>
              <p className="font-bold text-lg">{totals.orders}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Pendapatan</p>
              <p className="font-bold text-lg">{formatCurrency(totals.revenue)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="views" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Views
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pendapatan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="orders">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Pesanan" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="revenue">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-3))' }}
                  name="Pendapatan"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
