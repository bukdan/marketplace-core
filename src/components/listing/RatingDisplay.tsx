import { Star, TrendingUp, Award, Users, ThumbsUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RatingStats {
  total_reviews: number;
  average_rating: number;
  rating_5?: number;
  rating_4?: number;
  rating_3?: number;
  rating_2?: number;
  rating_1?: number;
}

interface RatingDisplayProps {
  stats: RatingStats | null;
  className?: string;
}

export const RatingDisplay = ({ stats, className }: RatingDisplayProps) => {
  if (!stats || stats.total_reviews === 0) {
    return (
      <div className={cn("p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border", className)}>
        <div className="text-center py-4">
          <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Belum Ada Rating</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Penjual ini belum memiliki ulasan
          </p>
        </div>
      </div>
    );
  }

  const getPercentage = (count: number) => {
    return (count / stats.total_reviews) * 100;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return { label: 'Luar Biasa', color: 'text-emerald-600' };
    if (rating >= 4.0) return { label: 'Sangat Bagus', color: 'text-green-600' };
    if (rating >= 3.5) return { label: 'Bagus', color: 'text-blue-600' };
    if (rating >= 3.0) return { label: 'Cukup', color: 'text-amber-600' };
    return { label: 'Perlu Perbaikan', color: 'text-red-600' };
  };

  const ratingInfo = getRatingLabel(stats.average_rating);

  return (
    <div className={cn(
      "p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10",
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">Rating Penjual</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Rating */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 min-w-[140px]">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-5 w-5",
                  star <= Math.round(stats.average_rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-amber-200 dark:text-amber-700"
                )}
              />
            ))}
          </div>
          <span className="text-4xl font-bold text-foreground">{stats.average_rating}</span>
          <span className={cn("text-sm font-medium mt-1", ratingInfo.color)}>
            {ratingInfo.label}
          </span>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{stats.total_reviews} ulasan</span>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats[`rating_${star}` as keyof RatingStats] as number || 0;
            const percentage = getPercentage(count);
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{star}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1">
                  <Progress 
                    value={percentage} 
                    className="h-2.5 bg-muted"
                  />
                </div>
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600">
            <ThumbsUp className="h-4 w-4" />
            <span className="font-bold">{Math.round((stats.rating_5 || 0 + stats.rating_4 || 0) / stats.total_reviews * 100)}%</span>
          </div>
          <span className="text-xs text-muted-foreground">Positif</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-bold">{stats.total_reviews}</span>
          </div>
          <span className="text-xs text-muted-foreground">Total Review</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="font-bold">{stats.average_rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">Rata-rata</span>
        </div>
      </div>
    </div>
  );
};
