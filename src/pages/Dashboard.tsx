import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw,
  Plus,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface WalletData {
  id: string;
  balance: number;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  reference_type: string | null;
  created_at: string;
}

interface Profile {
  name: string | null;
  email: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id, balance, status')
        .eq('user_id', user.id)
        .single();
      
      if (walletData) {
        setWallet(walletData);
      }

      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('id, type, amount, description, reference_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (txData) {
        setTransactions(txData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!wallet) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Wallet tidak ditemukan',
      });
      return;
    }

    setIsTopupLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-topup', {
        body: {
          amount: 100000, // Default topup amount
          wallet_id: wallet.id,
        },
      });

      if (error) throw error;

      if (data?.snap_token) {
        // Open Midtrans Snap
        (window as any).snap.pay(data.snap_token, {
          onSuccess: () => {
            toast({
              title: 'Topup Berhasil',
              description: 'Saldo wallet Anda telah ditambahkan',
            });
            fetchData();
          },
          onPending: () => {
            toast({
              title: 'Menunggu Pembayaran',
              description: 'Silakan selesaikan pembayaran Anda',
            });
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: 'Pembayaran Gagal',
              description: 'Terjadi kesalahan saat memproses pembayaran',
            });
          },
          onClose: () => {
            console.log('Snap closed');
          },
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Gagal membuat transaksi topup',
      });
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl px-4 py-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang, {profile?.name || user?.email}
          </p>
        </div>

        {/* Wallet Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Saldo Wallet</CardTitle>
            </div>
            <Badge variant={wallet?.status === 'active' ? 'default' : 'secondary'}>
              {wallet?.status || 'N/A'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {wallet ? formatCurrency(Number(wallet.balance)) : 'Rp 0'}
                </p>
                <p className="text-sm text-muted-foreground">Indonesian Rupiah</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTopup} disabled={isTopupLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isTopupLoading ? 'Memproses...' : 'Topup'}
                </Button>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
            </div>
            <CardDescription>20 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada transaksi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type === 'credit' ? (
                            <ArrowDownCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUpCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={tx.type === 'credit' ? 'default' : 'secondary'}>
                            {tx.type === 'credit' ? 'Masuk' : 'Keluar'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {tx.description || tx.reference_type || '-'}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
