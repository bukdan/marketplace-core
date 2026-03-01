import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdPosition = 'header' | 'footer' | 'sidebar' | 'inline' | 'detail';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  position: string;
}

interface AdBannerProps {
  position: AdPosition;
  className?: string;
  /** If true, shows a placeholder ad slot when no banners are available */
  showPlaceholder?: boolean;
}

const positionStyles: Record<AdPosition, string> = {
  header: 'w-full h-[90px] md:h-[90px]',
  footer: 'w-full h-[90px] md:h-[90px]',
  sidebar: 'w-full h-[250px]',
  inline: 'w-full h-[120px] md:h-[100px]',
  detail: 'w-full h-[250px] md:h-[280px]',
};

const positionLabels: Record<AdPosition, string> = {
  header: 'Leaderboard 728×90',
  footer: 'Leaderboard 728×90',
  sidebar: 'Medium Rectangle 300×250',
  inline: 'Banner 468×60',
  detail: 'Medium Rectangle 300×250',
};

// Placeholder ads for when no real banners exist
const placeholderAds = [
  { id: 'ph-1', title: 'Ruang Iklan Premium', color: 'from-primary/20 to-primary/5' },
  { id: 'ph-2', title: 'Jual Barang Anda', color: 'from-blue-500/20 to-blue-500/5' },
  { id: 'ph-3', title: 'Promosi Bisnis Anda', color: 'from-emerald-500/20 to-emerald-500/5' },
];

export const AdBanner = ({ position, className, showPlaceholder = true }: AdBannerProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const positionMap: Record<AdPosition, 'hero' | 'footer' | 'sidebar' | 'inline'> = {
        header: 'hero',
        footer: 'footer',
        sidebar: 'sidebar',
        inline: 'inline',
        detail: 'sidebar',
      };

      const { data } = await supabase
        .from('banners')
        .select('id, title, image_url, target_url, position')
        .eq('status', 'active' as any)
        .eq('position', positionMap[position])
        .order('priority', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setBanners(data);
      }
    };

    fetchBanners();
  }, [position]);

  // Auto-rotate every 5 seconds
  const itemCount = banners.length > 0 ? banners.length : (showPlaceholder ? placeholderAds.length : 0);

  useEffect(() => {
    if (itemCount <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [itemCount]);

  const trackEvent = useCallback(async (bannerId: string, eventType: string) => {
    try {
      await supabase.from('banner_events').insert({
        banner_id: bannerId,
        event_type: eventType,
      });
    } catch {
      // silent
    }
  }, []);

  const handleClick = (banner: Banner) => {
    trackEvent(banner.id, 'click');
    window.open(banner.target_url, '_blank', 'noopener,noreferrer');
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  };

  // Real banners carousel
  if (banners.length > 0) {
    const banner = banners[currentIndex];

    return (
      <div className={cn('relative overflow-hidden group rounded-lg', positionStyles[position], className)}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)`, width: `${banners.length * 100}%` }}
        >
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative cursor-pointer flex-shrink-0 h-full"
              style={{ width: `${100 / banners.length}%` }}
              onClick={() => handleClick(b)}
            >
              <img
                src={b.image_url}
                alt={b.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Ad label */}
        <div className="absolute top-1 left-1 z-10">
          <span className="text-[10px] bg-foreground/50 text-background px-1.5 py-0.5 rounded font-medium">
            Ad
          </span>
        </div>

        {/* External link icon */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <ExternalLink className="h-4 w-4 text-background drop-shadow-lg" />
        </div>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-4 bg-background' : 'w-1.5 bg-background/50'
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Placeholder carousel
  if (!showPlaceholder) return null;

  const currentPlaceholder = placeholderAds[currentIndex % placeholderAds.length];

  return (
    <div className={cn('relative overflow-hidden rounded-lg group', positionStyles[position], className)}>
      {/* Placeholder slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${(currentIndex % placeholderAds.length) * 100}%)`, width: `${placeholderAds.length * 100}%` }}
      >
        {placeholderAds.map((ph) => (
          <div
            key={ph.id}
            className={cn(
              'flex-shrink-0 h-full flex flex-col items-center justify-center gap-2 border border-dashed border-muted-foreground/20',
              `bg-gradient-to-br ${ph.color}`
            )}
            style={{ width: `${100 / placeholderAds.length}%` }}
          >
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground/60">{ph.title}</p>
              <p className="text-[10px] text-muted-foreground/40">{positionLabels[position]}</p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">Google Ads · Sponsor</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows for placeholders */}
      {placeholderAds.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </>
      )}

      {/* Dots for placeholders */}
      {placeholderAds.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {placeholderAds.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === (currentIndex % placeholderAds.length) ? 'w-4 bg-muted-foreground/40' : 'w-1.5 bg-muted-foreground/20'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
