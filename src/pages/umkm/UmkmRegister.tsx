import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUmkmProfile, CreateUmkmProfileData } from '@/hooks/useUmkmProfile';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Store, MapPin, Phone, Mail, Globe, Building2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const umkmSchema = z.object({
  umkm_name: z.string().min(3, 'Nama usaha minimal 3 karakter'),
  brand_name: z.string().optional(),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter').optional(),
  phone: z.string().min(10, 'Nomor telepon tidak valid').optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  website: z.string().url('URL tidak valid').optional().or(z.literal('')),
  address: z.string().min(10, 'Alamat minimal 10 karakter').optional(),
  city: z.string().min(2, 'Kota tidak valid').optional(),
  province: z.string().min(2, 'Provinsi tidak valid').optional(),
  postal_code: z.string().optional(),
});

const UmkmRegister = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasProfile, createProfile, isLoading: profileLoading } = useUmkmProfile();

  const [formData, setFormData] = useState<CreateUmkmProfileData>({
    umkm_name: '',
    brand_name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateUmkmProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      umkmSchema.parse(formData);
      
      // Clean up empty strings and ensure required field exists
      const cleanData: CreateUmkmProfileData = {
        umkm_name: formData.umkm_name,
        ...(formData.brand_name && { brand_name: formData.brand_name }),
        ...(formData.description && { description: formData.description }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.whatsapp && { whatsapp: formData.whatsapp }),
        ...(formData.email && { email: formData.email }),
        ...(formData.website && { website: formData.website }),
        ...(formData.address && { address: formData.address }),
        ...(formData.city && { city: formData.city }),
        ...(formData.province && { province: formData.province }),
        ...(formData.postal_code && { postal_code: formData.postal_code }),
      };
      
      await createProfile.mutateAsync(cleanData);
      navigate('/umkm/dashboard');
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  if (authLoading || profileLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (hasProfile) {
    navigate('/umkm/dashboard');
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-3xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Daftarkan UMKM Anda</CardTitle>
            <CardDescription>
              Lengkapi profil bisnis Anda untuk mulai berjualan di marketplace
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Informasi Bisnis</h3>
                </div>
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="umkm_name">Nama Usaha *</Label>
                    <Input
                      id="umkm_name"
                      value={formData.umkm_name}
                      onChange={(e) => handleChange('umkm_name', e.target.value)}
                      placeholder="Contoh: Warung Makan Sederhana"
                    />
                    {errors.umkm_name && (
                      <p className="text-sm text-destructive">{errors.umkm_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Nama Brand (opsional)</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => handleChange('brand_name', e.target.value)}
                      placeholder="Contoh: WMS"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Usaha</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Jelaskan tentang usaha Anda, produk yang dijual, keunggulan, dll..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Informasi Kontak</h3>
                </div>
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Bisnis</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="usaha@email.com"
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (opsional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://website.com"
                        className="pl-10"
                      />
                    </div>
                    {errors.website && (
                      <p className="text-sm text-destructive">{errors.website}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Lokasi</h3>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                    rows={2}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota/Kabupaten</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Kota"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleChange('province', e.target.value)}
                      placeholder="Provinsi"
                    />
                    {errors.province && (
                      <p className="text-sm text-destructive">{errors.province}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Kode Pos</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createProfile.isPending}
                >
                  {createProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftarkan...
                    </>
                  ) : (
                    'Daftarkan UMKM'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UmkmRegister;
