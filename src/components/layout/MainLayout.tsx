import { ReactNode } from 'react';
import { Header } from './Header';
import { AdBanner } from '@/components/ads/AdBanner';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showAds?: boolean;
}

export const MainLayout = ({ children, showHeader = true, showAds = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      {/* Header Ad Banner */}
      {showAds && (
        <div className="container mx-auto px-4 pt-1">
          <AdBanner position="header" className="rounded-lg" />
        </div>
      )}
      {children}
      {/* Footer Ad Banner */}
      {showAds && (
        <div className="container mx-auto px-4 pb-1">
          <AdBanner position="footer" className="rounded-lg" />
        </div>
      )}
    </div>
  );
};
