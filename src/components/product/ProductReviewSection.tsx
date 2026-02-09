import { useState } from 'react';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ProductReviewSectionProps {
  productId: string;
}

export function ProductReviewSection({ productId }: ProductReviewSectionProps) {
  const { user } = useAuth();
  const { reviews, isLoading, addReview, deleteReview } = useProductReviews(productId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    await addReview.mutateAsync({ productId, rating, comment: comment || undefined });
    setComment('');
    setRating(5);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ulasan Produk ({reviews.length})</span>
          <span className="flex items-center gap-1 text-sm font-normal">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {avgRating}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Review Form */}
        {user && (
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <p className="text-sm font-medium">Tulis Ulasan</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagikan pengalaman Anda..."
              rows={3}
            />
            <Button size="sm" onClick={handleSubmit} disabled={addReview.isPending}>
              {addReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Ulasan
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">Belum ada ulasan</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3 p-3 rounded-lg border">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={review.profile?.avatar_url || ''} />
                  <AvatarFallback>{(review.profile?.name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.profile?.name || 'Pengguna'}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {review.created_at ? format(new Date(review.created_at), 'dd MMM yyyy', { locale: idLocale }) : ''}
                      </span>
                      {user?.id === review.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteReview.mutate(review.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
