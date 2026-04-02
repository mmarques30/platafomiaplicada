
-- 1. Fix instrucoes-recursos storage policies - drop old and recreate with admin check
DROP POLICY IF EXISTS "Admins podem fazer upload de recursos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar recursos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar recursos" ON storage.objects;

CREATE POLICY "Admins podem fazer upload de recursos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'instrucoes-recursos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem atualizar recursos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'instrucoes-recursos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar recursos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'instrucoes-recursos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Fix reports_public_links permissive SELECT policy
DROP POLICY IF EXISTS "Qualquer um pode ler por token" ON public.reports_public_links;

CREATE POLICY "Admins can read public report links"
ON public.reports_public_links
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
