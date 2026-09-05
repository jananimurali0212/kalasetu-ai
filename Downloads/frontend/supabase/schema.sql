-- ==============================================================================
-- KalaSetu Supabase PostgreSQL Schema & Storage Setup
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('artisan', 'buyer')),
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta', 'hi')),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for profiles lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    material TEXT,
    craft_technique TEXT,
    style TEXT,
    tags TEXT[] DEFAULT '{}',
    potential_uses TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ta', 'hi')),
    price_per_unit NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    minimum_order_quantity INTEGER DEFAULT 1,
    lead_time_days INTEGER DEFAULT 7,
    stock_available INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT true,
    multilingual_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for products lookup
CREATE INDEX IF NOT EXISTS idx_products_artisan_id ON public.products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Profiles RLS Policies
-- Users can view their own profile; authenticated buyers/users can also view artisan profiles for product attribution
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR role = 'artisan');

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6. Products RLS Policies
-- Artisans can create their own products
CREATE POLICY "Artisans can create their own products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = artisan_id);

-- Artisans can view their own products; published products are viewable by authenticated users (buyers and artisans)
CREATE POLICY "Artisans can view their own products"
    ON public.products FOR SELECT
    TO authenticated
    USING (auth.uid() = artisan_id OR is_published = true);

-- Artisans can update their own products only
CREATE POLICY "Artisans can update their own products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (auth.uid() = artisan_id)
    WITH CHECK (auth.uid() = artisan_id);

-- Artisans can delete their own products only
CREATE POLICY "Artisans can delete their own products"
    ON public.products FOR DELETE
    TO authenticated
    USING (auth.uid() = artisan_id);

-- 7. Trigger for Updated_at Timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Supabase Storage Bucket Setup for Product Images
-- Note: You can also create this bucket via the Supabase Dashboard -> Storage -> New Bucket ("product-images", public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
CREATE POLICY "Allow public read of product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload product images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Allow users to update their own product images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'product-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Allow users to delete their own product images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'product-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
