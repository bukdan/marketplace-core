import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SocialShareButtonsProps {
  title: string;
  url?: string;
  description?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

// Social media icons as SVG components
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export const SocialShareButtons = ({
  title,
  url,
  description,
  variant = 'default',
  className,
}: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description || title;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      color: 'text-green-500 hover:text-green-600',
      bgColor: 'hover:bg-green-50 dark:hover:bg-green-950/30',
      url: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${shareUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`,
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'text-foreground hover:text-foreground/80',
      bgColor: 'hover:bg-muted',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: 'text-sky-500 hover:text-sky-600',
      bgColor: 'hover:bg-sky-50 dark:hover:bg-sky-950/30',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: '✅ Link disalin!',
        description: 'Link iklan telah disalin ke clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Gagal menyalin',
        description: 'Tidak dapat menyalin link',
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  const openShareLink = (link: string) => {
    window.open(link, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={className}>
            <Share2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Bagikan ke
          </div>
          {shareLinks.map((link) => (
            <DropdownMenuItem
              key={link.name}
              onClick={() => openShareLink(link.url)}
              className={cn("cursor-pointer", link.bgColor)}
            >
              <link.icon className={cn("mr-3 h-5 w-5", link.color)} />
              <span>{link.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
            {copied ? (
              <Check className="mr-3 h-5 w-5 text-green-500" />
            ) : (
              <Copy className="mr-3 h-5 w-5" />
            )}
            <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
          </DropdownMenuItem>
          {typeof navigator !== 'undefined' && navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="mr-3 h-5 w-5" />
              <span>Bagikan Lainnya...</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-muted-foreground">Bagikan Iklan</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            variant="outline"
            size="sm"
            onClick={() => openShareLink(link.url)}
            className={cn(
              "gap-2 transition-all duration-200",
              link.bgColor
            )}
          >
            <link.icon className={cn("h-4 w-4", link.color)} />
            <span className="hidden sm:inline">{link.name}</span>
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Salin Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};