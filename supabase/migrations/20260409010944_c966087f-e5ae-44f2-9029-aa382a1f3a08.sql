
CREATE POLICY "Admins podem inserir contratos-business"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contratos-business'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins podem deletar contratos-business"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contratos-business'
  AND public.has_role(auth.uid(), 'admin')
);
