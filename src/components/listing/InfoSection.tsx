import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InfoSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  primary: 'from-primary/10 via-primary/5 to-transparent border-primary/20',
  secondary: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20',
  accent: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20',
  success: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20',
  warning: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20',
};

const iconContainerStyles = {
  primary: 'from-primary/20 to-primary/10 text-primary',
  secondary: 'from-blue-500/20 to-blue-500/10 text-blue-600',
  accent: 'from-purple-500/20 to-purple-500/10 text-purple-600',
  success: 'from-emerald-500/20 to-emerald-500/10 text-emerald-600',
  warning: 'from-amber-500/20 to-amber-500/10 text-amber-600',
};

export const InfoSection = ({ 
  title, 
  description, 
  icon, 
  variant = 'primary',
  className 
}: InfoSectionProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
        "bg-gradient-to-br backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold mb-2 text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div 
          className={cn(
            "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br shadow-lg",
            iconContainerStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
      
      {/* Decorative gradient orb */}
      <div 
        className={cn(
          "absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-20 blur-2xl",
          variant === 'primary' && "bg-primary",
          variant === 'secondary' && "bg-blue-500",
          variant === 'accent' && "bg-purple-500",
          variant === 'success' && "bg-emerald-500",
          variant === 'warning' && "bg-amber-500",
        )}
      />
    </div>
  );
};
