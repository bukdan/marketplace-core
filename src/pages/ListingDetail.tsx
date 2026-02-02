import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useBuyNow } from '@/hooks/useBuyNow';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { ImageGallery } from '@/components/listing/ImageGallery';
import { SellerCard } from '@/components/listing/SellerCard';
import { ReviewSection } from '@/components/listing/ReviewSection';
import { 
  MapPin, Eye, Clock, Heart, Share2, Flag, 
  Gavel, Timer, ShoppingCart, Sparkles, Tag, CheckCircle
} from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'negotiable' | 'auction';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  city: string | null;
  province: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  listing_images: ListingImage[];
  categories: { name: string; slug: string } | null;
  profiles: { name: string | null; phone_number: string | null; created_at: string | null; avatar_url?: string | null } | null;
}

interface Auction {
  id: string;
  starting_price: number;
  current_price: number;
  min_increment: number;
  ends_at: string;
  status: string;
  total_bids: number;
  buy_now_price: number | null;
}

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  is_winning: boolean;
  bidder_id: string;
}

interface SellerRating {
  total_reviews: number;
  average_rating: number;
}

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

  useEffect(() => {
    if (listingId) {
      fetchListing();
      if (user) checkIfSaved();
    }
  }, [listingId, user]);

  useEffect(() => {
    if (!auction || auction.status !== 'active') return;
    
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.ends_at);
      const diff = differenceInSeconds(end, now);
      
      if (diff <= 0) {
        setTimeLeft('Lelang Berakhir');
        return;
      }
      
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      if (days > 0) {
        setTimeLeft(`${days}h ${hours}j ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}d`);
      }
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
        .select(`
          *,
          listing_images(*),
          categories(name, slug)
        `)
        .eq('id', listingId)
        .eq('status', 'active')
        .single();

      if (listingError) throw listingError;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, phone_number, created_at, avatar_url')
        .eq('user_id', listingData.user_id)
        .single();
      
      const fullListing = {
        ...listingData,
        profiles: profileData || null,
      };
      
      setListing(fullListing as unknown as Listing);

      if (listingData.price_type === 'auction') {
        const { data: auctionData } = await supabase
          .from('listing_auctions')
          .select('*')
          .eq('listing_id', listingId)
          .single();
        
        if (auctionData) {
          setAuction(auctionData);
          setBidAmount(String(auctionData.current_price + auctionData.min_increment));
          
          const { data: bidsData } = await supabase
            .from('auction_bids')
            .select('*')
            .eq('auction_id', auctionData.id)
            .order('amount', { ascending: false })
            .limit(10);
          
          setBids(bidsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data iklan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async () => {
    if (!user) {
      toast({ title: 'Login diperlukan', description: 'Silakan login untuk mengajukan bid' });
      navigate('/auth');
      return;
    }
    
    if (!auction) return;
    
    const amount = parseInt(bidAmount);
    const minBid = auction.current_price + auction.min_increment;
    
    if (amount < minBid) {
      toast({
        title: 'Bid terlalu rendah',
        description: `Minimal bid adalah ${formatPrice(minBid)}`,
        variant: 'destructive',
      });
      return;
    }
    
    setBidding(true);
    
    try {
      const { error: bidError } = await supabase
        .from('auction_bids')
        .insert({
          auction_id: auction.id,
          bidder_id: user.id,
          amount: amount,
          is_winning: true,
        });
      
      if (bidError) throw bidError;
      
      await supabase
        .from('listing_auctions')
        .update({
          current_price: amount,
          total_bids: (auction.total_bids || 0) + 1,
        })
        .eq('id', auction.id);
      
      await supabase
        .from('auction_bids')
        .update({ is_winning: false })
        .eq('auction_id', auction.id)
        .neq('bidder_id', user.id);
      
      toast({ title: 'Bid berhasil!', description: `Anda mengajukan bid ${formatPrice(amount)}` });
      fetchListing();
    } catch (error) {
      console.error('Bid error:', error);
      toast({
        title: 'Gagal mengajukan bid',
        description: 'Terjadi kesalahan, silakan coba lagi',
        variant: 'destructive',
      });
    } finally {
      setBidding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link disalin ke clipboard!' });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
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

  if (!listing) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Tag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Iklan tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">
              Iklan yang Anda cari mungkin sudah tidak tersedia atau telah dihapus.
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Kembali ke Marketplace
            </Button>
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery 
              images={listing.listing_images || []} 
              title={listing.title}
              isPremium={listing.is_featured}
            />

            {/* Title & Actions */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {listing.categories?.name}
                    </Badge>
                    <Badge className={cn("text-white border-0", conditionData.color)}>
                      {conditionData.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {priceTypeData.icon}
                      {priceTypeData.label}
                    </Badge>
                    {listing.is_featured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        ✨ Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={toggleSave}
                    disabled={wishlistLoading}
                    className={cn(isSaved && "text-red-500 border-red-200 bg-red-50")}
                  >
                    <Heart className={cn("h-5 w-5", isSaved && "fill-red-500")} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {listing.view_count} dilihat
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Condition Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", conditionData.color)} />
                  <div>
                    <span className="font-medium">Kondisi: {conditionData.label}</span>
                    <p className="text-sm text-muted-foreground">{conditionData.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Deskripsi</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description || 'Tidak ada deskripsi tersedia untuk iklan ini.'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Reviews Section */}
            <ReviewSection 
              sellerId={listing.user_id} 
              onRatingUpdate={setSellerRating}
            />
          </div>

          {/* Right Column - Price & Actions */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {auction && listing.price_type === 'auction' ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Gavel className="h-5 w-5" />
                      <span className="font-semibold">Lelang Aktif</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Harga Saat Ini</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(auction.current_price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
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
                        <Input
                          type="number"
                          placeholder={`Min ${formatPrice(auction.current_price + auction.min_increment)}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="text-lg font-medium"
                        />
                        <Button 
                          className="w-full h-12 text-lg" 
                          onClick={handleBid}
                          disabled={bidding}
                        >
                          <Gavel className="h-5 w-5 mr-2" />
                          {bidding ? 'Memproses...' : 'Ajukan Bid'}
                        </Button>
                      </div>
                    )}
                    
                    {auction.buy_now_price && auction.status === 'active' && !isOwnListing && (
                      <>
                        <div className="relative">
                          <Separator />
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
                            atau
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Beli Langsung</p>
                          <p className="text-xl font-bold mb-3">{formatPrice(auction.buy_now_price)}</p>
                          <Button 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={() => buyNow(listing.id, listing.user_id, auction.buy_now_price!, auction.id)}
                            disabled={buyNowLoading}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {buyNowLoading ? 'Memproses...' : 'Beli Sekarang'}
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Bid History */}
                    {bids.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Riwayat Bid</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {bids.slice(0, 5).map((bid, idx) => (
                            <div 
                              key={bid.id} 
                              className={cn(
                                "flex justify-between items-center p-2 rounded-lg text-sm",
                                bid.is_winning ? "bg-primary/10" : "bg-muted"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {bid.is_winning && <CheckCircle className="h-4 w-4 text-primary" />}
                                Bidder #{bids.length - idx}
                              </span>
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
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(listing.price)}
                      </p>
                      {listing.price_type === 'negotiable' && (
                        <Badge variant="outline" className="mt-2 gap-1">
                          <Sparkles className="h-3 w-3" />
                          Harga masih bisa nego
                        </Badge>
                      )}
                    </div>
                    
                    {!isOwnListing && (
                      <div className="space-y-3">
                        <Button 
                          className="w-full h-12 text-lg gap-2"
                          onClick={() => buyNow(listing.id, listing.user_id, listing.price)}
                          disabled={buyNowLoading}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          {buyNowLoading ? 'Memproses...' : 'Beli Sekarang'}
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
              onChat={() => startConversation(listing.user_id, listing.id)}
              onCall={() => window.open(`tel:${listing.profiles?.phone_number}`)}
              chatLoading={chatLoading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
