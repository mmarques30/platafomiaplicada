-- Adicionar colunas em equipes_skills para suportar painel do líder
ALTER TABLE public.equipes_skills 
ADD COLUMN IF NOT EXISTS investimento numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_hora_padrao numeric DEFAULT 60;

-- Adicionar colunas em entregas_skills para métricas e avaliação
ALTER TABLE public.entregas_skills 
ADD COLUMN IF NOT EXISTS economia_horas_semana numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS avaliacao_nota numeric,
ADD COLUMN IF NOT EXISTS avaliacao_comentario text,
ADD COLUMN IF NOT EXISTS concluido_em timestamptz,
ADD COLUMN IF NOT EXISTS progresso integer DEFAULT 0;

-- Adicionar coluna em metricas_skills para índice de maturidade
ALTER TABLE public.metricas_skills 
ADD COLUMN IF NOT EXISTS indice_maturidade numeric DEFAULT 0;