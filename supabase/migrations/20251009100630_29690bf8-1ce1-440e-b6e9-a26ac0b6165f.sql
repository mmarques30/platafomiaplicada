-- Adicionar colunas para diagnóstico feito por admin
ALTER TABLE formulario_diagnostico
ADD COLUMN IF NOT EXISTS arquivo_diagnostico_url TEXT,
ADD COLUMN IF NOT EXISTS preenchido_por TEXT DEFAULT 'mentorado' CHECK (preenchido_por IN ('mentorado', 'admin')),
ADD COLUMN IF NOT EXISTS observacoes_admin TEXT;

-- Criar bucket para arquivos de diagnóstico
INSERT INTO storage.buckets (id, name, public)
VALUES ('diagnosticos-mentoria', 'diagnosticos-mentoria', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies para storage bucket
CREATE POLICY "Admin pode fazer upload de diagnósticos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diagnosticos-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin pode visualizar todos diagnósticos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'diagnosticos-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Mentorados podem visualizar seu próprio diagnóstico"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'diagnosticos-mentoria' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admin pode deletar diagnósticos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'diagnosticos-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Atualizar policy de formulario_diagnostico para admin poder inserir
CREATE POLICY "Admin pode criar diagnóstico para mentorados"
ON formulario_diagnostico FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));