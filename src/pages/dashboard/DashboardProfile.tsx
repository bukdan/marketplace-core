import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useKyc } from '@/hooks/useKyc';
import { useToast } from '@/hooks/use-toast';
import { provinceNames, getCitiesByProvince } from '@/data/indonesiaRegions';
import { KycImageUpload } from '@/components/kyc/KycImageUpload';
import {
  Camera, Loader2, User, Shield, MapPin, Upload, CheckCircle,
  Clock, XCircle, AlertTriangle, FileText, Edit3, Save, X
} from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
}

const kycStatusConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  not_submitted: { label: 'Belum Diajukan', icon: Upload, variant: 'outline' },
  pending: { label: 'Menunggu Review', icon: Clock, variant: 'secondary' },
  approved: { label: 'Terverifikasi', icon: CheckCircle, variant: 'default' },
  rejected: { label: 'Ditolak', icon: XCircle, variant: 'destructive' },
};

export default function DashboardProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { kyc, isLoading: kycLoading, submitKyc } = useKyc();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit modes per section
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingKyc, setEditingKyc] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone_number: '',
    address: '',
  });

  const [kycForm, setKycForm] = useState({
    full_name: '',
    ktp_number: '',
    province: '',
    city: '',
    district: '',
    village: '',
    full_address: '',
    ktp_image_url: '',
    selfie_image_url: '',
  });

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setProfileForm({
          name: data.name || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Sync KYC data to form
  useEffect(() => {
    if (kyc) {
      setKycForm({
        full_name: kyc.full_name || '',
        ktp_number: kyc.ktp_number || '',
        province: kyc.province || '',
        city: kyc.city || '',
        district: kyc.district || '',
        village: kyc.village || '',
        full_address: kyc.full_address || '',
        ktp_image_url: kyc.ktp_image_url || '',
        selfie_image_url: kyc.selfie_image_url || '',
      });
    }
  }, [kyc]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast({ title: 'Foto profil berhasil diupdate' });
    } catch (error) {
      toast({ title: 'Gagal upload foto', description: error instanceof Error ? error.message : 'Terjadi kesalahan', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Profil berhasil disimpan' });
      fetchProfile();
      setEditingProfile(false);
    } catch (error) {
      toast({ title: 'Gagal menyimpan profil', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKyc = async () => {
    if (!kycForm.full_name || !kycForm.ktp_number || !kycForm.province || !kycForm.city) {
      toast({ title: 'Lengkapi data wajib', description: 'Nama, No. KTP, Provinsi, dan Kota wajib diisi.', variant: 'destructive' });
      return;
    }
    await submitKyc.mutateAsync({
      full_name: kycForm.full_name,
      ktp_number: kycForm.ktp_number,
      ktp_image_url: kycForm.ktp_image_url,
      selfie_image_url: kycForm.selfie_image_url,
      province: kycForm.province,
      city: kycForm.city,
      district: kycForm.district,
      village: kycForm.village,
      full_address: kycForm.full_address,
    });
    setEditingKyc(false);
  };

  const kycStatus = kyc?.status || 'not_submitted';
  const kycConfig = kycStatusConfig[kycStatus] || kycStatusConfig.not_submitted;
  const KycStatusIcon = kycConfig.icon;
  const canEditKyc = kycStatus === 'not_submitted' || kycStatus === 'rejected';

  if (loading || kycLoading) {
    return (
      <DashboardLayout title="Profil" description="Kelola informasi profil Anda">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profil" description="Kelola informasi profil dan verifikasi identitas">
      <div className="max-w-3xl space-y-6">

        {/* ===== SECTION 1: Header Profil ===== */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 shadow-md transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile?.name || 'Nama belum diisi'}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant={kycConfig.variant} className="gap-1">
                    <KycStatusIcon className="h-3 w-3" />
                    KYC: {kycConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== SECTION 2: Info Akun ===== */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Informasi Akun</CardTitle>
              </div>
              {!editingProfile ? (
                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)} className="gap-1.5 text-xs">
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingProfile(false); setProfileForm({ name: profile?.name || '', phone_number: profile?.phone_number || '', address: profile?.address || '' }); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={saving} className="gap-1.5 text-xs">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Simpan
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingProfile ? (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} placeholder="Masukkan nama lengkap" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Telepon</Label>
                  <Input value={profileForm.phone_number} onChange={(e) => setProfileForm(p => ({ ...p, phone_number: e.target.value }))} placeholder="08xxxxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea value={profileForm.address} onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))} placeholder="Masukkan alamat lengkap" rows={2} />
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <InfoRow label="Nama Lengkap" value={profile?.name} />
                <InfoRow label="Email" value={profile?.email} />
                <InfoRow label="Nomor Telepon" value={profile?.phone_number} />
                <InfoRow label="Alamat" value={profile?.address} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== SECTION 3: KYC - Data Pribadi ===== */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Data Identitas (KYC)</CardTitle>
              </div>
              {canEditKyc && !editingKyc && (
                <Button variant="ghost" size="sm" onClick={() => setEditingKyc(true)} className="gap-1.5 text-xs">
                  <Edit3 className="h-3.5 w-3.5" /> {kycStatus === 'not_submitted' ? 'Isi Data' : 'Edit'}
                </Button>
              )}
              {editingKyc && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingKyc(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>Data sesuai KTP untuk verifikasi identitas</CardDescription>
          </CardHeader>
          <CardContent>
            {kycStatus === 'rejected' && kyc?.rejection_reason && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Alasan Penolakan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kyc.rejection_reason}</p>
                </div>
              </div>
            )}

            {kycStatus === 'pending' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border mb-4">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Dokumen Anda sedang direview. Proses membutuhkan 1-3 hari kerja.</p>
              </div>
            )}

            {editingKyc ? (
              <div className="space-y-5">
                {/* Data Pribadi */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Data Pribadi
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nama Lengkap (sesuai KTP) *</Label>
                      <Input value={kycForm.full_name} onChange={(e) => setKycForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Nama sesuai KTP" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nomor KTP *</Label>
                      <Input value={kycForm.ktp_number} onChange={(e) => setKycForm(p => ({ ...p, ktp_number: e.target.value }))} placeholder="3171XXXXXXXXXXXX" maxLength={16} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Alamat KTP */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Alamat (sesuai KTP)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Provinsi *</Label>
                      <Select value={kycForm.province} onValueChange={(v) => setKycForm(p => ({ ...p, province: v, city: '' }))}>
                        <SelectTrigger><SelectValue placeholder="Pilih provinsi" /></SelectTrigger>
                        <SelectContent>
                          {provinceNames.map((prov) => (
                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Kabupaten/Kota *</Label>
                      <Select value={kycForm.city} onValueChange={(v) => setKycForm(p => ({ ...p, city: v }))} disabled={!kycForm.province}>
                        <SelectTrigger><SelectValue placeholder={kycForm.province ? 'Pilih kota' : 'Pilih provinsi dulu'} /></SelectTrigger>
                        <SelectContent>
                          {getCitiesByProvince(kycForm.province).map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Kecamatan</Label>
                      <Input value={kycForm.district} onChange={(e) => setKycForm(p => ({ ...p, district: e.target.value }))} placeholder="Nama kecamatan" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Desa/Kelurahan</Label>
                      <Input value={kycForm.village} onChange={(e) => setKycForm(p => ({ ...p, village: e.target.value }))} placeholder="Nama desa/kelurahan" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alamat Lengkap</Label>
                    <Textarea value={kycForm.full_address} onChange={(e) => setKycForm(p => ({ ...p, full_address: e.target.value }))} placeholder="RT/RW, nama jalan, nomor rumah, dll." rows={2} />
                  </div>
                </div>

                <Separator />

                {/* Dokumen */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Dokumen Verifikasi
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <KycImageUpload
                      label="Foto KTP *"
                      hint="Upload foto KTP yang jelas"
                      value={kycForm.ktp_image_url}
                      userId={user!.id}
                      folder="ktp"
                      onChange={(url) => setKycForm(p => ({ ...p, ktp_image_url: url }))}
                    />
                    <KycImageUpload
                      label="Selfie dengan KTP *"
                      hint="Foto selfie sambil pegang KTP"
                      value={kycForm.selfie_image_url}
                      userId={user!.id}
                      folder="selfie"
                      onChange={(url) => setKycForm(p => ({ ...p, selfie_image_url: url }))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveKyc}
                  disabled={submitKyc.isPending || !kycForm.full_name || !kycForm.ktp_number || !kycForm.province || !kycForm.city}
                  className="w-full"
                >
                  {submitKyc.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Verifikasi
                </Button>
              </div>
            ) : (
              /* Read-only KYC display */
              <div className="space-y-4">
                {/* Data Pribadi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Data Pribadi
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <InfoRow label="Nama (KTP)" value={kyc?.full_name} />
                    <InfoRow label="Nomor KTP" value={kyc?.ktp_number ? maskKtp(kyc.ktp_number) : null} />
                  </div>
                </div>

                <Separator />

                {/* Alamat KTP */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Alamat KTP
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <InfoRow label="Provinsi" value={kyc?.province} />
                    <InfoRow label="Kota/Kabupaten" value={kyc?.city} />
                    <InfoRow label="Kecamatan" value={kyc?.district} />
                    <InfoRow label="Desa/Kelurahan" value={kyc?.village} />
                  </div>
                  <InfoRow label="Alamat Lengkap" value={kyc?.full_address} />
                </div>

                <Separator />

                {/* Dokumen */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Dokumen
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DocPreview label="Foto KTP" hasDoc={!!kyc?.ktp_image_url} />
                    <DocPreview label="Selfie + KTP" hasDoc={!!kyc?.selfie_image_url} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

/* Helper components */
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || <span className="text-muted-foreground/50 italic">Belum diisi</span>}</span>
    </div>
  );
}

function DocPreview({ label, hasDoc }: { label: string; hasDoc: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30">
      {hasDoc ? (
        <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground ml-auto">{hasDoc ? 'Terupload' : 'Belum ada'}</span>
    </div>
  );
}

function maskKtp(ktp: string): string {
  if (ktp.length <= 6) return ktp;
  return ktp.slice(0, 4) + '****' + ktp.slice(-4);
}
