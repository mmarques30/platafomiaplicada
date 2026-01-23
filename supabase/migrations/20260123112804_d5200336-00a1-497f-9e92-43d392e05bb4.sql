-- Criar bucket privado para contratos
INSERT INTO storage.buckets (id, name, public)
VALUES ('contratos-business', 'contratos-business', false)
ON CONFLICT (id) DO NOTHING;

-- Politica: Admins podem fazer upload de contratos
CREATE POLICY "Admins podem fazer upload de contratos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contratos-business' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Politica: Admins podem atualizar contratos
CREATE POLICY "Admins podem atualizar contratos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contratos-business' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Politica: Usuarios podem baixar seus proprios contratos
CREATE POLICY "Usuarios podem baixar seus contratos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contratos-business' AND
  (
    -- Admins podem ver todos
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Usuarios podem ver seus proprios documentos
    EXISTS (
      SELECT 1 FROM public.documentos_business db
      JOIN public.contratos_business cb ON cb.id = db.contrato_id
      WHERE cb.user_id = auth.uid()
      AND storage.objects.name LIKE cb.id::text || '/%'
    )
  )
);