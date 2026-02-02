import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Car, Home, Shirt, Sofa, Briefcase, Gamepad2, MoreHorizontal,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
}

interface CategorySectionProps {
  categories: Category[];
}

const categoryIcons: Record<string, React.ElementType> = {
  elektronik: Smartphone,
  kendaraan: Car,
  properti: Home,
  fashion: Shirt,
  'rumah-tangga': Sofa,
  'jasa-bisnis': Briefcase,
  'hobi-olahraga': Gamepad2,
};

export const CategorySection = ({ categories }: CategorySectionProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/marketplace?category=${categoryId}`);
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Kategori Populer
            </h2>
            <p className="text-muted-foreground">
              Temukan produk berdasarkan kategori yang Anda cari
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>
            Lihat Semua
          </Button>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug] || MoreHorizontal;
              
              return (
                <CarouselItem 
                  key={category.id} 
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <IconComponent className="h-7 w-7 text-primary" />
                      </div>
                      <span className="text-center text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
};
