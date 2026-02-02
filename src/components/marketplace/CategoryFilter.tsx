import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Smartphone, 
  Car, 
  Home, 
  Shirt, 
  Gamepad2, 
  Sofa, 
  Wrench, 
  MoreHorizontal,
  Grid3X3
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'elektronik': <Smartphone className="h-4 w-4" />,
  'kendaraan': <Car className="h-4 w-4" />,
  'properti': <Home className="h-4 w-4" />,
  'fashion': <Shirt className="h-4 w-4" />,
  'hobi-koleksi': <Gamepad2 className="h-4 w-4" />,
  'rumah-tangga': <Sofa className="h-4 w-4" />,
  'jasa': <Wrench className="h-4 w-4" />,
  'lainnya': <MoreHorizontal className="h-4 w-4" />,
};

export const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(null)}
          className="flex items-center gap-2"
        >
          <Grid3X3 className="h-4 w-4" />
          Semua
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className="flex items-center gap-2"
          >
            {categoryIcons[category.slug] || <Grid3X3 className="h-4 w-4" />}
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
