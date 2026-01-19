-- Tabela de etapas do Business
CREATE TABLE public.etapas_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  numero_etapa INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  objetivo TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  data_prevista DATE,
  data_conclusao TIMESTAMPTZ,
  marcos_proxima_etapa TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contrato_id, numero_etapa)
);

-- Tabela de instruções por etapa
CREATE TABLE public.instrucoes_etapa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id UUID REFERENCES public.etapas_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel TEXT NOT NULL CHECK (responsavel IN ('voce', 'mentor', 'conjunto')),
  ferramenta TEXT CHECK (ferramenta IN ('claude', 'lovable', 'reuniao', 'outro')),
  ordem INTEGER DEFAULT 0,
  prompt_sugerido TEXT,
  dicas TEXT,
  recursos_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  gerado_por_ia BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar etapa_id às tarefas existentes
ALTER TABLE public.tarefas_mentoria 
  ADD COLUMN IF NOT EXISTS etapa_id UUID REFERENCES public.etapas_business(id);

-- Enable RLS
ALTER TABLE public.etapas_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instrucoes_etapa ENABLE ROW LEVEL SECURITY;

-- Políticas para etapas_business
CREATE POLICY "Admins podem gerenciar etapas" ON public.etapas_business
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'equipe'))
  );

CREATE POLICY "Usuarios podem ver suas etapas" ON public.etapas_business
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contratos_business 
      WHERE id = contrato_id AND user_id = auth.uid()
    )
  );

-- Políticas para instrucoes_etapa
CREATE POLICY "Admins podem gerenciar instrucoes" ON public.instrucoes_etapa
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'equipe'))
  );

CREATE POLICY "Usuarios podem ver instrucoes de suas etapas" ON public.instrucoes_etapa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.etapas_business eb
      JOIN public.contratos_business cb ON eb.contrato_id = cb.id
      WHERE eb.id = etapa_id AND cb.user_id = auth.uid()
    )
  );

-- Usuarios podem atualizar status das suas instrucoes
CREATE POLICY "Usuarios podem atualizar status instrucoes" ON public.instrucoes_etapa
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.etapas_business eb
      JOIN public.contratos_business cb ON eb.contrato_id = cb.id
      WHERE eb.id = etapa_id AND cb.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.etapas_business eb
      JOIN public.contratos_business cb ON eb.contrato_id = cb.id
      WHERE eb.id = etapa_id AND cb.user_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_etapas_business_updated_at
  BEFORE UPDATE ON public.etapas_business
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_etapas_business_contrato ON public.etapas_business(contrato_id);
CREATE INDEX idx_instrucoes_etapa_etapa ON public.instrucoes_etapa(etapa_id);
CREATE INDEX idx_tarefas_mentoria_etapa ON public.tarefas_mentoria(etapa_id);