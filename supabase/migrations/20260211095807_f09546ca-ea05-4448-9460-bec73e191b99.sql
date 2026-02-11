
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'manager');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  qty_in_stock INTEGER NOT NULL DEFAULT 0,
  buying_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  date_of_entry DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Import records table
CREATE TABLE public.import_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  supplier TEXT NOT NULL DEFAULT '',
  entered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Import line items
CREATE TABLE public.import_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES public.import_records(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  qty INTEGER NOT NULL DEFAULT 1,
  unit_buying_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales records table
CREATE TABLE public.sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  qty INTEGER NOT NULL DEFAULT 1,
  unit_selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_buying_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  profit NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  entered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user is owner or manager
CREATE OR REPLACE FUNCTION public.is_authenticated_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner', 'manager')
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User roles policies (only owners can manage roles, users can read own)
CREATE POLICY "Authenticated members can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Only owners can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Only owners can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Only owners can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- Products policies (both can read/insert/update, only owner can delete)
CREATE POLICY "Members can view products" ON public.products
  FOR SELECT TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Only owners can delete products" ON public.products
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- Import records policies
CREATE POLICY "Members can view imports" ON public.import_records
  FOR SELECT TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can insert imports" ON public.import_records
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can update imports" ON public.import_records
  FOR UPDATE TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Only owners can delete imports" ON public.import_records
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- Import line items policies
CREATE POLICY "Members can view import lines" ON public.import_line_items
  FOR SELECT TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can insert import lines" ON public.import_line_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can update import lines" ON public.import_line_items
  FOR UPDATE TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Only owners can delete import lines" ON public.import_line_items
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- Sales records policies
CREATE POLICY "Members can view sales" ON public.sales_records
  FOR SELECT TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can insert sales" ON public.sales_records
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Members can update sales" ON public.sales_records
  FOR UPDATE TO authenticated
  USING (public.is_authenticated_member(auth.uid()));

CREATE POLICY "Only owners can delete sales" ON public.sales_records
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Generate SKU function
CREATE OR REPLACE FUNCTION public.generate_sku(p_category TEXT, p_brand TEXT, p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  suffix TEXT;
  counter INTEGER;
BEGIN
  prefix := UPPER(LEFT(p_category, 3)) || '-' || UPPER(LEFT(p_brand, 3));
  suffix := UPPER(LEFT(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '', 'g'), 4));
  SELECT COUNT(*) + 1 INTO counter FROM public.products WHERE sku LIKE prefix || '%';
  RETURN prefix || '-' || suffix || '-' || LPAD(counter::TEXT, 3, '0');
END;
$$;
