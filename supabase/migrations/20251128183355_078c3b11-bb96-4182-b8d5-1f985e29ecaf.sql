-- Create materiais_gratuitos table
CREATE TABLE public.materiais_gratuitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('templates', 'guias', 'prompts', 'ferramentas', 'checklists', 'ebooks')),
  url TEXT NOT NULL,
  tipo TEXT DEFAULT 'download' CHECK (tipo IN ('download', 'link')),
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.materiais_gratuitos ENABLE ROW LEVEL SECURITY;

-- Public read access for active materials
CREATE POLICY "Materiais gratuitos são públicos para leitura"
  ON public.materiais_gratuitos FOR SELECT
  USING (ativo = true);

-- Admins can manage all materials
CREATE POLICY "Admins podem gerenciar materiais"
  ON public.materiais_gratuitos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));