
-- Expandir tabela diagnosticos_skills com campos do formulário expandido e resultados IA

-- Bloco 1-2: Sobre Você e Rotina
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS horas_repetitivas TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS atividade_principal TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS frequencia_atividade TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS tempo_gasto TEXT;

-- Bloco 3: Processos Detalhados
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS processos_detalhados JSONB DEFAULT '[]';

-- Bloco 4: Objetivos
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS objetivos_ia JSONB DEFAULT '[]';
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS resultado_sucesso TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS autonomia TEXT;

-- Bloco 5: Contexto Técnico
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS nivel_tecnico TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS ferramentas_automacao JSONB DEFAULT '[]';
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS uso_ia TEXT;

-- Bloco 6: Disponibilidade
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS horas_semana TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS melhor_horario JSONB DEFAULT '[]';
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS preferencia_conteudo TEXT;

-- Bloco 7: Empresa
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS tamanho_area TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS sistemas_erp JSONB DEFAULT '[]';
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS iniciativas_ia TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS maturidade_digital TEXT;

-- Bloco 8: Desafios
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS desafios JSONB DEFAULT '[]';
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS processo_colaborativo TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS automatizar_empresa TEXT;

-- Bloco 9: Contexto Organizacional
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS apoio_lideranca TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS restricoes_ti TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS objetivo_programa JSONB DEFAULT '[]';
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS areas_automacao JSONB DEFAULT '[]';

-- Bloco 10: Expectativas
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS resultado_equipe TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS projeto_colaborativo TEXT;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS barreiras TEXT;

-- Campos de Resultado IA
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS insight_ia JSONB;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS insight_gerado_em TIMESTAMPTZ;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS economia_horas_semana NUMERIC DEFAULT 0;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS economia_valor_mensal NUMERIC DEFAULT 0;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS trilha_sugerida JSONB;
ALTER TABLE public.diagnosticos_skills ADD COLUMN IF NOT EXISTS processos_analisados JSONB;
