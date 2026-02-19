DROP FUNCTION IF EXISTS public.get_gratuito_stats();

CREATE OR REPLACE FUNCTION public.get_gratuito_stats()
RETURNS TABLE(
  total_visitantes bigint,
  online_visitantes bigint,
  total_conteudos_gratuitos bigint,
  total_materiais_gratuitos bigint,
  total_videos_assistidos bigint,
  total_materiais_baixados bigint
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles
     WHERE is_visitante = true AND conta_ativa = true),
    (SELECT COUNT(*) FROM profiles
     WHERE is_visitante = true AND conta_ativa = true
     AND ultimo_acesso > NOW() - INTERVAL '5 minutes'),
    (SELECT COUNT(*) FROM conteudos_dashboard
     WHERE ativo = true AND visivel_gratuitos = true),
    (SELECT COUNT(*) FROM conteudos_dashboard
     WHERE ativo = true AND visivel_gratuitos = true
     AND tipo = 'material'),
    (SELECT COUNT(*) FROM content_access_logs cal
     JOIN profiles p ON cal.user_email = p.email
     WHERE p.is_visitante = true AND cal.content_type = 'video'),
    (SELECT COUNT(*) FROM content_access_logs cal
     JOIN profiles p ON cal.user_email = p.email
     WHERE p.is_visitante = true AND cal.content_type = 'material');
$$;