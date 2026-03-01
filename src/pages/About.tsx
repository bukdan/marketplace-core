import { MainLayout } from '@/components/layout/MainLayout';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Users, Shield, TrendingUp, Heart, Globe,
  Mail, Phone, MapPin, ArrowRight
} from 'lucide-react';

const values = [
  { icon: Heart, title: 'Memberdayakan UMKM', description: 'Memberikan akses teknologi digital yang setara bagi seluruh pelaku UMKM di Indonesia.' },
  { icon: Shield, title: 'Keamanan Transaksi', description: 'Setiap transaksi dilindungi dengan sistem keamanan berlapis dan verifikasi KYC.' },
  { icon: Globe, title: 'Jangkauan Nasional', description: 'Menghubungkan penjual dan pembeli dari seluruh penjuru Indonesia.' },
  { icon: TrendingUp, title: 'Pertumbuhan Bersama', description: 'Mendorong pertumbuhan ekonomi lokal melalui digitalisasi UMKM.' },
];

const team = [
  { name: 'Ahmad Rizky', role: 'Founder & CEO', avatar: '👨‍💼' },
  { name: 'Siti Nurhaliza', role: 'CTO', avatar: '👩‍💻' },
  { name: 'Budi Santoso', role: 'Head of Product', avatar: '👨‍🔬' },
  { name: 'Dewi Lestari', role: 'Head of Marketing', avatar: '👩‍🎨' },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 mb-4">
              <Store className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">Tentang Kami</span>
            </div>
            <GradientHeading as="h1" variant="light" className="text-3xl md:text-5xl font-bold mb-4">
              Marketplace UMKM Indonesia
            </GradientHeading>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
              Platform digital terpadu untuk memberdayakan jutaan pelaku UMKM Indonesia 
              agar dapat bersaing di era ekonomi digital.
            </p>
          </div>
        </section>

        {/* Misi */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <GradientHeading as="h2" className="text-2xl md:text-3xl font-bold mb-4">
                Misi Kami
              </GradientHeading>
              <p className="text-muted-foreground text-lg leading-relaxed">
                UMKM ID hadir dengan misi untuk menjembatani kesenjangan digital bagi pelaku usaha mikro, kecil, 
                dan menengah di Indonesia. Kami percaya bahwa setiap UMKM berhak mendapatkan akses ke teknologi 
                yang dapat membantu mereka tumbuh dan berkembang.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {values.map((v) => (
                <Card key={v.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <v.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tim */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <GradientHeading as="h2" className="text-2xl md:text-3xl font-bold mb-4">
                Tim Kami
              </GradientHeading>
              <p className="text-muted-foreground">Orang-orang di balik platform UMKM ID</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              {team.map((member) => (
                <Card key={member.name} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-3">{member.avatar}</div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Kontak */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <GradientHeading as="h2" className="text-2xl md:text-3xl font-bold mb-4">
                Hubungi Kami
              </GradientHeading>
              <p className="text-muted-foreground">Kami siap membantu Anda</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <a href="mailto:support@umkmid.com" className="text-sm text-primary hover:underline">
                    support@umkmid.com
                  </a>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Telepon</h3>
                  <a href="tel:+622112345678" className="text-sm text-primary hover:underline">
                    +62 21 1234 5678
                  </a>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Alamat</h3>
                  <p className="text-sm text-muted-foreground">Jakarta, Indonesia</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <GradientHeading as="h2" variant="light" className="text-2xl font-bold mb-3">
              Bergabunglah Bersama Kami
            </GradientHeading>
            <p className="text-primary-foreground/70 mb-6">Mulai perjalanan digital bisnis Anda sekarang</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/auth')}>
                Daftar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="ghost" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10" onClick={() => navigate('/marketplace')}>
                Jelajahi Marketplace
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </MainLayout>
  );
};

export default About;
