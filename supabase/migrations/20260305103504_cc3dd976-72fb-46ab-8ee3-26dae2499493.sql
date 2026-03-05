
-- Drop existing permissive SELECT policies on all mf_* tables
DROP POLICY IF EXISTS "Authenticated users can read mf_orders" ON public.mf_orders;
DROP POLICY IF EXISTS "Authenticated users can read mf_users" ON public.mf_users;
DROP POLICY IF EXISTS "Authenticated users can read mf_plats" ON public.mf_plats;
DROP POLICY IF EXISTS "Authenticated users can read mf_wallets" ON public.mf_wallets;

-- Create admin-only SELECT policies
CREATE POLICY "Admin can read mf_orders" ON public.mf_orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can read mf_users" ON public.mf_users
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can read mf_plats" ON public.mf_plats
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can read mf_wallets" ON public.mf_wallets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
