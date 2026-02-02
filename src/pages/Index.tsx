import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, UserCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">E-Wallet Platform</CardTitle>
          <CardDescription>
            Kelola wallet Anda dengan mudah dan aman
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : user ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Sudah login</p>
                </div>
              </div>
              <Link to="/dashboard" className="block">
                <Button className="w-full">
                  Buka Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-center text-muted-foreground">
                Masuk atau daftar untuk mulai menggunakan layanan wallet
              </p>
              <div className="flex gap-2">
                <Link to="/auth" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link to="/auth" className="flex-1">
                  <Button className="w-full">
                    Daftar
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
