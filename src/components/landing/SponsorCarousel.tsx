import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Sponsor {
  name: string;
  logo: string;
  url: string;
  description?: string;
}

const sponsors: Sponsor[] = [
  { name: 'Google', logo: 'https://logo.clearbit.com/google.com', url: 'https://google.com', description: 'Search & Cloud Platform' },
  { name: 'Tokopedia', logo: 'https://logo.clearbit.com/tokopedia.com', url: 'https://tokopedia.com', description: 'E-Commerce Indonesia' },
  { name: 'Shopee', logo: 'https://logo.clearbit.com/shopee.co.id', url: 'https://shopee.co.id', description: 'Online Shopping Platform' },
  { name: 'BCA', logo: 'https://logo.clearbit.com/bca.co.id', url: 'https://bca.co.id', description: 'Bank Central Asia' },
  { name: 'Telkomsel', logo: 'https://logo.clearbit.com/telkomsel.com', url: 'https://telkomsel.com', description: 'Telekomunikasi Indonesia' },
  { name: 'Gojek', logo: 'https://logo.clearbit.com/gojek.com', url: 'https://gojek.com', description: 'Super App Indonesia' },
  { name: 'Grab', logo: 'https://logo.clearbit.com/grab.com', url: 'https://grab.com', description: 'Ride-hailing & Delivery' },
  { name: 'Bukalapak', logo: 'https://logo.clearbit.com/bukalapak.com', url: 'https://bukalapak.com', description: 'Marketplace UMKM' },
];

// Double the array for seamless infinite scroll
const doubledSponsors = [...sponsors, ...sponsors];

export const SponsorCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full py-6">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-background/40 mb-5">
        Didukung Oleh
      </p>
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-foreground to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-foreground to-transparent" />

        <div
          className={cn(
            'flex items-center gap-12 w-max',
            'animate-sponsor-scroll',
            isPaused && '[animation-play-state:paused]'
          )}
        >
          {doubledSponsors.map((sponsor, i) => (
            <Tooltip key={`${sponsor.name}-${i}`}>
              <TooltipTrigger asChild>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex-shrink-0 flex items-center justify-center h-14 w-28 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="h-8 max-w-[100px] object-contain brightness-0 invert opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback: show sponsor name as text
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const span = document.createElement('span');
                      span.textContent = sponsor.name;
                      span.className = 'text-sm font-bold opacity-40 group-hover:opacity-100 transition-opacity text-background';
                      target.parentElement?.appendChild(span);
                    }}
                  />
                  <ExternalLink className="absolute -top-1 -right-1 h-3 w-3 text-background/0 group-hover:text-background/60 transition-all duration-300" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-center">
                <p className="font-semibold text-sm">{sponsor.name}</p>
                {sponsor.description && (
                  <p className="text-xs text-muted-foreground">{sponsor.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};
