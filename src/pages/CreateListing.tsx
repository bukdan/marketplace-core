import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useKyc } from '@/hooks/useKyc';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Camera, X, ArrowLeft, Loader2, ImagePlus, Coins, AlertCircle, Video, ShieldAlert,
} from 'lucide-react';
import { z } from 'zod';

const MAX_FREE_IMAGES = 5;
const CREDIT_PER_EXTRA_IMAGE = 1;
const CREDIT_PER_LISTING = 1;
const CREDIT_FOR_AUCTION = 2;

const listingSchema = z.object({
  title: z.string().min(10, 'Judul minimal 10 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(2000, 'Deskripsi maksimal 2000 karakter'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  category_id: z.string().min(1, 'Pilih kategori'),
  price_type: z.enum(['fixed', 'negotiable', 'auction']),
  listing_type: z.enum(['sale', 'rent', 'service', 'wanted']),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
});

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

const CreateListing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { credits, refetchCredits } = useCredits();
  const { kyc, isLoading: kycLoading } = useKyc();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category_id: '',
    subcategory_id: '',
    price_type: 'fixed' as 'fixed' | 'negotiable' | 'auction',
    listing_type: 'sale' as 'sale' | 'rent' | 'service' | 'wanted',
    condition: 'good' as 'new' | 'like_new' | 'good' | 'fair',
    video_url: '',
    contact_name: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_email: '',
    contact_preference: 'whatsapp',
    rental_period: '',
    rental_price: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const parentCategories = categories.filter(c => !c.parent_id);
  const subcategories = categories.filter(c => c.parent_id === formData.category_id);

  const calculateCreditsNeeded = () => {
    let total = CREDIT_PER_LISTING;
    if (formData.price_type === 'auction') total = CREDIT_FOR_AUCTION;
    const extraImages = Math.max(0, images.length - MAX_FREE_IMAGES);
    total += extraImages * CREDIT_PER_EXTRA_IMAGE;
    return total;
  };

  const hasEnoughCredits = () => (credits?.balance || 0) >= calculateCreditsNeeded();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} bukan file gambar`); return false; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} terlalu besar (max 5MB)`); return false; }
      return true;
    });
    if (images.length + validFiles.length > 10) { toast.error('Maksimal 10 gambar'); return; }
    setImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${listingId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, file);
      if (uploadError) throw new Error(`Gagal upload gambar: ${file.name}`);
      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      listingSchema.parse(formData);
      setErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => { if (error.path[0]) newErrors[error.path[0] as string] = error.message; });
        setErrors(newErrors);
        toast.error('Mohon perbaiki form yang salah');
        return;
      }
    }

    if (images.length === 0) { toast.error('Minimal upload 1 gambar'); return; }
    if (!hasEnoughCredits()) { toast.error('Kredit tidak cukup'); navigate('/credits'); return; }

    setSubmitting(true);
    try {
      const insertData: any = {
        user_id: user!.id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.category_id,
        price_type: formData.price_type,
        listing_type: formData.listing_type,
        condition: formData.condition,
        province: kyc?.province || null,
        city: kyc?.city || null,
        address: kyc?.full_address || null,
        status: 'pending_review',
        credits_used: calculateCreditsNeeded(),
        video_url: formData.video_url || null,
        contact_name: formData.contact_name || null,
        contact_phone: formData.contact_phone || null,
        contact_whatsapp: formData.contact_whatsapp || null,
        contact_email: formData.contact_email || null,
        contact_preference: formData.contact_preference || null,
      };

      if (formData.subcategory_id) insertData.subcategory_id = formData.subcategory_id;
      if (formData.listing_type === 'rent') {
        insertData.rental_period = formData.rental_period || null;
        insertData.rental_price = formData.rental_price || null;
      }

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert(insertData)
        .select('id')
        .single();

      if (listingError) throw listingError;

      const imageUrls = await uploadImages(listing.id);
      const imageRecords = imageUrls.map((url, index) => ({
        listing_id: listing.id,
        image_url: url,
        is_primary: index === 0,
        sort_order: index,
        is_paid: index >= MAX_FREE_IMAGES,
      }));

      const { error: imagesError } = await supabase.from('listing_images').insert(imageRecords);
      if (imagesError) throw imagesError;

      if (formData.price_type === 'auction') {
        const { error: auctionError } = await supabase.from('listing_auctions').insert({
          listing_id: listing.id,
          starting_price: formData.price,
          current_price: formData.price,
          min_increment: Math.max(10000, formData.price * 0.05),
          ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (auctionError) throw auctionError;
      }

      await refetchCredits();
      toast.success('Iklan berhasil dibuat!');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Create listing error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal membuat iklan');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || kycLoading) {
    return (
      <MainLayout>
        <div className="container max-w-2xl px-4 py-6">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const isKycApproved = kyc?.status === 'approved';

  if (!isKycApproved) {
    return (
      <MainLayout>
        <div className="container max-w-lg px-4 py-12">
          <Card className="text-center">
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <div className="rounded-full bg-destructive/10 p-4">
                <ShieldAlert className="h-10 w-10 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">Verifikasi KYC Diperlukan</h2>
              <p className="text-muted-foreground max-w-sm">
                Anda harus menyelesaikan verifikasi identitas (KYC) sebelum dapat memasang iklan di UMKM ID.
              </p>
              {kyc?.status === 'pending' ? (
                <Badge variant="secondary" className="text-sm">KYC Anda sedang diproses</Badge>
              ) : kyc?.status === 'rejected' ? (
                <div className="space-y-2">
                  <Badge variant="destructive" className="text-sm">KYC Ditolak</Badge>
                  {kyc.rejection_reason && (
                    <p className="text-sm text-muted-foreground">Alasan: {kyc.rejection_reason}</p>
                  )}
                  <Button onClick={() => navigate('/dashboard/kyc')}>Ajukan Ulang KYC</Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/dashboard/kyc')}>Mulai Verifikasi KYC</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Jual Barang</h1>
            <p className="text-sm text-muted-foreground">Jual produk atau jasa Anda di UMKM ID</p>
          </div>
        </div>

        {/* Credit Info */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Saldo Kredit Anda</p>
                <p className="text-xs text-muted-foreground">Biaya: {calculateCreditsNeeded()} kredit</p>
              </div>
            </div>
            <Badge variant={hasEnoughCredits() ? 'default' : 'destructive'}>
              {credits?.balance || 0} Kredit
            </Badge>
          </CardContent>
        </Card>

        {!hasEnoughCredits() && (
          <Card className="mb-6 border-destructive">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Kredit tidak cukup</p>
                <p className="text-xs text-muted-foreground">
                  Anda membutuhkan {calculateCreditsNeeded()} kredit
                </p>
              </div>
              <Button size="sm" onClick={() => navigate('/credits')}>Beli Kredit</Button>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto Produk</CardTitle>
              <CardDescription>
                Upload hingga 10 foto. {MAX_FREE_IMAGES} pertama gratis, selanjutnya 1 kredit/foto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                    {index >= MAX_FREE_IMAGES && (
                      <Badge variant="secondary" className="absolute left-1 top-1 text-xs">+1</Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Utama</Badge>}
                  </div>
                ))}
                {images.length < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary hover:bg-muted/50">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Tambah Foto</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5" /> Video (Opsional)
              </CardTitle>
              <CardDescription>Tambahkan link video YouTube untuk produk Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Iklan *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: iPhone 15 Pro Max 256GB Bekas Like New"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan kondisi produk, spesifikasi, alasan jual, dll."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                </div>

                {subcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sub Kategori</Label>
                    <Select
                      value={formData.subcategory_id}
                      onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sub kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price & Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Harga & Tipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipe Iklan</Label>
                  <Select
                    value={formData.listing_type}
                    onValueChange={(value: 'sale' | 'rent' | 'service' | 'wanted') =>
                      setFormData({ ...formData, listing_type: value })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Jual</SelectItem>
                      <SelectItem value="rent">Sewa</SelectItem>
                      <SelectItem value="service">Jasa</SelectItem>
                      <SelectItem value="wanted">Dicari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kondisi</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value: 'new' | 'like_new' | 'good' | 'fair') =>
                      setFormData({ ...formData, condition: value })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Baru</SelectItem>
                      <SelectItem value="like_new">Seperti Baru</SelectItem>
                      <SelectItem value="good">Baik</SelectItem>
                      <SelectItem value="fair">Cukup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipe Harga</Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value: 'fixed' | 'negotiable' | 'auction') =>
                    setFormData({ ...formData, price_type: value })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Harga Pas</SelectItem>
                    <SelectItem value="negotiable">Nego</SelectItem>
                    <SelectItem value="auction">Lelang (+1 kredit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{formData.price_type === 'auction' ? 'Harga Awal' : 'Harga'} (Rp) *</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              {formData.listing_type === 'rent' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Harga Sewa (Rp)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.rental_price || ''}
                      onChange={(e) => setFormData({ ...formData, rental_price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Periode Sewa</Label>
                    <Select
                      value={formData.rental_period}
                      onValueChange={(value) => setFormData({ ...formData, rental_period: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih periode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_jam">Per Jam</SelectItem>
                        <SelectItem value="per_hari">Per Hari</SelectItem>
                        <SelectItem value="per_minggu">Per Minggu</SelectItem>
                        <SelectItem value="per_bulan">Per Bulan</SelectItem>
                        <SelectItem value="per_tahun">Per Tahun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kontak</CardTitle>
              <CardDescription>Informasi kontak untuk calon pembeli</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Kontak</Label>
                  <Input
                    placeholder="Nama Anda"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferensi Kontak</Label>
                  <Select
                    value={formData.contact_preference}
                    onValueChange={(value) => setFormData({ ...formData, contact_preference: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone">Telepon</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="chat">Chat Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input
                    placeholder="08xx..."
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    placeholder="08xx..."
                    value={formData.contact_whatsapp}
                    onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="email@example.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting || !hasEnoughCredits()}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
              ) : (
                <><Camera className="mr-2 h-4 w-4" />Jual Barang ({calculateCreditsNeeded()} Kredit)</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateListing;
