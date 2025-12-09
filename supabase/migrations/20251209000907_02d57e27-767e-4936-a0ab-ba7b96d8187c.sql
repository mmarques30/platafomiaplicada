-- Criar bucket para imagens de posts da comunidade
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-posts-images', 'community-posts-images', true);

-- Upload: apenas mentorados e admins autenticados (não visitantes)
CREATE POLICY "Mentorados e admins podem fazer upload de imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-posts-images' 
  AND NOT public.has_role(auth.uid(), 'visitante'::app_role)
);

-- Leitura: todos autenticados podem ver
CREATE POLICY "Todos autenticados podem ver imagens de posts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'community-posts-images');

-- Delete: usuário pode deletar suas próprias imagens
CREATE POLICY "Usuarios podem deletar suas proprias imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-posts-images' 
  AND (auth.uid()::text = (storage.foldername(name))[1])
);