import * as React from 'react';
import { cn } from '@/lib/utils';

interface GradientHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3';
  variant?: 'default' | 'light';
  children: React.ReactNode;
}

const gradientStyles = {
  default: {
    background: 'linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #a855f7)',
    backgroundSize: '300% 300%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'gradient-shift 4s ease-in-out infinite',
  } as React.CSSProperties,
  light: {
    background: 'linear-gradient(135deg, #f0e6ff, #c084fc, #7dd3fc, #f0e6ff, #c084fc)',
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'gradient-shift 5s ease-in-out infinite',
  } as React.CSSProperties,
};

export const GradientHeading = ({
  as: Tag = 'h2',
  variant = 'default',
  className,
  children,
  ...props
}: GradientHeadingProps) => {
  return (
    <Tag
      className={cn('inline-block', className)}
      style={gradientStyles[variant]}
      {...props}
    >
      {children}
    </Tag>
  );
};
