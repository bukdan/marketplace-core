import { UserPlus, Upload, CreditCard, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: UserPlus,
    title: 'Daftar Gratis',
    description: 'Buat akun gratis dalam hitungan detik. Tidak ada biaya pendaftaran.',
  },
  {
    icon: CreditCard,
    title: 'Beli Kredit',
    description: 'Top up kredit sesuai kebutuhan. Harga mulai dari Rp 10.000.',
  },
  {
    icon: Upload,
    title: 'Pasang Iklan',
    description: 'Upload foto produk, isi detail, dan publikasikan iklan Anda.',
  },
  {
    icon: ShoppingCart,
    title: 'Mulai Transaksi',
    description: 'Terima pesanan dan jual produk ke seluruh Indonesia.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Cara Kerja Platform
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Mulai jualan di Marketplace UMKM ID dengan 4 langkah mudah
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-7xl font-bold text-muted/50">
                {index + 1}
              </div>
              <CardContent className="relative p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
