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
  primary: 'from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40',
  secondary: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40',
  accent: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40',
  success: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40',
  warning: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40',
};

const iconContainerStyles = {
  primary: 'from-primary/20 to-primary/10 text-primary group-hover:shadow-primary/30',
  secondary: 'from-blue-500/20 to-blue-500/10 text-blue-600 group-hover:shadow-blue-500/30',
  accent: 'from-purple-500/20 to-purple-500/10 text-purple-600 group-hover:shadow-purple-500/30',
  success: 'from-emerald-500/20 to-emerald-500/10 text-emerald-600 group-hover:shadow-emerald-500/30',
  warning: 'from-amber-500/20 to-amber-500/10 text-amber-600 group-hover:shadow-amber-500/30',
};

const glowStyles = {
  primary: 'group-hover:shadow-[0_8px_30px_-8px] group-hover:shadow-primary/20',
  secondary: 'group-hover:shadow-[0_8px_30px_-8px] group-hover:shadow-blue-500/20',
  accent: 'group-hover:shadow-[0_8px_30px_-8px] group-hover:shadow-purple-500/20',
  success: 'group-hover:shadow-[0_8px_30px_-8px] group-hover:shadow-emerald-500/20',
  warning: 'group-hover:shadow-[0_8px_30px_-8px] group-hover:shadow-amber-500/20',
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
        "group relative overflow-hidden rounded-2xl border p-5",
        "bg-gradient-to-br backdrop-blur-sm cursor-pointer",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.02] hover:-translate-y-1",
        variantStyles[variant],
        glowStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold mb-2 text-foreground transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
            {description}
          </p>
        </div>
        <div 
          className={cn(
            "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br shadow-lg",
            "transition-all duration-500 ease-out",
            "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl",
            iconContainerStyles[variant]
          )}
        >
          <div className="transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Decorative gradient orb with animation */}
      <div 
        className={cn(
          "absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-20 blur-2xl",
          "transition-all duration-700 ease-out",
          "group-hover:opacity-40 group-hover:scale-150 group-hover:-right-4 group-hover:-bottom-4",
          variant === 'primary' && "bg-primary",
          variant === 'secondary' && "bg-blue-500",
          variant === 'accent' && "bg-purple-500",
          variant === 'success' && "bg-emerald-500",
          variant === 'warning' && "bg-amber-500",
        )}
      />
      
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};
