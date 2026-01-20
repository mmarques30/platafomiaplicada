-- Criar tabela de entregas do Business (substitui projetos_mentoria para contexto Business)
CREATE TABLE public.entregas_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  modulo_relacionado TEXT,
  tipo TEXT DEFAULT 'ativa' CHECK (tipo IN ('ativa', 'backlog', 'futura')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  ordem INTEGER DEFAULT 0,
  prazo_previsto DATE,
  tem_instrucoes BOOLEAN DEFAULT false,
  justificativa_backlog TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de documentos do Business
CREATE TABLE public.documentos_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('proposta', 'transcricao', 'anexo', 'solucao', 'outro')),
  arquivo_url TEXT,
  conteudo_texto TEXT,
  processado BOOLEAN DEFAULT false,
  resultado_ia JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expandir instrucoes_etapa para vincular a entregas e ter recursos
ALTER TABLE public.instrucoes_etapa 
  ADD COLUMN IF NOT EXISTS entrega_id UUID REFERENCES public.entregas_business(id) ON DELETE CASCADE;

ALTER TABLE public.instrucoes_etapa 
  ADD COLUMN IF NOT EXISTS recursos JSONB DEFAULT '[]';

-- Expandir tarefas_mentoria para vincular a entregas e instruções
ALTER TABLE public.tarefas_mentoria 
  ADD COLUMN IF NOT EXISTS entrega_id UUID REFERENCES public.entregas_business(id) ON DELETE SET NULL;

ALTER TABLE public.tarefas_mentoria 
  ADD COLUMN IF NOT EXISTS instrucao_id UUID REFERENCES public.instrucoes_etapa(id) ON DELETE SET NULL;

-- Habilitar RLS
ALTER TABLE public.entregas_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_business ENABLE ROW LEVEL SECURITY;

-- Políticas para entregas_business
CREATE POLICY "Admins podem gerenciar todas as entregas" ON public.entregas_business
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Usuários podem ver suas próprias entregas" ON public.entregas_business
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contratos_business cb 
      WHERE cb.id = entregas_business.contrato_id 
      AND cb.user_id = auth.uid()
    )
  );

-- Políticas para documentos_business
CREATE POLICY "Admins podem gerenciar todos os documentos" ON public.documentos_business
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Usuários podem ver seus próprios documentos" ON public.documentos_business
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contratos_business cb 
      WHERE cb.id = documentos_business.contrato_id 
      AND cb.user_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_entregas_business_updated_at
  BEFORE UPDATE ON public.entregas_business
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_entregas_business_contrato ON public.entregas_business(contrato_id);
CREATE INDEX idx_entregas_business_tipo ON public.entregas_business(tipo);
CREATE INDEX idx_documentos_business_contrato ON public.documentos_business(contrato_id);
CREATE INDEX idx_tarefas_mentoria_entrega ON public.tarefas_mentoria(entrega_id);
CREATE INDEX idx_instrucoes_etapa_entrega ON public.instrucoes_etapa(entrega_id);