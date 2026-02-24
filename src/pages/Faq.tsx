import { MainLayout } from '@/components/layout/MainLayout';
import { Footer } from '@/components/landing/Footer';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { useLandingData } from '@/hooks/useLandingData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const faqItems = [
  {
    question: 'Apa itu UMKM ID?',
    answer: 'UMKM ID adalah platform marketplace digital yang dirancang khusus untuk memberdayakan UMKM Indonesia. Di sini Anda bisa menjual, membeli, dan melelang produk lokal berkualitas dengan mudah dan aman.',
  },
  {
    question: 'Bagaimana cara mendaftar?',
    answer: 'Pendaftaran gratis dan sangat mudah. Cukup klik tombol "Daftar" di halaman utama, masukkan email dan password Anda, lalu verifikasi email untuk mulai menggunakan platform.',
  },
  {
    question: 'Apa itu kredit dan bagaimana cara menggunakannya?',
    answer: 'Kredit adalah mata uang digital di platform kami yang digunakan untuk memasang iklan, menambah gambar, membuat lelang, dan mempromosikan produk. Anda bisa membeli kredit melalui berbagai metode pembayaran yang tersedia.',
  },
  {
    question: 'Berapa biaya untuk memasang iklan?',
    answer: 'Memasang iklan dasar memerlukan 1 kredit. Gambar tambahan memerlukan 1 kredit, listing lelang 2 kredit, dan boost/promosi mulai dari 5 kredit per hari.',
  },
  {
    question: 'Apakah ada biaya transaksi?',
    answer: 'Platform mengenakan biaya layanan yang minimal untuk setiap transaksi berhasil. Biaya ini digunakan untuk menjaga kualitas layanan dan keamanan platform.',
  },
  {
    question: 'Bagaimana sistem lelang bekerja?',
    answer: 'Penjual dapat membuat listing lelang dengan harga awal dan durasi tertentu. Pembeli bisa memberikan penawaran (bid) dan penawaran tertinggi saat lelang berakhir akan memenangkan produk tersebut.',
  },
  {
    question: 'Bagaimana cara menarik saldo?',
    answer: 'Anda dapat melakukan penarikan saldo melalui menu Dashboard > Penarikan. Dana akan ditransfer ke rekening bank yang terdaftar dalam 1-3 hari kerja.',
  },
  {
    question: 'Apakah transaksi aman?',
    answer: 'Ya, semua transaksi dilindungi dengan sistem keamanan berlapis. Kami juga menerapkan verifikasi KYC (Know Your Customer) untuk memastikan keamanan dan kepercayaan antar pengguna.',
  },
  {
    question: 'Bagaimana cara menghubungi customer support?',
    answer: 'Anda dapat menghubungi tim support kami melalui fitur Tiket Support di Dashboard, email di support@umkmid.com, atau telepon di +62 21 1234 5678.',
  },
  {
    question: 'Apakah bisa boost/promosikan iklan?',
    answer: 'Ya! Kami menyediakan beberapa opsi boost: Highlight (5 kredit/hari), Top Search (10 kredit/hari), dan Premium Boost (20 kredit/hari) untuk meningkatkan visibilitas iklan Anda.',
  },
];

const Faq = () => {
  const navigate = useNavigate();
  const { testimonials, creditPackages, loading } = useLandingData();

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-64 mx-auto mb-8" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-3" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero FAQ */}
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 mb-4">
              <HelpCircle className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">Pusat Bantuan</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">
              Temukan jawaban untuk pertanyaan umum tentang platform UMKM ID
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border bg-card px-4"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorksSection />

        {/* Pricing */}
        <PricingSection packages={creditPackages} />

        {/* Testimonials */}
        <TestimonialsSection testimonials={testimonials} />

        {/* Contact Support */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Masih Butuh Bantuan?
            </h2>
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-3">Hubungi tim support kami</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/support')}>
                    Buka Tiket
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground mb-3">support@umkmid.com</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@umkmid.com">Kirim Email</a>
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Telepon</h3>
                  <p className="text-sm text-muted-foreground mb-3">+62 21 1234 5678</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="tel:+622112345678">Hubungi</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </MainLayout>
  );
};

export default Faq;
