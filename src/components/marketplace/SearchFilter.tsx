import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

interface SearchFilterProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onConditionChange: (condition: string | null) => void;
  onPriceTypeChange: (priceType: string | null) => void;
  currentSort: string;
  currentCondition: string | null;
  currentPriceType: string | null;
}

export const SearchFilter = ({
  onSearchChange,
  onSortChange,
  onConditionChange,
  onPriceTypeChange,
  currentSort,
  currentCondition,
  currentPriceType,
}: SearchFilterProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    onSortChange('newest');
  };

  const hasActiveFilters = currentCondition || currentPriceType || currentSort !== 'newest';

  return (
    <div className="flex gap-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
      </div>

      {/* Sort Select */}
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="price_low">Termurah</SelectItem>
          <SelectItem value="price_high">Termahal</SelectItem>
          <SelectItem value="popular">Terpopuler</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Filter
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" /> Reset
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Condition Filter */}
            <div className="space-y-2">
              <Label>Kondisi</Label>
              <Select 
                value={currentCondition || ''} 
                onValueChange={(v) => onConditionChange(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kondisi</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="like_new">Seperti Baru</SelectItem>
                  <SelectItem value="good">Bagus</SelectItem>
                  <SelectItem value="fair">Cukup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Type Filter */}
            <div className="space-y-2">
              <Label>Tipe Harga</Label>
              <Select 
                value={currentPriceType || ''} 
                onValueChange={(v) => onPriceTypeChange(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Tipe</SelectItem>
                  <SelectItem value="fixed">Harga Pas</SelectItem>
                  <SelectItem value="negotiable">Nego</SelectItem>
                  <SelectItem value="auction">Lelang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="mt-6 w-full" 
            onClick={() => setIsFilterOpen(false)}
          >
            Terapkan Filter
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
};
