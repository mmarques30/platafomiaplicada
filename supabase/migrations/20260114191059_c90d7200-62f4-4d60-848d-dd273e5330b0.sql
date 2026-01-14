-- Permitir acesso público a documentos legais não restritos (apenas_mentorados = false)
-- Isso permite que visitantes não logados vejam Termos de Uso e Política de Privacidade

CREATE POLICY "Public can view non-restricted documentos"
ON public.documentos_legais
FOR SELECT
TO anon, authenticated
USING (apenas_mentorados = false);