
DROP FUNCTION IF EXISTS public.get_ranking_engajamento();

CREATE OR REPLACE FUNCTION public.get_ranking_engajamento()
 RETURNS TABLE(user_id uuid, nome_completo text, avatar_url text, total_pontos integer, posicao integer, total_videos_assistidos bigint, total_materiais_baixados bigint, total_aulas_presentes bigint, total_videos_reassistidos bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as uid, p.nome_completo, p.avatar_url,
      COALESCE((SELECT COUNT(DISTINCT cal.content_id) 
                FROM content_access_logs cal 
                WHERE cal.user_email = p.email 
                AND cal.content_type = 'video'), 0) as videos,
      COALESCE((SELECT COUNT(*) - COUNT(DISTINCT cal.content_id) 
                FROM content_access_logs cal 
                WHERE cal.user_email = p.email 
                AND cal.content_type = 'video'), 0) as reassistidos,
      COALESCE((SELECT COUNT(DISTINCT cal.content_id) 
                FROM content_access_logs cal 
                WHERE cal.user_email = p.email 
                AND cal.content_type = 'material'), 0) as materiais,
      0::BIGINT as aulas
    FROM profiles p
    WHERE p.conta_ativa = true
      AND p.is_visitante = true
  )
  SELECT 
    us.uid, us.nome_completo, us.avatar_url,
    ((us.videos * 10) + (us.materiais * 5) + (us.aulas * 25))::INTEGER as total_pontos,
    ROW_NUMBER() OVER (ORDER BY 
      ((us.videos * 10) + (us.materiais * 5) + (us.aulas * 25)) DESC
    )::INTEGER as posicao,
    us.videos, us.materiais, us.aulas, us.reassistidos
  FROM user_stats us
  ORDER BY total_pontos DESC;
END;
$function$;
