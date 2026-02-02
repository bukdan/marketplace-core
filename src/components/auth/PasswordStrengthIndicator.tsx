import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  textColor: string;
}

const calculateStrength = (password: string): StrengthResult => {
  let score = 0;
  
  if (!password) {
    return { score: 0, label: '', color: 'bg-muted', textColor: 'text-muted-foreground' };
  }

  // Length checks
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Determine strength level
  if (score <= 2) {
    return { 
      score: 25, 
      label: 'Lemah', 
      color: 'bg-destructive',
      textColor: 'text-destructive'
    };
  } else if (score <= 4) {
    return { 
      score: 50, 
      label: 'Sedang', 
      color: 'bg-warning',
      textColor: 'text-warning'
    };
  } else if (score <= 5) {
    return { 
      score: 75, 
      label: 'Kuat', 
      color: 'bg-success',
      textColor: 'text-success'
    };
  } else {
    return { 
      score: 100, 
      label: 'Sangat Kuat', 
      color: 'bg-success',
      textColor: 'text-success'
    };
  }
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Kekuatan password:</span>
        <span className={cn('text-xs font-medium', strength.textColor)}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300', strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-0.5">
        <li className={cn(password.length >= 8 ? 'text-success' : '')}>
          • Minimal 8 karakter
        </li>
        <li className={cn(/[A-Z]/.test(password) ? 'text-success' : '')}>
          • Huruf besar (A-Z)
        </li>
        <li className={cn(/[a-z]/.test(password) ? 'text-success' : '')}>
          • Huruf kecil (a-z)
        </li>
        <li className={cn(/[0-9]/.test(password) ? 'text-success' : '')}>
          • Angka (0-9)
        </li>
        <li className={cn(/[^a-zA-Z0-9]/.test(password) ? 'text-success' : '')}>
          • Karakter khusus (!@#$%^&*)
        </li>
      </ul>
    </div>
  );
};
