import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'wrong_category' | 'duplicate' | 'other';

interface ReportListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

const reportReasons: { value: ReportReason; label: string; description: string; icon: string }[] = [
  { 
    value: 'spam', 
    label: 'Spam / Iklan Berulang', 
    description: 'Iklan yang sama diposting berkali-kali',
    icon: '🚫'
  },
  { 
    value: 'fraud', 
    label: 'Penipuan / Scam', 
    description: 'Iklan yang mencurigakan atau terindikasi penipuan',
    icon: '⚠️'
  },
  { 
    value: 'inappropriate', 
    label: 'Konten Tidak Pantas', 
    description: 'Mengandung konten vulgar, kekerasan, atau SARA',
    icon: '🔞'
  },
  { 
    value: 'wrong_category', 
    label: 'Kategori Salah', 
    description: 'Iklan dipasang di kategori yang tidak sesuai',
    icon: '📁'
  },
  { 
    value: 'duplicate', 
    label: 'Duplikat', 
    description: 'Iklan yang sudah ada sebelumnya',
    icon: '📋'
  },
  { 
    value: 'other', 
    label: 'Lainnya', 
    description: 'Alasan lain yang tidak tercantum di atas',
    icon: '💬'
  },
];

export const ReportListingModal = ({
  open,
  onOpenChange,
  listingId,
  listingTitle,
}: ReportListingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedReason = reportReasons.find(r => r.value === reason);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Login diperlukan',
        description: 'Silakan login terlebih dahulu untuk melaporkan iklan',
        variant: 'destructive',
      });
      return;
    }

    if (!reason) {
      toast({
        title: 'Pilih alasan',
        description: 'Silakan pilih alasan pelaporan',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('listing_reports').insert({
        listing_id: listingId,
        reporter_id: user.id,
        reason: reason,
        description: description.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: '✅ Laporan terkirim',
        description: 'Terima kasih atas laporan Anda. Tim kami akan meninjau segera.',
      });

      // Reset form and close
      setReason('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Gagal mengirim laporan',
        description: 'Terjadi kesalahan, silakan coba lagi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Laporkan Iklan</DialogTitle>
              <DialogDescription className="text-sm">
                Bantu kami menjaga marketplace tetap aman
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Listing being reported */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground mb-1">Iklan yang dilaporkan:</p>
            <p className="font-medium text-sm line-clamp-2">{listingTitle}</p>
          </div>

          {/* Reason Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Alasan Pelaporan <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={(val) => setReason(val as ReportReason)}>
              <SelectTrigger id="reason" className="h-12">
                <SelectValue placeholder="Pilih alasan pelaporan..." />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem 
                    key={r.value} 
                    value={r.value}
                    className="py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{r.icon}</span>
                      <div>
                        <p className="font-medium">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Reason Info */}
          {selectedReason && (
            <div className={cn(
              "p-3 rounded-lg border transition-all duration-300 animate-fade-in",
              reason === 'fraud' && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
              reason === 'inappropriate' && "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800",
              reason !== 'fraud' && reason !== 'inappropriate' && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
            )}>
              <p className="text-sm flex items-center gap-2">
                <span className="text-lg">{selectedReason.icon}</span>
                <span>{selectedReason.description}</span>
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi Tambahan (Opsional)
            </Label>
            <Textarea
              id="description"
              placeholder="Jelaskan lebih detail mengapa Anda melaporkan iklan ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500 karakter
            </p>
          </div>

          {/* Info Notice */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Laporan Anda akan ditinjau oleh tim moderasi kami dalam 24 jam. Identitas pelapor akan dirahasiakan.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Laporan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};