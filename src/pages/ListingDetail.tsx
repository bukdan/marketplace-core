import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useBuyNow } from '@/hooks/useBuyNow';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { ImageGallery } from '@/components/listing/ImageGallery';
import { SellerCard } from '@/components/listing/SellerCard';
import { SellerLocationMap } from '@/components/listing/SellerLocationMap';
import 'leaflet/dist/leaflet.css';
import { ReviewSection } from '@/components/listing/ReviewSection';
import { ProductSpecs } from '@/components/listing/ProductSpecs';
import { RatingDisplay } from '@/components/listing/RatingDisplay';
import { RelatedProducts } from '@/components/listing/RelatedProducts';
import { ReportListingModal } from '@/components/listing/ReportListingModal';
import { SocialShareButtons } from '@/components/listing/SocialShareButtons';
import { 
  MapPin, Eye, Clock, Heart, Flag, 
  Gavel, Timer, ShoppingCart, Sparkles, Tag, CheckCircle, AlertTriangle,
  MessageCircle, Shield, Phone
} from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ===== Types =====
interface ListingImage { id: string; image_url: string; is_primary: boolean; sort_order: number; }
interface Listing {
  id: string; title: string; description: string; price: number;
  price_type: 'fixed' | 'negotiable' | 'auction';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  city: string | null; province: string | null; view_count: number;
  is_featured: boolean; created_at: string; status: string; user_id: string;
  listing_images: ListingImage[];
  categories: { name: string; slug: string } | null;
  profiles: { name: string | null; phone_number: string | null; created_at: string | null; avatar_url?: string | null } | null;
  contact_whatsapp?: string | null;
}
interface Auction { id: string; starting_price: number; current_price: number; min_increment: number; ends_at: string; status: string; total_bids: number; buy_now_price: number | null; }
interface Bid { id: string; amount: number; created_at: string; is_winning: boolean; bidder_id: string; }
interface SellerRating { total_reviews: number; average_rating: number; }

const conditionConfig: Record<string, { label: string; color: string; description: string }> = {
  new: { label: 'Baru', color: 'bg-emerald-500', description: 'Barang baru, belum pernah dipakai' },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500', description: 'Bekas tapi masih sangat bagus' },
  good: { label: 'Bagus', color: 'bg-amber-500', description: 'Kondisi baik, ada tanda pemakaian wajar' },
  fair: { label: 'Cukup', color: 'bg-gray-500', description: 'Masih berfungsi dengan baik' },
};

const priceTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  fixed: { label: 'Harga Pas', icon: <Tag className="h-4 w-4" /> },
  negotiable: { label: 'Bisa Nego', icon: <Sparkles className="h-4 w-4" /> },
  auction: { label: 'Lelang', icon: <Gavel className="h-4 w-4" /> },
};

export default function ListingDetail() {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { startConversation, loading: chatLoading } = useChat();
  const { buyNow, loading: buyNowLoading } = useBuyNow();
  const { isSaved, toggleSave, checkIfSaved, loading: wishlistLoading } = useWishlist(listingId || '');
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [sellerRating, setSellerRating] = useState<SellerRating | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('deskripsi');

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount(listingId);
      if (user) checkIfSaved();
    }
  }, [listingId, user]);

  const incrementViewCount = async (lid: string) => {
    try { await supabase.rpc('increment_view_count', { p_listing_id: lid }); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!auction || auction.status !== 'active') return;
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.ends_at);
      const diff = differenceInSeconds(end, now);
      if (diff <= 0) { setTimeLeft('Lelang Berakhir'); return; }
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      if (days > 0) setTimeLeft(`${days}h ${hours}j ${minutes}m`);
      else if (hours > 0) setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
      else setTimeLeft(`${minutes}m ${seconds}d`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const fetchListing = async () => {
    if (!listingId) return;
    try {
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select(`*, listing_images(*), categories!listings_category_id_fkey(name, slug)`)
        .eq('id', listingId)
        .maybeSingle();
      if (listingError) throw listingError;
      if (!listingData) { setListing(null); setLoading(false); return; }
      setCategoryId(listingData.category_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, phone_number, created_at, avatar_url')
        .eq('user_id', listingData.user_id)
        .maybeSingle();
      setListing({ ...listingData, profiles: profileData || null } as unknown as Listing);

      if (listingData.price_type === 'auction') {
        const { data: auctionData } = await supabase.from('listing_auctions').select('*').eq('listing_id', listingId).single();
        if (auctionData) {
          setAuction(auctionData);
          setBidAmount(String(auctionData.current_price + auctionData.min_increment));
          const { data: bidsData } = await supabase.from('auction_bids').select('*').eq('auction_id', auctionData.id).order('amount', { ascending: false }).limit(10);
          setBids(bidsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({ title: 'Error', description: 'Gagal memuat data iklan', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleBid = async () => {
    if (!user) { toast({ title: 'Login diperlukan' }); navigate('/auth'); return; }
    if (!auction) return;
    const amount = parseInt(bidAmount);
    const minBid = auction.current_price + auction.min_increment;
    if (amount < minBid) { toast({ title: 'Bid terlalu rendah', description: `Minimal bid adalah ${formatPrice(minBid)}`, variant: 'destructive' }); return; }
    setBidding(true);
    try {
      const { error: bidError } = await supabase.from('auction_bids').insert({ auction_id: auction.id, bidder_id: user.id, amount, is_winning: true });
      if (bidError) throw bidError;
      await supabase.from('listing_auctions').update({ current_price: amount, total_bids: (auction.total_bids || 0) + 1 }).eq('id', auction.id);
      await supabase.from('auction_bids').update({ is_winning: false }).eq('auction_id', auction.id).neq('bidder_id', user.id);
      toast({ title: 'Bid berhasil!', description: `Anda mengajukan bid ${formatPrice(amount)}` });
      fetchListing();
    } catch (error) {
      console.error('Bid error:', error);
      toast({ title: 'Gagal mengajukan bid', variant: 'destructive' });
    } finally { setBidding(false); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const handleWhatsApp = () => {
    const sellerPhone = listing?.contact_whatsapp || listing?.profiles?.phone_number;
    if (!sellerPhone) {
      toast({ title: 'Nomor tidak tersedia', description: 'Penjual belum menambahkan nomor WhatsApp', variant: 'destructive' });
      return;
    }
    // Format phone: remove leading 0, add 62
    let phone = sellerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    else if (!phone.startsWith('62')) phone = '62' + phone;
    
    const message = encodeURIComponent(
      `Halo kak, saya tertarik dengan produk "${listing?.title}" yang dijual seharga ${formatPrice(listing?.price || 0)}. Apakah masih tersedia? Terima kasih 🙏`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // ===== Loading =====
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex gap-2">{[1,2,3,4].map(i => <Skeleton key={i} className="w-20 h-20 rounded-lg" />)}</div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== Not Found =====
  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Tag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Iklan tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Iklan yang Anda cari mungkin sudah tidak tersedia.</p>
            <Button onClick={() => navigate('/marketplace')}>Kembali ke Marketplace</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const condition = listing.condition || 'good';
  const conditionData = conditionConfig[condition];
  const priceTypeData = priceTypeLabels[listing.price_type];
  const location = listing.city || listing.province || 'Indonesia';
  const isOwnListing = listing.user_id === user?.id;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Status Banner */}
        {listing.status !== 'active' && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                {listing.status === 'pending_review' ? 'Menunggu Review' : listing.status === 'rejected' ? 'Ditolak' : listing.status}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">Iklan ini belum aktif dan tidak terlihat oleh publik.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ===== Left Column ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={listing.listing_images || []} title={listing.title} isPremium={listing.is_featured} />

            {/* Title & Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{listing.categories?.name}</Badge>
                    <Badge className={cn("text-white border-0", conditionData.color)}>{conditionData.label}</Badge>
                    <Badge variant="outline" className="gap-1">{priceTypeData.icon}{priceTypeData.label}</Badge>
                    {listing.is_featured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">✨ Premium</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="icon" onClick={toggleSave} disabled={wishlistLoading} className={cn(isSaved && "text-red-500 border-red-200 bg-red-50")}>
                    <Heart className={cn("h-5 w-5", isSaved && "fill-red-500")} />
                  </Button>
                  <SocialShareButtons title={listing.title} variant="compact" />
                  <Button variant="outline" size="icon" onClick={() => setReportModalOpen(true)}>
                    <Flag className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{location}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{listing.view_count} dilihat</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: id })}</span>
              </div>
            </div>

            <Separator />

            {/* ===== TABS ===== */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/70 rounded-xl p-1">
                {[
                  { value: 'deskripsi', label: '📝 Deskripsi' },
                  { value: 'spesifikasi', label: '📋 Spesifikasi' },
                  { value: 'ulasan', label: '⭐ Ulasan' },
                  { value: 'chat', label: '💬 Chat' },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "rounded-lg font-semibold text-sm transition-all duration-300 data-[state=active]:shadow-lg",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "hover:bg-accent/50"
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Deskripsi Tab */}
              <TabsContent value="deskripsi" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Deskripsi Produk
                    </h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {listing.description || 'Tidak ada deskripsi tersedia.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spesifikasi Tab */}
              <TabsContent value="spesifikasi" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <ProductSpecs
                  condition={condition}
                  priceType={listing.price_type}
                  location={location}
                  viewCount={listing.view_count}
                  createdAt={listing.created_at}
                  isFeatured={listing.is_featured}
                  category={listing.categories?.name || 'Lainnya'}
                />
              </TabsContent>

              {/* Ulasan Tab */}
              <TabsContent value="ulasan" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <RatingDisplay stats={sellerRating} />
                <div className="mt-6">
                  <ReviewSection sellerId={listing.user_id} onRatingUpdate={setSellerRating} />
                </div>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Hubungi Penjual
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Langsung hubungi penjual via WhatsApp atau chat internal platform.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        onClick={handleWhatsApp}
                        className="h-14 text-base gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Chat WhatsApp
                      </Button>
                      {!isOwnListing && (
                        <Button
                          variant="outline"
                          onClick={() => startConversation(listing.user_id, listing.id)}
                          disabled={chatLoading}
                          className="h-14 text-base gap-3 border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <MessageCircle className="h-5 w-5" />
                          {chatLoading ? 'Memproses...' : 'Chat Internal'}
                        </Button>
                      )}
                    </div>
                    {listing.profiles?.phone_number && (
                      <Button
                        variant="ghost"
                        className="w-full gap-2 text-muted-foreground"
                        onClick={() => window.open(`tel:${listing.profiles?.phone_number}`)}
                      >
                        <Phone className="h-4 w-4" />
                        Hubungi via Telepon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Related Products */}
            {categoryId && (
              <div className="mt-6">
                <RelatedProducts categoryId={categoryId} currentListingId={listing.id} categoryName={listing.categories?.name || 'Lainnya'} />
              </div>
            )}
          </div>

          {/* ===== Right Column - Price & Actions ===== */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-4 shadow-xl border-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
              <CardContent className="p-6">
                {auction && listing.price_type === 'auction' ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Gavel className="h-5 w-5" />
                      <span className="font-semibold">Lelang Aktif</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Harga Saat Ini</p>
                      <p className="text-3xl font-bold text-primary">{formatPrice(auction.current_price)}</p>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <Timer className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-600">{timeLeft}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Total Bid</p>
                        <p className="font-bold text-lg">{auction.total_bids || 0}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Min. Kenaikan</p>
                        <p className="font-bold text-lg">{formatPrice(auction.min_increment)}</p>
                      </div>
                    </div>
                    {auction.status === 'active' && !isOwnListing && (
                      <div className="space-y-3">
                        <Input type="number" placeholder={`Min ${formatPrice(auction.current_price + auction.min_increment)}`} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="text-lg font-medium" />
                        <Button className="w-full h-12 text-lg" onClick={handleBid} disabled={bidding}>
                          <Gavel className="h-5 w-5 mr-2" />
                          {bidding ? 'Memproses...' : 'Ajukan Bid'}
                        </Button>
                      </div>
                    )}
                    {auction.buy_now_price && auction.status === 'active' && !isOwnListing && (
                      <>
                        <div className="relative"><Separator /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">atau</span></div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Beli Langsung</p>
                          <p className="text-xl font-bold mb-3">{formatPrice(auction.buy_now_price)}</p>
                          <Button variant="outline" className="w-full gap-2" onClick={() => buyNow(listing.id, listing.user_id, auction.buy_now_price!, auction.id)} disabled={buyNowLoading}>
                            <ShoppingCart className="h-4 w-4" />
                            {buyNowLoading ? 'Memproses...' : 'Beli Sekarang'}
                          </Button>
                        </div>
                      </>
                    )}
                    {bids.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Riwayat Bid</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {bids.slice(0, 5).map((bid, idx) => (
                            <div key={bid.id} className={cn("flex justify-between items-center p-2 rounded-lg text-sm", bid.is_winning ? "bg-primary/10" : "bg-muted")}>
                              <span className="flex items-center gap-2">{bid.is_winning && <CheckCircle className="h-4 w-4 text-primary" />}Bidder #{bids.length - idx}</span>
                              <span className="font-semibold">{formatPrice(bid.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
                      {listing.price_type === 'negotiable' && (
                        <Badge variant="outline" className="mt-2 gap-1"><Sparkles className="h-3 w-3" />Harga masih bisa nego</Badge>
                      )}
                    </div>
                    {!isOwnListing && (
                      <div className="space-y-3">
                        {/* Beli via Escrow */}
                        <Button className="w-full h-12 text-lg gap-2 shadow-lg" onClick={() => buyNow(listing.id, listing.user_id, listing.price)} disabled={buyNowLoading}>
                          <Shield className="h-5 w-5" />
                          {buyNowLoading ? 'Memproses...' : 'Beli via Rekening Bersama'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                          <Shield className="h-3 w-3 text-emerald-500" />
                          Pembayaran aman dengan sistem escrow
                        </p>

                        <div className="relative"><Separator /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">atau</span></div>

                        {/* WhatsApp */}
                        <Button
                          variant="outline"
                          className="w-full h-12 gap-3 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={handleWhatsApp}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Hubungi via WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Card */}
            <SellerCard
              profile={listing.profiles}
              rating={sellerRating}
              listingLocation={location}
              isOwnListing={isOwnListing}
              onChat={handleWhatsApp}
              onCall={() => window.open(`tel:${listing.profiles?.phone_number}`)}
              chatLoading={chatLoading}
            />

            {/* Seller Location Map */}
            <SellerLocationMap
              city={listing.city}
              province={listing.province}
              lat={(listing as any).location_lat}
              lng={(listing as any).location_lng}
              sellerName={listing.profiles?.name}
            />

            {/* Security Notice */}
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Shield className="h-5 w-5" />
                  Transaksi Aman
                </h4>
                <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1.5">
                  <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />Gunakan Rekening Bersama (escrow) untuk keamanan</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />Dana ditahan hingga barang diterima pembeli</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />Jangan transfer langsung ke rekening pribadi</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <ReportListingModal open={reportModalOpen} onOpenChange={setReportModalOpen} listingId={listing.id} listingTitle={listing.title} />
      </div>
    </MainLayout>
  );
}
