-- Tabela para gerenciar pendências da dashboard
CREATE TABLE public.pendencias_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('diagnostico', 'pesquisa', 'formulario')),
  referencia_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT NOT NULL,
  icone TEXT DEFAULT 'FileText',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  planos_aplicaveis TEXT[] DEFAULT ARRAY['academy', 'business', 'skills'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pendencias_dashboard ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler pendências ativas
CREATE POLICY "pendencias_select" ON public.pendencias_dashboard
  FOR SELECT TO authenticated USING (true);

-- Apenas admins podem gerenciar (INSERT, UPDATE, DELETE)
CREATE POLICY "pendencias_admin_insert" ON public.pendencias_dashboard
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pendencias_admin_update" ON public.pendencias_dashboard
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pendencias_admin_delete" ON public.pendencias_dashboard
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_pendencias_dashboard_updated_at
  BEFORE UPDATE ON public.pendencias_dashboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Dados iniciais
INSERT INTO public.pendencias_dashboard (tipo, titulo, link, ordem, planos_aplicaveis) VALUES
  ('diagnostico', 'Diagnóstico Estratégico', '/meu-diagnostico', 1, ARRAY['academy', 'business', 'skills']),
  ('pesquisa', 'Pesquisa de Perfil', '/formulario-aplica', 2, ARRAY['academy', 'business', 'skills']);