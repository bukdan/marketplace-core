import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Star, TrendingUp, Zap, Loader2 } from 'lucide-react';

interface BoostType {
  id: string;
  name: string;
  type: 'highlight' | 'top_search' | 'premium';
  description: string | null;
  credits_per_day: number;
  multiplier: number | null;
}

interface BoostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  onSuccess?: () => void;
}

const boostIcons = {
  highlight: Star,
  top_search: TrendingUp,
  premium: Rocket,
};

export const BoostModal = ({ open, onOpenChange, listingId, listingTitle, onSuccess }: BoostModalProps) => {
  const { toast } = useToast();
  const [boostTypes, setBoostTypes] = useState<BoostType[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [selectedType, setSelectedType] = useState<BoostType | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBoostTypes();
      fetchUserCredits();
    }
  }, [open]);

  const fetchBoostTypes = async () => {
    const { data } = await supabase
      .from('boost_types')
      .select('*')
      .eq('is_active', true)
      .order('credits_per_day', { ascending: true });
    
    if (data) setBoostTypes(data as BoostType[]);
  };

  const fetchUserCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    if (data) setUserCredits(data.balance);
  };

  const totalCredits = selectedType ? selectedType.credits_per_day * days : 0;
  const hasEnoughCredits = userCredits >= totalCredits;

  const handleBoost = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('apply_listing_boost', {
        p_listing_id: listingId,
        p_boost_type: selectedType.type,
        p_days: days,
      });

      if (error) throw error;

      const result = data as any;
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({
        title: 'Boost Berhasil! 🚀',
        description: `Iklan Anda akan dipromosikan selama ${days} hari. Sisa kredit: ${result.new_balance}`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Gagal Boost',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Boost Iklan
          </DialogTitle>
          <DialogDescription>
            Promosikan "{listingTitle}" untuk meningkatkan visibilitas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Credit Balance */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Saldo Kredit Anda</span>
            <Badge variant="secondary" className="text-lg">
              {userCredits.toLocaleString('id-ID')} Kredit
            </Badge>
          </div>

          {/* Boost Types */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih Tipe Boost</label>
            <div className="grid gap-2">
              {boostTypes.map((type) => {
                const Icon = boostIcons[type.type];
                const isSelected = selectedType?.id === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <Badge variant="outline">
                      {type.credits_per_day} kredit/hari
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Durasi Boost</label>
            <div className="flex gap-2">
              {[3, 7, 14, 30].map((d) => (
                <Button
                  key={d}
                  variant={days === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDays(d)}
                >
                  {d} Hari
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedType && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>{selectedType.name}</span>
                <span>{selectedType.credits_per_day} × {days} hari</span>
              </div>
              {selectedType.type === 'premium' && (
                <p className="text-xs text-primary">✨ Iklan akan tampil di halaman utama sebagai Iklan Premium</p>
              )}
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total</span>
                <span className={!hasEnoughCredits ? 'text-destructive' : ''}>
                  {totalCredits.toLocaleString('id-ID')} Kredit
                </span>
              </div>
              {!hasEnoughCredits && (
                <p className="text-sm text-destructive">
                  Kredit tidak cukup. Anda perlu {(totalCredits - userCredits).toLocaleString('id-ID')} kredit lagi.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleBoost}
              disabled={!selectedType || !hasEnoughCredits || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Boost Sekarang'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
