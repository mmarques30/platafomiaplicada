-- Expandir tabela conteudos_dashboard com novos campos
ALTER TABLE public.conteudos_dashboard
ADD COLUMN IF NOT EXISTS arquivo_pdf_url text,
ADD COLUMN IF NOT EXISTS estilo_texto jsonb DEFAULT '{"fontSize": 16, "lineHeight": 1.5, "fontWeight": "normal", "textAlign": "left"}'::jsonb,
ADD COLUMN IF NOT EXISTS galeria_imagens jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS autor text,
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

-- Criar bucket para armazenar imagens e PDFs da central de conteúdo
INSERT INTO storage.buckets (id, name, public)
VALUES ('conteudos-dashboard', 'conteudos-dashboard', true)
ON CONFLICT (id) DO NOTHING;

-- Política para admins gerenciarem arquivos
CREATE POLICY "Admins can manage conteudos-dashboard files"
ON storage.objects
FOR ALL
USING (bucket_id = 'conteudos-dashboard' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'conteudos-dashboard' AND has_role(auth.uid(), 'admin'::app_role));

-- Política para leitura pública dos arquivos
CREATE POLICY "Public can view conteudos-dashboard files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'conteudos-dashboard');