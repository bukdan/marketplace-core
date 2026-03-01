import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout showAds={false}>
      <main className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl font-semibold text-foreground">Halaman Tidak Ditemukan</p>
        <p className="mb-8 text-muted-foreground max-w-md">
          Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Beranda
          </Button>
        </div>
      </main>
    </MainLayout>
  );
};

export default NotFound;