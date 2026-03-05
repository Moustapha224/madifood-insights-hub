
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MadiFood data tables
CREATE TABLE public.mf_users (
  id TEXT NOT NULL,
  username TEXT DEFAULT '',
  firstname TEXT DEFAULT '',
  lastname TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  profession TEXT DEFAULT '',
  is_deleted BOOLEAN DEFAULT false,
  source TEXT DEFAULT '',
  created_at_date TEXT DEFAULT '',
  created_at_time TEXT DEFAULT '',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
ALTER TABLE public.mf_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read mf_users" ON public.mf_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert mf_users" ON public.mf_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete mf_users" ON public.mf_users FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mf_orders (
  order_id TEXT NOT NULL,
  user_id TEXT DEFAULT '',
  user_name TEXT DEFAULT '',
  restaurant_id TEXT DEFAULT '',
  restaurant_name TEXT DEFAULT '',
  restaurant_phone TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  total NUMERIC DEFAULT 0,
  sub_total NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  service_fee NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT '',
  status TEXT DEFAULT '',
  created_at_date TEXT DEFAULT '',
  created_at_time TEXT DEFAULT '',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (order_id)
);
ALTER TABLE public.mf_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read mf_orders" ON public.mf_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert mf_orders" ON public.mf_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete mf_orders" ON public.mf_orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mf_plats (
  id TEXT NOT NULL,
  name TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  restaurant_id TEXT DEFAULT '',
  restaurant_name TEXT DEFAULT '',
  category TEXT DEFAULT '',
  time_to_cook INTEGER DEFAULT 0,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
ALTER TABLE public.mf_plats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read mf_plats" ON public.mf_plats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert mf_plats" ON public.mf_plats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete mf_plats" ON public.mf_plats FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mf_wallets (
  user_id TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  last_updated TEXT DEFAULT '',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);
ALTER TABLE public.mf_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read mf_wallets" ON public.mf_wallets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert mf_wallets" ON public.mf_wallets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete mf_wallets" ON public.mf_wallets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
