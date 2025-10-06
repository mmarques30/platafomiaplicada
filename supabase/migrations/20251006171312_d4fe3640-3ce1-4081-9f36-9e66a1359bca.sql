-- Adicionar coluna imagem_url na tabela trilhas
ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Adicionar coluna thumbnail_customizado_url na tabela videos
ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_customizado_url TEXT;

-- Criar bucket para imagens de trilhas (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trilhas-imagens', 'trilhas-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para thumbnails customizados de vídeos (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-thumbnails', 'video-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para bucket trilhas-imagens
CREATE POLICY "Admins can upload trilha images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trilhas-imagens' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update trilha images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'trilhas-imagens' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete trilha images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'trilhas-imagens' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view trilha images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trilhas-imagens');

-- Políticas RLS para bucket video-thumbnails
CREATE POLICY "Admins can upload video thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update video thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'video-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete video thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'video-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view video thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-thumbnails');