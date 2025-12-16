-- Add arquivos_url column to materiais_gratuitos
ALTER TABLE public.materiais_gratuitos
ADD COLUMN arquivos_url jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for materiais gratuitos files
INSERT INTO storage.buckets (id, name, public)
VALUES ('materiais-gratuitos', 'materiais-gratuitos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Admins can upload materiais gratuitos files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'materiais-gratuitos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update materiais gratuitos files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'materiais-gratuitos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete materiais gratuitos files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'materiais-gratuitos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can read materiais gratuitos files"
ON storage.objects FOR SELECT
USING (bucket_id = 'materiais-gratuitos');