import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Banknote, Upload, Copy, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

interface ManualTransferFormProps {
  selectedPackage: { id: string; name: string; credits: number; bonus_credits: number; price: number } | null;
  onBack: () => void;
  onSuccess: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export function ManualTransferForm({ selectedPackage, onBack, onSuccess }: ManualTransferFormProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const bankInfo = {
    bank: 'BNI',
    accountNumber: '1186096134',
    accountHolder: 'PT. Ihsan Media Kreatif',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('topup-proofs')
      .upload(fileName, file);

    if (error) {
      toast.error('Gagal upload bukti transfer');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('topup-proofs')
      .getPublicUrl(data.path);

    setProofUrl(urlData.publicUrl);
    setUploading(false);
    toast.success('Bukti transfer berhasil diupload');
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !user || !proofUrl) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('credit_topup_requests')
      .insert({
        user_id: user.id,
        package_id: selectedPackage.id,
        amount: selectedPackage.price,
        credits_amount: selectedPackage.credits,
        bonus_credits: selectedPackage.bonus_credits,
        proof_image_url: proofUrl,
        bank_name: bankInfo.bank,
        account_number: bankInfo.accountNumber,
        account_holder: bankInfo.accountHolder,
      });

    if (error) {
      toast.error('Gagal mengirim permintaan');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    toast.success('Permintaan top up berhasil dikirim!');
    onSuccess();
  };

  if (!selectedPackage) return null;

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h3 className="text-xl font-bold">Permintaan Terkirim!</h3>
          <p className="text-muted-foreground">
            Permintaan top up kredit Anda sedang diverifikasi oleh admin. 
            Kredit akan ditambahkan setelah transfer dikonfirmasi.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Estimasi 1x24 jam
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pilihan Paket
      </Button>

      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedPackage.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedPackage.credits} Kredit
                {selectedPackage.bonus_credits > 0 && <span className="text-primary"> + {selectedPackage.bonus_credits} Bonus</span>}
              </p>
            </div>
            <p className="text-xl font-bold">{formatCurrency(selectedPackage.price)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Transfer ke Rekening
          </CardTitle>
          <CardDescription>Silakan transfer sesuai nominal ke rekening berikut</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Bank</p>
              <p className="font-bold text-lg">{bankInfo.bank}</p>
            </div>
            <Badge>Bank Negara Indonesia</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">No. Rekening</p>
              <p className="font-bold text-lg font-mono">{bankInfo.accountNumber}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(bankInfo.accountNumber)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Atas Nama</p>
              <p className="font-medium">{bankInfo.accountHolder}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/10">
            <div>
              <p className="text-sm text-muted-foreground">Nominal Transfer</p>
              <p className="font-bold text-xl text-primary">{formatCurrency(selectedPackage.price)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(String(selectedPackage.price))}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Proof */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Bukti Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          {proofUrl ? (
            <div className="space-y-2">
              <img src={proofUrl} alt="Bukti transfer" className="rounded-lg border max-h-48 w-full object-contain" />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Ganti Gambar
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-24 border-dashed" 
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Mengupload...' : 'Klik untuk upload bukti transfer (max 5MB)'}
            </Button>
          )}

          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={!proofUrl || submitting}
          >
            {submitting ? 'Mengirim...' : 'Kirim Permintaan Top Up'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
