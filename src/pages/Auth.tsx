import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const emailSchema = z.string().email('Email tidak valid');
const passwordSchema = z.string().min(6, 'Password minimal 6 karakter');
const nameSchema = z.string().min(2, 'Nama minimal 2 karakter');

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for reset password mode
  const isResetMode = searchParams.get('mode') === 'reset';

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(loginEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.loginEmail = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(loginPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.loginPassword = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      nameSchema.parse(registerName);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.registerName = e.errors[0].message;
      }
    }

    try {
      emailSchema.parse(registerEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.registerEmail = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(registerPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.registerPassword = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.message === 'Invalid login credentials' 
          ? 'Email atau password salah' 
          : error.message,
      });
    } else {
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
      });
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    const { error } = await signUp(registerEmail, registerPassword, registerName);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'Email sudah terdaftar. Silakan login.';
      }
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description: message,
      });
    } else {
      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun berhasil dibuat. Anda akan diarahkan ke dashboard.',
      });
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login Google Gagal',
          description: error.message,
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Login Google Gagal',
        description: 'Terjadi kesalahan saat login dengan Google',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
          <CardDescription>Masuk atau daftar untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.loginEmail && (
                      <p className="text-sm text-destructive">{errors.loginEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.loginPassword && (
                      <p className="text-sm text-destructive">{errors.loginPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Lupa password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      atau
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    Masuk dengan Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.registerName && (
                      <p className="text-sm text-destructive">{errors.registerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.registerEmail && (
                      <p className="text-sm text-destructive">{errors.registerEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.registerPassword && (
                      <p className="text-sm text-destructive">{errors.registerPassword}</p>
                    )}
                    <PasswordStrengthIndicator password={registerPassword} />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Daftar'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      atau
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    Daftar dengan Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
