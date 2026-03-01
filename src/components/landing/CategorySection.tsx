import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Car, Home, Shirt, Sofa, Briefcase, Gamepad2, MoreHorizontal
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
}

interface CategorySectionProps {
  categories: Category[];
}

const categoryConfig: Record<string, { icon: React.ElementType; gradient: string; shadow: string; glow: string }> = {
  elektronik: {
    icon: Smartphone,
    gradient: 'from-blue-500 to-cyan-400',
    shadow: 'shadow-blue-500/40',
    glow: 'hover:shadow-blue-400/60',
  },
  kendaraan: {
    icon: Car,
    gradient: 'from-red-500 to-orange-400',
    shadow: 'shadow-red-500/40',
    glow: 'hover:shadow-red-400/60',
  },
  properti: {
    icon: Home,
    gradient: 'from-emerald-500 to-green-400',
    shadow: 'shadow-emerald-500/40',
    glow: 'hover:shadow-emerald-400/60',
  },
  fashion: {
    icon: Shirt,
    gradient: 'from-pink-500 to-rose-400',
    shadow: 'shadow-pink-500/40',
    glow: 'hover:shadow-pink-400/60',
  },
  'rumah-tangga': {
    icon: Sofa,
    gradient: 'from-amber-500 to-yellow-400',
    shadow: 'shadow-amber-500/40',
    glow: 'hover:shadow-amber-400/60',
  },
  'jasa-bisnis': {
    icon: Briefcase,
    gradient: 'from-violet-500 to-purple-400',
    shadow: 'shadow-violet-500/40',
    glow: 'hover:shadow-violet-400/60',
  },
  'hobi-olahraga': {
    icon: Gamepad2,
    gradient: 'from-teal-500 to-cyan-400',
    shadow: 'shadow-teal-500/40',
    glow: 'hover:shadow-teal-400/60',
  },
};

const defaultConfig = {
  icon: MoreHorizontal,
  gradient: 'from-gray-500 to-slate-400',
  shadow: 'shadow-gray-500/40',
  glow: 'hover:shadow-gray-400/60',
};


import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export const CategorySection = ({ categories }: CategorySectionProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/marketplace?category=${categoryId}`);
  };

  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{ align: 'start', loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category) => {
              const config = categoryConfig[category.slug] || defaultConfig;
              const IconComponent = config.icon;

              return (
                <CarouselItem
                  key={category.id}
                  className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div
                    className="group flex flex-col items-center gap-3 cursor-pointer py-4"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {/* Icon Container */}
                    <div
                      className={`
                        relative flex h-16 w-16 items-center justify-center rounded-2xl
                        bg-gradient-to-br ${config.gradient}
                        shadow-lg ${config.shadow} ${config.glow}
                        transition-all duration-500 ease-out
                        group-hover:scale-110 group-hover:shadow-2xl
                        group-hover:-translate-y-2 group-hover:rotate-3
                      `}
                    >
                      {/* Pulse ring animation on hover */}
                      <div
                        className={`
                          absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient}
                          opacity-0 group-hover:opacity-40
                          group-hover:animate-ping
                        `}
                      />
                      {/* Shimmer sweep */}
                      <div
                        className="
                          absolute inset-0 rounded-2xl overflow-hidden
                          before:absolute before:inset-0
                          before:-translate-x-full before:bg-gradient-to-r
                          before:from-transparent before:via-white/30 before:to-transparent
                          before:transition-transform before:duration-700
                          group-hover:before:translate-x-full
                        "
                      />
                      <IconComponent className="h-8 w-8 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Label */}
                    <span className="text-center text-xs font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                      {category.name}
                    </span>
                  </div>
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
