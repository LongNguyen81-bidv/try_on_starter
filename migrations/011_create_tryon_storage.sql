-- Migration: 011_create_tryon_storage.sql
-- Description: Create storage bucket for AI-generated try-on images
-- Sprint: 3 - Virtual Fitting Room
-- User Stories: US-05, US-06

-- ============================================
-- STORAGE BUCKET: tryon-results
-- ============================================
-- Lưu trữ ảnh kết quả thử đồ ảo (AI generated)
-- Public access cho read (để frontend hiển thị)
-- Backend service role cho write
-- ============================================

-- Create storage bucket for try-on results
-- Note: Run this in Supabase Dashboard -> Storage -> Create new bucket
-- Or use the Supabase CLI

-- Bucket configuration:
-- Name: tryon-results
-- Public: true (for read access)
-- File size limit: 10MB (AI generated images có thể lớn)
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy: Public can read all try-on result images
-- (Các ảnh kết quả cần public để frontend hiển thị)
CREATE POLICY "Public can view tryon results"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tryon-results');

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own tryon results"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tryon-results'
);

-- Policy: Service role can do anything (for backend)
-- Note: Service role bypasses RLS by default

-- ============================================
-- FOLDER STRUCTURE
-- ============================================
-- tryon-results/
--   └── {user_id}/
--       └── {product_id}.{ext}
--
-- Example: tryon-results/550e8400-e29b-41d4-a716-446655440000/abc123.webp
-- ============================================

-- ============================================
-- NOTES FOR MANUAL SETUP
-- ============================================
-- If using Supabase Dashboard:
-- 1. Go to Storage -> Create new bucket
-- 2. Name: tryon-results
-- 3. Public bucket: Yes
-- 4. File size limit: 10MB
-- 5. Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp
-- 
-- After creating bucket, add policies via SQL Editor or Dashboard
-- ============================================
