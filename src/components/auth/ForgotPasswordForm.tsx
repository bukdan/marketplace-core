import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email tidak valid');

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    setIsLoading(false);

    if (resetError) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim Email',
        description: resetError.message,
      });
    } else {
      setIsSuccess(true);
      toast({
        title: 'Email Terkirim',
        description: 'Cek inbox email Anda untuk link reset password.',
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold">Email Terkirim!</h3>
        <p className="text-sm text-muted-foreground">
          Kami telah mengirim link reset password ke <strong>{email}</strong>. 
          Silakan cek inbox atau folder spam Anda.
        </p>
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Lupa Password?</h3>
        <p className="text-sm text-muted-foreground">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          'Kirim Link Reset'
        )}
      </Button>

      <Button type="button" variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Login
      </Button>
    </form>
  );
};
