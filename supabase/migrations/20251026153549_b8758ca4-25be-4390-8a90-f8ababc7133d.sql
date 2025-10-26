-- Criar bucket público para logos de ferramentas
INSERT INTO storage.buckets (id, name, public)
VALUES ('ferramentas-logos', 'ferramentas-logos', true);

-- RLS Policy: Admins podem fazer upload
CREATE POLICY "Admins podem fazer upload de logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ferramentas-logos' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- RLS Policy: Todos podem visualizar (bucket público)
CREATE POLICY "Logos são públicos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ferramentas-logos');

-- RLS Policy: Admins podem deletar logos antigos
CREATE POLICY "Admins podem deletar logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ferramentas-logos' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);