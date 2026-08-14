-- AfriTalent: RLS Policy Fixes
-- Run this in your Supabase SQL Editor to fix permission errors

-- Fix jobs table INSERT policy
DROP POLICY IF EXISTS "Authenticated insert jobs" ON jobs;
CREATE POLICY "Authenticated insert jobs" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fix jobs table UPDATE/DELETE policies
DROP POLICY IF EXISTS "Users update own jobs" ON jobs;
CREATE POLICY "Users update own jobs" ON jobs FOR UPDATE USING (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Users delete own jobs" ON jobs;
CREATE POLICY "Users delete own jobs" ON jobs FOR DELETE USING (auth.uid() = posted_by);

-- Fix professionals table INSERT
DROP POLICY IF EXISTS "Authenticated insert professionals" ON professionals;
CREATE POLICY "Authenticated insert professionals" ON professionals FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fix storage bucket policies (for resumes and kyc)
-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('resumes', 'resumes', true),
  ('kyc', 'kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to resumes bucket
DROP POLICY IF EXISTS "Authenticated uploads" ON storage.objects;
CREATE POLICY "Authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('resumes', 'kyc'));

-- Allow users to read their own files
DROP POLICY IF EXISTS "Users read own files" ON storage.objects;
CREATE POLICY "Users read own files" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id IN ('resumes', 'kyc'));

-- Verify
SELECT 'Jobs policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs';
