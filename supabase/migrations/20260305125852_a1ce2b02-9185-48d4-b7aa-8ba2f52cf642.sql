
-- Tabela: Processos Mapeados (SOPs)
CREATE TABLE public.processos_mapeados_business (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'link',
  url TEXT,
  arquivo_path TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: Telas do Sistema
CREATE TABLE public.telas_sistema_business (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  screenshot_url TEXT,
  link_sistema TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: Vídeos de Instrução
CREATE TABLE public.videos_instrucao_business (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para as 3 tabelas
ALTER TABLE public.processos_mapeados_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telas_sistema_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos_instrucao_business ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura: dono do contrato ou admin/equipe
CREATE POLICY "Owner can read processos" ON public.processos_mapeados_business
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contratos_business cb
      WHERE cb.id = contrato_id AND cb.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'equipe')
  );

CREATE POLICY "Owner can read telas" ON public.telas_sistema_business
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contratos_business cb
      WHERE cb.id = contrato_id AND cb.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'equipe')
  );

CREATE POLICY "Owner can read videos instrucao" ON public.videos_instrucao_business
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contratos_business cb
      WHERE cb.id = contrato_id AND cb.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'equipe')
  );

-- Políticas de escrita: apenas admin
CREATE POLICY "Admin can manage processos" ON public.processos_mapeados_business
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage telas" ON public.telas_sistema_business
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage videos instrucao" ON public.videos_instrucao_business
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
