-- Adicionar campos Business na tabela formulario_diagnostico
-- Mantém compatibilidade com formulários antigos

-- Step 1 (Perfil) - Existentes que faltam + Novos
ALTER TABLE public.formulario_diagnostico 
ADD COLUMN IF NOT EXISTS cargo_atual TEXT,
ADD COLUMN IF NOT EXISTS empresa_nome TEXT,
ADD COLUMN IF NOT EXISTS tem_equipe BOOLEAN,
ADD COLUMN IF NOT EXISTS como_conheceu_iaplicada TEXT,
ADD COLUMN IF NOT EXISTS desafio_principal_negocio TEXT;

-- Step 2 (Construir) - Existentes que faltam
ALTER TABLE public.formulario_diagnostico 
ADD COLUMN IF NOT EXISTS problema_principal TEXT,
ADD COLUMN IF NOT EXISTS processo_automatizar TEXT,
ADD COLUMN IF NOT EXISTS resultado_esperado TEXT,
ADD COLUMN IF NOT EXISTS ja_tentou_antes TEXT;

-- Step 3 (Impacto) - NOVOS campos estratégicos
ALTER TABLE public.formulario_diagnostico 
ADD COLUMN IF NOT EXISTS impacto_financeiro_estimado TEXT,
ADD COLUMN IF NOT EXISTS outras_areas_potencial TEXT,
ADD COLUMN IF NOT EXISTS kpi_principal TEXT,
ADD COLUMN IF NOT EXISTS orcamento_expansao TEXT,
ADD COLUMN IF NOT EXISTS urgencia_solucao TEXT,
ADD COLUMN IF NOT EXISTS sistemas_integrar JSONB,
ADD COLUMN IF NOT EXISTS outros_sistemas TEXT,
ADD COLUMN IF NOT EXISTS quem_vai_usar TEXT,
ADD COLUMN IF NOT EXISTS volume_uso TEXT;

-- Step 4 (Decisão) - NOVOS campos sobre stakeholders
ALTER TABLE public.formulario_diagnostico 
ADD COLUMN IF NOT EXISTS decisores_tecnologia TEXT,
ADD COLUMN IF NOT EXISTS decisor_especifico TEXT,
ADD COLUMN IF NOT EXISTS motivo_escolha_iaplicada TEXT,
ADD COLUMN IF NOT EXISTS experiencia_consultorias TEXT,
ADD COLUMN IF NOT EXISTS preferencia_acompanhamento TEXT,
ADD COLUMN IF NOT EXISTS nivel_envolvimento TEXT,
ADD COLUMN IF NOT EXISTS outros_decisores TEXT,
ADD COLUMN IF NOT EXISTS preferencia_comunicacao TEXT;

-- Step 5 (Expansão) - NOVOS campos de upsell
ALTER TABLE public.formulario_diagnostico 
ADD COLUMN IF NOT EXISTS interesse_alem_entrega JSONB,
ADD COLUMN IF NOT EXISTS areas_futuro_ia JSONB,
ADD COLUMN IF NOT EXISTS proximo_projeto_ia TEXT,
ADD COLUMN IF NOT EXISTS pessoas_para_capacitar_skills TEXT,
ADD COLUMN IF NOT EXISTS quer_aprender TEXT,
ADD COLUMN IF NOT EXISTS o_que_aprender TEXT,
ADD COLUMN IF NOT EXISTS equipe_precisa_aprender TEXT,
ADD COLUMN IF NOT EXISTS quantos_capacitar INTEGER,
ADD COLUMN IF NOT EXISTS disponibilidade_treinamento TEXT;

-- Step 6 (Sucesso) - NOVOS campos de retenção
ALTER TABLE public.formulario_diagnostico 
ADD COLUMN IF NOT EXISTS definicao_sucesso TEXT,
ADD COLUMN IF NOT EXISTS gatilho_renovacao TEXT,
ADD COLUMN IF NOT EXISTS importancia_projeto INTEGER,
ADD COLUMN IF NOT EXISTS agendar_call_alinhamento TEXT,
ADD COLUMN IF NOT EXISTS como_medir_sucesso TEXT,
ADD COLUMN IF NOT EXISTS maior_preocupacao TEXT,
ADD COLUMN IF NOT EXISTS nao_pode_acontecer TEXT;