
-- Create KYC documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload their own KYC documents
CREATE POLICY "Users can upload own kyc docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own KYC documents
CREATE POLICY "Users can view own kyc docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own KYC documents
CREATE POLICY "Users can update own kyc docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own KYC documents
CREATE POLICY "Users can delete own kyc docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all KYC documents
CREATE POLICY "Admins can view all kyc docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);
