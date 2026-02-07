import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useUmkmOrders } from '@/hooks/useUmkmOrders';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, ShoppingCart, Minus, Plus, Trash2, ArrowLeft, 
  MapPin, CreditCard, Package, CheckCircle, AlertCircle
} from 'lucide-react';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: unknown) => void;
        onPending?: (result: unknown) => void;
        onError?: (result: unknown) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const Cart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { cart, isLoading, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { createOrder } = useUmkmOrders('buyer');

  const [step, setStep] = useState<'cart' | 'checkout' | 'payment' | 'success'>('cart');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [createdOrders, setCreatedOrders] = useState<string[]>([]);
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);

  // Check for payment success from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const orderNumber = searchParams.get('order');
    if (paymentStatus === 'success' && orderNumber) {
      setCreatedOrderNumber(orderNumber);
      setStep('success');
    }
  }, [searchParams]);

  // Load Midtrans Snap script
  useEffect(() => {
    const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!midtransClientKey) {
      console.warn('Midtrans client key not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', midtransClientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleQuantityChange = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    updateQuantity.mutate({ itemId, quantity: newQuantity });
  };

  const initiatePayment = async (orderId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('create-umkm-payment', {
        body: { order_id: orderId },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create payment');
      }

      const { snap_token, order_number } = response.data;

      if (!window.snap) {
        // Fallback to redirect URL if Snap is not loaded
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
          return;
        }
        throw new Error('Payment system not available');
      }

      return new Promise<{ success: boolean; orderNumber: string }>((resolve) => {
        window.snap!.pay(snap_token, {
          onSuccess: () => {
            resolve({ success: true, orderNumber: order_number });
          },
          onPending: () => {
            resolve({ success: true, orderNumber: order_number });
          },
          onError: (result) => {
            console.error('Payment error:', result);
            resolve({ success: false, orderNumber: order_number });
          },
          onClose: () => {
            resolve({ success: false, orderNumber: order_number });
          },
        });
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    if (!cart?.items.length || !shippingAddress) return;

    setIsProcessing(true);

    // Group items by UMKM
    const itemsByUmkm = cart.items.reduce((acc, item) => {
      const umkmId = item.product?.umkm?.id;
      if (!umkmId) return acc;
      
      if (!acc[umkmId]) {
        acc[umkmId] = [];
      }
      acc[umkmId].push(item);
      return acc;
    }, {} as Record<string, typeof cart.items>);

    try {
      const orderIds: string[] = [];

      // Create orders for each UMKM
      for (const [umkmId, items] of Object.entries(itemsByUmkm)) {
        const orderData = {
          umkm_id: umkmId,
          items: items.map(item => ({
            product_id: item.product_id,
            product_name: item.product?.name || '',
            price: item.price,
            quantity: item.quantity,
          })),
          shipping_address: shippingAddress,
          notes,
        };

        const result = await createOrder.mutateAsync(orderData);
        orderIds.push(result.id);
        setCreatedOrderNumber(result.order_number);
      }

      setCreatedOrders(orderIds);

      // Clear cart after successful order creation
      await clearCart.mutateAsync();

      // Start payment process for first order
      if (orderIds.length > 0) {
        setCurrentPaymentIndex(0);
        setStep('payment');
        
        const paymentResult = await initiatePayment(orderIds[0]);
        
        if (paymentResult?.success) {
          setCreatedOrderNumber(paymentResult.orderNumber);
          setStep('success');
        } else {
          toast({
            title: 'Pembayaran dibatalkan',
            description: 'Pesanan Anda telah dibuat. Silakan lanjutkan pembayaran di halaman pesanan.',
            variant: 'default',
          });
          navigate('/dashboard/orders');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Payment Processing Step
  if (step === 'payment') {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Memproses Pembayaran</h1>
              <p className="text-muted-foreground">
                Silakan selesaikan pembayaran pada popup yang muncul...
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
              <p className="text-muted-foreground mb-4">
                Pesanan Anda telah dibayar dan sedang diproses oleh penjual.
              </p>
              <p className="text-sm text-muted-foreground mb-2">Nomor Pesanan:</p>
              <p className="font-mono text-lg font-semibold mb-8 bg-muted px-4 py-2 rounded-lg inline-block">
                {createdOrderNumber}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/umkm/products')}>
                  Lanjut Belanja
                </Button>
                <Button onClick={() => navigate('/dashboard/orders')}>
                  Lihat Pesanan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Checkout Step
  if (step === 'checkout') {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <Button
            variant="ghost"
            onClick={() => setStep('cart')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Keranjang
          </Button>

          <div className="grid gap-8 md:grid-cols-[1fr_350px]">
            {/* Shipping Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan untuk penjual..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="text-muted-foreground">Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!shippingAddress || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buat Pesanan
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Cart Step
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Keranjang Belanja
          {totalItems > 0 && (
            <span className="text-muted-foreground font-normal text-base">
              ({totalItems} item)
            </span>
          )}
        </h1>

        {!cart?.items.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
              <p className="text-muted-foreground mb-6">Belum ada produk di keranjang Anda</p>
              <Button onClick={() => navigate('/umkm/products')}>
                <Package className="mr-2 h-4 w-4" />
                Mulai Belanja
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_350px]">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {item.product?.images?.find(i => i.is_primary)?.image_url ? (
                          <img 
                            src={item.product.images.find(i => i.is_primary)?.image_url}
                            alt={item.product?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product?.umkm?.umkm_name}
                        </p>
                        <p className="font-semibold text-primary mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card className="h-fit sticky top-4">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} item)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setStep('checkout')}
                >
                  Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;
