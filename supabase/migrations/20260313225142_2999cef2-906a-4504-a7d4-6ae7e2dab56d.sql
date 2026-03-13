
-- Add columns for document uploads
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS id_proof_url text,
  ADD COLUMN IF NOT EXISTS passport_photo_url text;

-- Create storage bucket for provider documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-documents', 'provider-documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Providers can upload their own documents
CREATE POLICY "Providers can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'provider-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Providers can update their own documents
CREATE POLICY "Providers can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'provider-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Anyone can view provider documents (public bucket)
CREATE POLICY "Anyone can view provider documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'provider-documents');
