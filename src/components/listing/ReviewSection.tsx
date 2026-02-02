import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, ThumbsUp, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  is_anonymous: boolean;
  reviewer_id: string;
}

interface RatingStats {
  total_reviews: number;
  average_rating: number;
  rating_5: number;
  rating_4: number;
  rating_3: number;
  rating_2: number;
  rating_1: number;
}

interface ReviewSectionProps {
  sellerId: string;
  onRatingUpdate?: (stats: RatingStats | null) => void;
}

export const ReviewSection = ({ sellerId, onRatingUpdate }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchRatingStats();
  }, [sellerId]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('seller_reviews')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(showAll ? 50 : 5);
    
    setReviews(data || []);
    setLoading(false);
  };

  const fetchRatingStats = async () => {
    const { data } = await supabase
      .rpc('get_seller_rating', { seller_uuid: sellerId });
    
    if (data && data.length > 0) {
      const stats = data[0] as RatingStats;
      setRatingStats(stats);
      onRatingUpdate?.(stats);
    }
  };

  const getPercentage = (count: number) => {
    if (!ratingStats?.total_reviews) return 0;
    return (count / ratingStats.total_reviews) * 100;
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Ulasan Penjual
          </CardTitle>
          {ratingStats && ratingStats.total_reviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-lg">{ratingStats.average_rating}</span>
              </div>
              <span className="text-muted-foreground text-sm">
                ({ratingStats.total_reviews} ulasan)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating Distribution */}
        {ratingStats && ratingStats.total_reviews > 0 && (
          <div className="space-y-2 pb-4 border-b">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats[`rating_${star}` as keyof RatingStats] as number;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <Progress value={getPercentage(count)} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reviews List */}
        {displayedReviews.length > 0 ? (
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {review.is_anonymous ? 'Pengguna Anonim' : 'Pembeli'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { 
                          addSuffix: true, 
                          locale: localeId 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3.5 w-3.5",
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    {review.content && (
                      <p className="text-sm text-muted-foreground">
                        {review.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada ulasan untuk penjual ini</p>
          </div>
        )}

        {/* Show More Button */}
        {reviews.length > 3 && !showAll && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setShowAll(true);
              fetchReviews();
            }}
          >
            Lihat Semua Ulasan ({ratingStats?.total_reviews})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
