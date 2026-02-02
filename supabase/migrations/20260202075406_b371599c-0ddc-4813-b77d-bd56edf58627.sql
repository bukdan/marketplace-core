-- Create orders table for tracking purchases after auction/sale
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  auction_id uuid REFERENCES public.listing_auctions(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_status text DEFAULT 'unpaid',
  shipping_address text,
  shipping_method text,
  tracking_number text,
  notes text,
  paid_at timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Buyers can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their listings"
ON public.orders FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status"
ON public.orders FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_listing_id ON public.orders(listing_id);