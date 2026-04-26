-- Moto-Tech Pro Supabase Schema

-- 1. Users & Roles (Extending or simple table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'RECEPTIONIST', 'MECHANIC', 'STOREKEEPER', 'CLIENT')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products / Inventory
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  cost_price DECIMAL(10,2) DEFAULT 0,
  sell_price DECIMAL(10,2) NOT NULL,
  location TEXT,
  primary_image_url TEXT,
  secondary_image_urls TEXT[], -- Array of strings
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Service Orders (Repairs)
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE,
  customer_name TEXT NOT NULL,
  bike_model TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  status TEXT DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'IN_PROGRESS', 'AWAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED')),
  technician_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  total_budget DECIMAL(10,2) DEFAULT 0,
  date_received TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tasks within Orders
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  mechanic_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Sales / Transactions
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_type TEXT DEFAULT 'STORE' CHECK (sale_type IN ('STORE', 'ONLINE', 'SERVICE')),
  total_amount DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  items JSONB, -- Storing sold items for snapshot
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Part Requests (Mechanic requesting from stock)
CREATE TABLE IF NOT EXISTS public.part_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Simplified for this app)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_requests ENABLE ROW LEVEL SECURITY;

-- Simple policies (Allow all for anonymous for demo purposes - harden for production)
CREATE POLICY "Public Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read" ON public.service_orders FOR SELECT USING (true);
CREATE POLICY "Public Read" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public Read" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Public Read" ON public.part_requests FOR SELECT USING (true);

-- Allow writes (Harden these based on roles in a real app)
CREATE POLICY "Public Write" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public Write" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Write" ON public.service_orders FOR ALL USING (true);
CREATE POLICY "Public Write" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Public Write" ON public.sales FOR ALL USING (true);
CREATE POLICY "Public Write" ON public.part_requests FOR ALL USING (true);

-- 7. Storage Buckets (Manual step in UI, but SQL for reference if enabled)
-- Note: Supabase storage buckets are often managed via the dashboard.
-- To allow public access to images bucket:
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' );
-- create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'images' );
