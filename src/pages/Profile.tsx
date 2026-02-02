import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Package, Settings, Camera, Loader2, MapPin, Eye, Edit, Rocket } from 'lucide-react';
import { BoostModal } from '@/components/listing/BoostModal';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  view_count: number | null;
  created_at: string | null;
  listing_images: { image_url: string; is_primary: boolean }[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
  });

  const [boostModal, setBoostModal] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    
    const [profileRes, listingsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('listings')
        .select(`
          id, title, price, status, view_count, created_at,
          listing_images(image_url, is_primary)
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setFormData({
        name: profileRes.data.name || '',
        phone_number: profileRes.data.phone_number || '',
        address: profileRes.data.address || '',
      });
    }

    if (listingsRes.data) {
      setListings(listingsRes.data);
    }

    setLoading(false);
  };

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

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: 'Foto profil berhasil diupdate' });
    } catch (error) {
      toast({
        title: 'Gagal upload foto',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
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
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: 'Profil berhasil disimpan' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan profil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-200',
      draft: 'bg-gray-500/10 text-gray-600 border-gray-200',
      pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      sold: 'bg-blue-500/10 text-blue-600 border-blue-200',
      expired: 'bg-red-500/10 text-red-600 border-red-200',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      draft: 'Draft',
      pending_review: 'Pending',
      sold: 'Terjual',
      expired: 'Expired',
    };
    return (
      <Badge variant="outline" className={styles[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        <Tabs defaultValue="profile">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Iklan Saya ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.name || 'Nama belum diisi'}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <div className="space-y-4">
              {listings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Anda belum memiliki iklan</p>
                    <Button className="mt-4" onClick={() => navigate('/listing/create')}>
                      Buat Iklan Pertama
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                listings.map((listing) => {
                  const primaryImage = listing.listing_images?.find(img => img.is_primary)?.image_url 
                    || listing.listing_images?.[0]?.image_url;
                  
                  return (
                    <Card key={listing.id}>
                      <CardContent className="flex gap-4 p-4">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {primaryImage ? (
                            <img 
                              src={primaryImage} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium truncate">{listing.title}</h3>
                              <p className="text-lg font-bold text-primary">
                                Rp {listing.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                            {getStatusBadge(listing.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {listing.view_count || 0} views
                            </span>
                            <span>
                              {listing.created_at && new Date(listing.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/listing/${listing.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/listing/edit/${listing.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            {listing.status === 'active' && (
                              <Button 
                                size="sm"
                                onClick={() => setBoostModal({ open: true, listing })}
                              >
                                <Rocket className="h-4 w-4 mr-1" />
                                Boost
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Badge variant="secondary">Terverifikasi</Badge>
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => navigate('/credits')}>
                  Kelola Kredit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {boostModal.listing && (
        <BoostModal
          open={boostModal.open}
          onOpenChange={(open) => setBoostModal({ ...boostModal, open })}
          listingId={boostModal.listing.id}
          listingTitle={boostModal.listing.title}
          onSuccess={fetchData}
        />
      )}
    </MainLayout>
  );
}
