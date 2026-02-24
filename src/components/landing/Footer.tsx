import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    marketplace: [
      { label: 'Kategori', href: '/marketplace' },
      { label: 'Lelang', href: '/marketplace?price_type=auction' },
      { label: 'Produk Terbaru', href: '/marketplace?sort=newest' },
      { label: 'Promo', href: '/marketplace?featured=true' },
    ],
    seller: [
      { label: 'Mulai Jualan', href: '/auth' },
      { label: 'Beli Kredit', href: '/credits' },
      { label: 'FAQ & Bantuan', href: '/faq' },
      { label: 'Panduan Seller', href: '/faq' },
    ],
    company: [
      { label: 'Tentang Kami', href: '#' },
      { label: 'Kontak', href: '#' },
      { label: 'Karir', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    legal: [
      { label: 'Syarat & Ketentuan', href: '#' },
      { label: 'Kebijakan Privasi', href: '#' },
      { label: 'Kebijakan Cookie', href: '#' },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-8 w-8" />
              <span className="text-xl font-bold">UMKM ID</span>
            </div>
            <p className="mb-4 text-sm text-background/70">
              Platform digital terpadu untuk memberdayakan UMKM Indonesia. 
              Jual, beli, dan lelang produk lokal berkualitas dengan mudah dan aman.
            </p>
            <div className="space-y-2 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@umkmid.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="mb-4 font-semibold">Marketplace</h4>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div>
            <h4 className="mb-4 font-semibold">Seller</h4>
            <ul className="space-y-2">
              {footerLinks.seller.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 font-semibold">Perusahaan</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-background/20" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-background/70">
            © {currentYear} Marketplace UMKM ID. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.label}
                to={link.href} 
                className="text-sm text-background/70 hover:text-background transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
