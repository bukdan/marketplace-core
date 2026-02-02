import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useBuyNow } from '@/hooks/useBuyNow';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, Eye, Clock, Heart, Share2, Flag, 
  Phone, MessageCircle, ChevronLeft, ChevronRight,
  Gavel, Timer, User, Shield, ShoppingCart
} from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds, format } from 'date-fns';
import { id } from 'date-fns/locale';

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
  profiles: { name: string | null; phone_number: string | null; created_at: string | null } | null;
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

const conditionLabels: Record<string, string> = {
  new: 'Baru',
  like_new: 'Seperti Baru',
  good: 'Bagus',
  fair: 'Cukup',
};

export default function ListingDetail() {
  const { id: listingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { startConversation, loading: chatLoading } = useChat();
  const { buyNow, loading: buyNowLoading } = useBuyNow();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount();
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
      // Fetch listing with related data
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
      
      // Fetch profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, phone_number, created_at')
        .eq('user_id', listingData.user_id)
        .single();
      
      // Sort images by sort_order
      if (listingData.listing_images) {
        listingData.listing_images.sort((a: ListingImage, b: ListingImage) => 
          (a.sort_order || 0) - (b.sort_order || 0)
        );
      }
      
      // Combine listing with profile
      const fullListing = {
        ...listingData,
        profiles: profileData || null,
      };
      
      setListing(fullListing as unknown as Listing);

      // If auction, fetch auction data
      if (listingData.price_type === 'auction') {
        const { data: auctionData } = await supabase
          .from('listing_auctions')
          .select('*')
          .eq('listing_id', listingId)
          .single();
        
        if (auctionData) {
          setAuction(auctionData);
          setBidAmount(String(auctionData.current_price + auctionData.min_increment));
          
          // Fetch bids
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

  const incrementViewCount = async () => {
    if (!listingId) return;
    // View count increment - we'll skip this as it needs a DB function
  };

  const checkIfSaved = async () => {
    if (!user || !listingId) return;
    
    const { data } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single();
    
    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    if (!user) {
      toast({ title: 'Login diperlukan', description: 'Silakan login untuk menyimpan iklan' });
      navigate('/auth');
      return;
    }
    
    if (isSaved) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      setIsSaved(false);
      toast({ title: 'Dihapus dari favorit' });
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: user.id, listing_id: listingId });
      setIsSaved(true);
      toast({ title: 'Ditambahkan ke favorit' });
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
      // Insert bid
      const { error: bidError } = await supabase
        .from('auction_bids')
        .insert({
          auction_id: auction.id,
          bidder_id: user.id,
          amount: amount,
          is_winning: true,
        });
      
      if (bidError) throw bidError;
      
      // Update current price
      await supabase
        .from('listing_auctions')
        .update({
          current_price: amount,
          total_bids: (auction.total_bids || 0) + 1,
        })
        .eq('id', auction.id);
      
      // Reset previous winning bids
      await supabase
        .from('auction_bids')
        .update({ is_winning: false })
        .eq('auction_id', auction.id)
        .neq('bidder_id', user.id);
      
      toast({ title: 'Bid berhasil!', description: `Anda mengajukan bid ${formatPrice(amount)}` });
      
      // Refresh data
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

  const nextImage = () => {
    if (!listing?.listing_images) return;
    setCurrentImageIndex((prev) => 
      prev === listing.listing_images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!listing?.listing_images) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.listing_images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
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
          <h1 className="text-2xl font-bold mb-4">Iklan tidak ditemukan</h1>
          <Button onClick={() => navigate('/marketplace')}>Kembali ke Marketplace</Button>
        </div>
      </MainLayout>
    );
  }

  const images = listing.listing_images || [];
  const currentImage = images[currentImageIndex];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {currentImage ? (
                  <img
                    src={currentImage.image_url}
                    alt={listing.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Tidak ada gambar
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{listing.categories?.name}</Badge>
                    <Badge variant="outline">{conditionLabels[listing.condition]}</Badge>
                    {listing.is_featured && <Badge className="bg-primary">Premium</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={toggleSave}>
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.city || listing.province || 'Indonesia'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.view_count} dilihat
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Deskripsi</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || 'Tidak ada deskripsi'}
              </p>
            </div>
          </div>

          {/* Right Column - Price & Actions */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                {auction && listing.price_type === 'auction' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Gavel className="h-5 w-5" />
                      <span className="font-medium">Lelang</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Harga Saat Ini</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(auction.current_price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-orange-500">{timeLeft}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Bid</p>
                        <p className="font-medium">{auction.total_bids || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min. Kenaikan</p>
                        <p className="font-medium">{formatPrice(auction.min_increment)}</p>
                      </div>
                    </div>
                    
                    {auction.status === 'active' && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder={`Min ${formatPrice(auction.current_price + auction.min_increment)}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                        <Button 
                          className="w-full" 
                          onClick={handleBid}
                          disabled={bidding || listing.user_id === user?.id}
                        >
                          {bidding ? 'Memproses...' : 'Ajukan Bid'}
                        </Button>
                      </div>
                    )}
                    
                    {auction.buy_now_price && auction.status === 'active' && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Beli Langsung</p>
                          <p className="text-xl font-bold mb-2">{formatPrice(auction.buy_now_price)}</p>
                          <Button 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={() => buyNow(listing.id, listing.user_id, auction.buy_now_price!, auction.id)}
                            disabled={buyNowLoading || listing.user_id === user?.id}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {buyNowLoading ? 'Memproses...' : 'Beli Sekarang'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(listing.price)}
                      </p>
                      {listing.price_type === 'negotiable' && (
                        <Badge variant="outline" className="mt-1">Nego</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {/* Buy Now Button for fixed/negotiable listings */}
                      <Button 
                        className="w-full gap-2"
                        onClick={() => buyNow(listing.id, listing.user_id, listing.price)}
                        disabled={buyNowLoading || listing.user_id === user?.id}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {buyNowLoading ? 'Memproses...' : 'Beli Sekarang'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => startConversation(listing.user_id, listing.id)}
                        disabled={chatLoading || listing.user_id === user?.id}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {listing.user_id === user?.id ? 'Iklan Anda' : 'Chat Penjual'}
                      </Button>
                      {listing.profiles?.phone_number && (
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => window.open(`tel:${listing.profiles?.phone_number}`)}
                        >
                          <Phone className="h-4 w-4" />
                          Hubungi
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Penjual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={(listing.profiles as { avatar_url?: string })?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{listing.profiles?.name || 'Pengguna'}</p>
                    <p className="text-xs text-muted-foreground">
                      Bergabung {listing.profiles?.created_at ? 
                        format(new Date(listing.profiles.created_at), 'MMMM yyyy', { locale: id }) : 
                        'baru-baru ini'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Identitas terverifikasi</span>
                </div>
              </CardContent>
            </Card>

            {/* Bid History (for auctions) */}
            {auction && bids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Riwayat Bid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bids.slice(0, 5).map((bid, idx) => (
                      <div 
                        key={bid.id} 
                        className={`flex justify-between items-center p-2 rounded ${
                          bid.is_winning ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="text-sm">
                          {bid.is_winning && '👑 '}
                          Bidder #{idx + 1}
                        </span>
                        <span className="font-medium">{formatPrice(bid.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
