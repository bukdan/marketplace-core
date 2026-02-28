
-- Add umkm_owner to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'umkm_owner';

-- Add RLS policies for admins to manage user_roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
