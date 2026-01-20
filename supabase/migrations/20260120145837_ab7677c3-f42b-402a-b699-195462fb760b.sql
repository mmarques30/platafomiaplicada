-- Expand contratos_business with detailed proposal fields
ALTER TABLE contratos_business
  ADD COLUMN IF NOT EXISTS setor_atuacao TEXT,
  ADD COLUMN IF NOT EXISTS nome_empresa TEXT,
  ADD COLUMN IF NOT EXISTS contexto_transformacao TEXT,
  ADD COLUMN IF NOT EXISTS dores_mapeadas JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS desafios_operacionais JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS desafios_estrategicos JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS solucao_proposta JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS fases_projeto JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS metricas_performance JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS proximos_passos JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS garantias JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cases_referencia TEXT;

-- Create tasks_business table for validation/approval items
CREATE TABLE tasks_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos_business(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('validacao', 'aprovacao', 'revisao', 'homologacao', 'assinatura', 'feedback')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado', 'revisao_solicitada')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  prazo DATE,
  entrega_id UUID REFERENCES entregas_business(id) ON DELETE SET NULL,
  etapa_id UUID REFERENCES etapas_business(id) ON DELETE SET NULL,
  
  -- Resources attached by admin
  documento_url TEXT,
  link_referencia TEXT,
  instrucoes_validacao TEXT,
  
  -- Mentee response
  resposta_mentorado TEXT,
  data_resposta TIMESTAMPTZ,
  arquivo_resposta_url TEXT,
  
  -- Control
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks_business ENABLE ROW LEVEL SECURITY;

-- Policies for tasks_business
CREATE POLICY "Admins can manage all tasks" ON tasks_business
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'equipe'))
  );

CREATE POLICY "Users can view their own tasks" ON tasks_business
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON tasks_business
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_tasks_business_updated_at
  BEFORE UPDATE ON tasks_business
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();