-- Criar tabela de fases do processo de mentoria
CREATE TABLE IF NOT EXISTS fases_processo_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fase_numero INTEGER NOT NULL CHECK (fase_numero >= 1 AND fase_numero <= 9),
  nome_fase TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'bloqueada')),
  data_inicio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  projeto_associado_id UUID REFERENCES projetos_mentoria(id) ON DELETE SET NULL,
  sessao_associada_id UUID REFERENCES sessoes_mentoria(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fase_numero)
);

-- Enable RLS
ALTER TABLE fases_processo_mentoria ENABLE ROW LEVEL SECURITY;

-- Admins can manage all fases
CREATE POLICY "Admins can manage all fases"
ON fases_processo_mentoria
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own fases
CREATE POLICY "Users can view own fases"
ON fases_processo_mentoria
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_fases_processo_updated_at
BEFORE UPDATE ON fases_processo_mentoria
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Função para inicializar fases padrão
CREATE OR REPLACE FUNCTION inicializar_fases_processo(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Fase 1: Diagnóstico
  INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
  VALUES (p_user_id, 1, 'Diagnóstico', 'Chamada inicial de alinhamento e mapeamento de necessidades')
  ON CONFLICT (user_id, fase_numero) DO NOTHING;
  
  -- Fase 2: Onboarding
  INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
  VALUES (p_user_id, 2, 'Onboarding', 'Sessão de 120min para co-criação dos 6 projetos e definição do roadmap personalizado')
  ON CONFLICT (user_id, fase_numero) DO NOTHING;
  
  -- Fases 3-8: Projetos
  FOR i IN 3..8 LOOP
    INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
    VALUES (p_user_id, i, 'Projeto ' || (i-2), 'Sessão de execução (90min) + tarefas e entregas')
    ON CONFLICT (user_id, fase_numero) DO NOTHING;
  END LOOP;
  
  -- Fase 9: Acesso Estendido
  INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
  VALUES (p_user_id, 9, 'Acesso Estendido', '12 meses de acesso à plataforma e Club IAplicada')
  ON CONFLICT (user_id, fase_numero) DO NOTHING;
END;
$$;