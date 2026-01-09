-- Corrigir default de visivel_gratuitos para false
ALTER TABLE public.conteudos_dashboard 
ALTER COLUMN visivel_gratuitos SET DEFAULT false;

-- Comentário documentando os tipos válidos
COMMENT ON COLUMN public.conteudos_dashboard.tipo IS 'Tipos válidos: newsletter, noticia, dica, material';

-- Função segura para métricas do ticker gratuito (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_gratuito_stats()
RETURNS TABLE(
  total_visitantes bigint,
  online_visitantes bigint,
  total_conteudos_gratuitos bigint,
  total_materiais_gratuitos bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    -- Total de visitantes ativos
    (SELECT COUNT(*) FROM profiles WHERE is_visitante = true AND conta_ativa = true) as total_visitantes,
    -- Visitantes online (último acesso nos últimos 5 minutos)
    (SELECT COUNT(*) FROM profiles WHERE is_visitante = true AND conta_ativa = true AND ultimo_acesso > NOW() - INTERVAL '5 minutes') as online_visitantes,
    -- Total de conteúdos gratuitos
    (SELECT COUNT(*) FROM conteudos_dashboard WHERE ativo = true AND visivel_gratuitos = true) as total_conteudos_gratuitos,
    -- Total de materiais gratuitos
    (SELECT COUNT(*) FROM conteudos_dashboard WHERE ativo = true AND visivel_gratuitos = true AND tipo = 'material') as total_materiais_gratuitos;
$$;