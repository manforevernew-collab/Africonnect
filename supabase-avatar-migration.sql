-- AfriConnect v2: Add avatar and setup wizard columns
-- Run this in your Supabase SQL Editor

-- Add new columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT false;

-- Update trigger to include avatar_url default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, user_type, kyc_status, address_status, avatar_url, setup_complete)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    'user', 
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'job_seeker'),
    'unverified',
    'unverified',
    NULL,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
DROP POLICY IF EXISTS "Avatar uploads" ON storage.objects;
CREATE POLICY "Avatar uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar updates" ON storage.objects;
CREATE POLICY "Avatar updates" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated' AND bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar reads" ON storage.objects;
CREATE POLICY "Avatar reads" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
