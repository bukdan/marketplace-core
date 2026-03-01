import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  Package, 
  ThumbsUp, 
  Star,
  Gavel,
  Tag,
  ArrowUpDown,
  MapPin
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Province {
  id: string;
  name: string;
}

interface SearchFilterProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onConditionChange: (condition: string | null) => void;
  onPriceTypeChange: (priceType: string | null) => void;
  onProvinceChange?: (provinceId: string | null) => void;
  currentSort: string;
  currentCondition: string | null;
  currentPriceType: string | null;
  currentProvince?: string | null;
}

const conditionOptions = [
  { value: 'new', label: 'Baru', icon: Sparkles, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20' },
  { value: 'like_new', label: 'Seperti Baru', icon: Star, color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20' },
  { value: 'good', label: 'Bagus', icon: ThumbsUp, color: 'bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20' },
  { value: 'fair', label: 'Cukup', icon: Package, color: 'bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/20' },
];

const priceTypeOptions = [
  { value: 'fixed', label: 'Harga Pas', icon: Tag, color: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
  { value: 'negotiable', label: 'Bisa Nego', icon: ArrowUpDown, color: 'bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20' },
  { value: 'auction', label: 'Lelang', icon: Gavel, color: 'bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20' },
];

export const SearchFilter = ({
  onSearchChange,
  onSortChange,
  onConditionChange,
  onPriceTypeChange,
  onProvinceChange,
  currentSort,
  currentCondition,
  currentPriceType,
  currentProvince,
}: SearchFilterProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const { data } = await supabase
        .from('provinces')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (data) setProvinces(data);
    };
    fetchProvinces();
  }, []);

  const handleSearch = () => {
    onSearchChange(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    onConditionChange(null);
    onPriceTypeChange(null);
    onProvinceChange?.(null);
    onSortChange('newest');
  };

  const hasActiveFilters = currentCondition || currentPriceType || currentProvince || currentSort !== 'newest';
  const activeFilterCount = [currentCondition, currentPriceType, currentProvince].filter(Boolean).length;

  return (
    <div className="space-y-2">
      {/* Search Row */}
      <div className="flex flex-wrap gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk, kategori, atau penjual..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 h-11 rounded-full bg-muted/50 focus:bg-background"
          />
          <button type="button" onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
            <Search className="h-3.5 w-3.5 text-primary-foreground" />
          </button>
        </div>

        {/* Province Select */}
        <Select 
          value={currentProvince || 'all'} 
          onValueChange={(v) => onProvinceChange?.(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-[170px] h-11 rounded-full">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Semua Provinsi" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Semua Provinsi</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[150px] h-11 rounded-full">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">🆕 Terbaru</SelectItem>
            <SelectItem value="price_low">💰 Termurah</SelectItem>
            <SelectItem value="price_high">💎 Termahal</SelectItem>
            <SelectItem value="popular">🔥 Terpopuler</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Sheet */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative h-11 gap-2 rounded-full">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  Filter Produk
                </span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="mr-1 h-4 w-4" /> Reset Semua
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-8 space-y-8">
              {/* Condition Filter */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Kondisi Barang
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {conditionOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentCondition === option.value;
                    return (
                      <Button
                        key={option.value}
                        variant="outline"
                        className={cn(
                          "h-auto py-3 justify-start gap-3 transition-all rounded-full",
                          isSelected 
                            ? option.color + " ring-2 ring-offset-2 ring-current"
                            : "hover:bg-muted"
                        )}
                        onClick={() => onConditionChange(isSelected ? null : option.value)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Price Type Filter */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Tipe Harga
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {priceTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentPriceType === option.value;
                    return (
                      <Button
                        key={option.value}
                        variant="outline"
                        className={cn(
                          "h-auto py-3 justify-start gap-3 transition-all rounded-full",
                          isSelected 
                            ? option.color + " ring-2 ring-offset-2 ring-current"
                            : "hover:bg-muted"
                        )}
                        onClick={() => onPriceTypeChange(isSelected ? null : option.value)}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                          <span className="font-medium block">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.value === 'fixed' && 'Tidak bisa ditawar'}
                            {option.value === 'negotiable' && 'Harga bisa negosiasi'}
                            {option.value === 'auction' && 'Ikut lelang untuk membeli'}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 rounded-full" 
                onClick={() => {
                  clearFilters();
                  setIsFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button 
                className="flex-1 rounded-full" 
                onClick={() => setIsFilterOpen(false)}
              >
                Terapkan Filter
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>


    </div>
  );
};
