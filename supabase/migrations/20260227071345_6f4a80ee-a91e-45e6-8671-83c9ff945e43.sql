
-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload banner images
CREATE POLICY "Authenticated users can upload banner images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banner-images');

-- Anyone can view banner images (public bucket)
CREATE POLICY "Anyone can view banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

-- Users can update own banner images
CREATE POLICY "Users can update own banner images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banner-images');

-- Users can delete own banner images
CREATE POLICY "Users can delete own banner images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banner-images');
