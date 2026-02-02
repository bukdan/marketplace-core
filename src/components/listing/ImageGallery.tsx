import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';

interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface ImageGalleryProps {
  images: ListingImage[];
  title: string;
  isPremium?: boolean;
}

export const ImageGallery = ({ images, title, isPremium = false }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const sortedImages = [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const currentImage = sortedImages[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/10 rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground">Tidak ada gambar</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative group">
          <div className="aspect-video bg-muted rounded-xl overflow-hidden shadow-lg">
            <img
              src={currentImage?.image_url}
              alt={title}
              className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300"
              onClick={() => setIsZoomed(true)}
            />
          </div>

          {/* Premium Badge */}
          {isPremium && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1">
              ✨ Premium
            </Badge>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {sortedImages.length}
          </div>

          {/* Zoom Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={() => setIsZoomed(true)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Navigation Arrows */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={goPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={goNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {sortedImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  idx === currentIndex
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={img.image_url}
                  alt={`${title} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <X className="h-5 w-5" />
          </DialogClose>
          
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <img
              src={currentImage?.image_url}
              alt={title}
              className="max-w-full max-h-full object-contain"
            />
            
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-12 w-12"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-12 w-12"
                  onClick={goNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Thumbnail strip in fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
              {sortedImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-12 h-12 rounded-md overflow-hidden transition-all",
                    idx === currentIndex ? "ring-2 ring-white" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
