import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KycImageUploadProps {
  label: string;
  hint: string;
  value: string;
  userId: string;
  folder: string; // e.g. 'ktp' or 'selfie'
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function KycImageUpload({ label, hint, value, userId, folder, onChange, disabled }: KycImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({ variant: 'destructive', title: 'File terlalu besar', description: 'Maksimal ukuran file 5MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Format tidak didukung', description: 'Gunakan format JPG, PNG, atau WebP' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/${folder}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast({ title: 'Upload berhasil', description: `${label} berhasil diupload` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload gagal', description: err.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
          <img src={value} alt={label} className="w-full h-48 object-cover" />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full h-48 rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Mengupload...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Klik untuk upload</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP (maks 5MB)</span>
            </>
          )}
        </button>
      )}
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
