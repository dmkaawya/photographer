-- ============================================
-- Sadeepa Photography - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Gallery Images Table
-- ============================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('wedding', 'pre-shoot', 'events', 'modeling')),
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Packages Table
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'LKR',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Bookings Table
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  package_id UUID REFERENCES packages(id),
  package_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  message TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  location_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  invoice_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Gallery Images: public read, admin write
CREATE POLICY "gallery_public_read" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_admin_write" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

-- Packages: public read enabled only, admin full access
CREATE POLICY "packages_public_read" ON packages FOR SELECT USING (is_enabled = true);
CREATE POLICY "packages_admin_all" ON packages FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: public insert, admin read/update
CREATE POLICY "bookings_public_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_admin_read" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "bookings_admin_update" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- Storage Buckets
-- ============================================
-- Run in Supabase Storage dashboard or via API:
-- Create a bucket named 'gallery' with public access

-- ============================================
-- Seed Data - Default Packages
-- ============================================
INSERT INTO packages (name, price, currency, description, features, is_enabled, is_featured, sort_order) VALUES
(
  'Essential',
  25000,
  'LKR',
  'Perfect for intimate gatherings and pre-shoots. Professional coverage with quick delivery.',
  ARRAY['4 Hours Coverage', '200 Edited Photos', 'Online Gallery', '1 Photographer', 'Basic Retouching'],
  true,
  false,
  1
),
(
  'Premium',
  55000,
  'LKR',
  'Our most popular package for weddings and events. Comprehensive coverage with cinematic results.',
  ARRAY['8 Hours Coverage', '500 Edited Photos', 'Online Gallery', '2 Photographers', 'Advanced Retouching', 'Same Day Preview', 'USB Drive'],
  true,
  true,
  2
),
(
  'Luxury',
  95000,
  'LKR',
  'The ultimate photography experience. Full day coverage with cinematic video and premium album.',
  ARRAY['12 Hours Coverage', 'Unlimited Photos', 'Private Gallery', '3 Photographers', 'Cinematic Video', 'Premium Album', 'Drone Shots', 'Rush Delivery'],
  true,
  false,
  3
);

-- ============================================
-- Updated_at trigger for packages
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
