import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images?: { image_url: string; is_primary: boolean }[];
    umkm?: { id: string; umkm_name: string };
  };
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  items: CartItem[];
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First, try to get existing cart
      let { data: existingCart, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // If no cart exists, create one
      if (!existingCart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        existingCart = newCart;
      }

      // Fetch cart items with product details
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            id, name, price, stock,
            images:product_images(image_url, is_primary),
            umkm:umkm_profiles(id, umkm_name)
          )
        `)
        .eq('cart_id', existingCart.id);

      if (itemsError) throw itemsError;

      return {
        ...existingCart,
        items: items ?? [],
      } as Cart;
    },
    enabled: !!user?.id,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity, price }: { productId: string; quantity: number; price: number }) => {
      if (!cart?.id) throw new Error('Cart not found');

      // Check if item already exists in cart
      const existingItem = cart.items.find(item => item.product_id === productId);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity,
            price,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Ditambahkan ke keranjang',
        description: 'Produk berhasil ditambahkan ke keranjang.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal menambahkan',
        description: error.message,
      });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui',
        description: error.message,
      });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Dihapus',
        description: 'Produk berhasil dihapus dari keranjang.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus',
        description: error.message,
      });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!cart?.id) return;
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const totalPrice = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) ?? 0;

  return {
    cart,
    isLoading,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};
