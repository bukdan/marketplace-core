import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientHeading } from '@/components/ui/gradient-heading';

export const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Store, text: 'Jangkau jutaan pembeli' },
    { icon: TrendingUp, text: 'Tingkatkan omzet bisnis' },
    { icon: Shield, text: 'Transaksi aman & terpercaya' },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <GradientHeading variant="light" className="mb-4 text-2xl font-bold md:text-4xl">
            Siap Mengembangkan Bisnis UMKM Anda?
          </GradientHeading>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Bergabunglah dengan ribuan pelaku UMKM yang telah sukses berjualan 
            di platform kami. Daftar gratis dan mulai jualan sekarang!
          </p>

          {/* Benefits */}
          <div className="mb-8 flex flex-wrap justify-center gap-6">
            {benefits.map((benefit) => (
              <div 
                key={benefit.text} 
                className="flex items-center gap-2 text-primary-foreground"
              >
                <benefit.icon className="h-5 w-5" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/marketplace')}
            >
              Lihat Marketplace
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
