-- Add arquivos_url column to ia_copie_use table
ALTER TABLE public.ia_copie_use
ADD COLUMN arquivos_url jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for ia-copie-use files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ia-copie-use', 'ia-copie-use', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload files
CREATE POLICY "Admins can upload ia-copie-use files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ia-copie-use' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update files
CREATE POLICY "Admins can update ia-copie-use files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'ia-copie-use' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete ia-copie-use files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ia-copie-use' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow public read access to files
CREATE POLICY "Public can view ia-copie-use files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ia-copie-use');