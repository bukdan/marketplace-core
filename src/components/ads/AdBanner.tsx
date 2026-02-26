import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';
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
        .limit(5);

      if (data && data.length > 0) {
        setBanners(data);
      }
    };

    fetchBanners();
  }, [position]);

  // Rotate banners every 8 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length]);

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

  // If we have banners, show them
  if (banners.length > 0) {
    const banner = banners[currentIndex];

    return (
      <div className={cn('relative overflow-hidden group', positionStyles[position], className)}>
        <div
          className="absolute inset-0 cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
          onClick={() => handleClick(banner)}
        >
          <img
            src={banner.image_url}
            alt={banner.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4 text-background drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute top-1 left-1">
          <span className="text-[10px] bg-foreground/50 text-background px-1.5 py-0.5 rounded font-medium">
            Ad
          </span>
        </div>
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
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

  // Placeholder ad slot
  if (!showPlaceholder) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 flex flex-col items-center justify-center gap-2',
        positionStyles[position],
        className
      )}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground/60">Ruang Iklan</p>
        <p className="text-[10px] text-muted-foreground/40">{positionLabels[position]}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1">Google Ads · Sponsor</p>
      </div>
    </div>
  );
};
