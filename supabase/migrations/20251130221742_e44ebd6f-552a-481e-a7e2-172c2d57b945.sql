-- Corrigir função get_ranking_engajamento para resolver ambiguidade de user_id
DROP FUNCTION IF EXISTS get_ranking_engajamento();

CREATE OR REPLACE FUNCTION public.get_ranking_engajamento()
RETURNS TABLE(
  user_id uuid,
  nome_completo text,
  avatar_url text,
  total_pontos integer,
  posicao integer,
  total_posts bigint,
  total_comentarios bigint,
  total_likes_dados bigint,
  total_likes_recebidos bigint,
  total_videos_assistidos bigint,
  dias_ativos_30d bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as uid,
      p.nome_completo,
      p.avatar_url,
      
      -- Posts criados
      COALESCE((SELECT COUNT(*) FROM community_posts cp 
                WHERE cp.user_id = p.id), 0) as posts,
      
      -- Comentários
      COALESCE((SELECT COUNT(*) FROM community_comments cc 
                WHERE cc.user_id = p.id), 0) as comentarios,
      
      -- Likes dados
      COALESCE((SELECT COUNT(*) FROM community_reactions cr 
                WHERE cr.user_id = p.id), 0) as likes_dados,
      
      -- Likes recebidos (corrigido para qualificar user_id)
      COALESCE((SELECT COUNT(*) 
                FROM community_reactions cr
                JOIN community_posts cp ON cr.post_id = cp.id
                WHERE cp.user_id = p.id), 0) as likes_recebidos,
      
      -- Vídeos assistidos
      COALESCE((SELECT COUNT(*) FROM progresso_videos pv 
                WHERE pv.user_id = p.id AND pv.completado = true), 0) as videos,
      
      -- Dias ativos nos últimos 30 dias (pelo menos 1 ação)
      COALESCE((
        SELECT COUNT(DISTINCT DATE(created_at))
        FROM (
          SELECT created_at FROM community_posts WHERE community_posts.user_id = p.id AND created_at > NOW() - INTERVAL '30 days'
          UNION ALL
          SELECT created_at FROM community_comments WHERE community_comments.user_id = p.id AND created_at > NOW() - INTERVAL '30 days'
          UNION ALL
          SELECT created_at FROM community_reactions WHERE community_reactions.user_id = p.id AND created_at > NOW() - INTERVAL '30 days'
        ) as atividades
      ), 0) as dias_ativos
      
    FROM profiles p
    WHERE p.conta_ativa = true
  )
  SELECT 
    us.uid as user_id,
    us.nome_completo,
    us.avatar_url,
    (
      (us.posts * 20) + 
      (us.comentarios * 5) + 
      (us.likes_dados * 2) + 
      (us.likes_recebidos * 10) + 
      (us.videos * 3) + 
      (us.dias_ativos * 1)
    )::INTEGER as total_pontos,
    ROW_NUMBER() OVER (ORDER BY 
      (
        (us.posts * 20) + 
        (us.comentarios * 5) + 
        (us.likes_dados * 2) + 
        (us.likes_recebidos * 10) + 
        (us.videos * 3) + 
        (us.dias_ativos * 1)
      ) DESC
    )::INTEGER as posicao,
    us.posts as total_posts,
    us.comentarios as total_comentarios,
    us.likes_dados as total_likes_dados,
    us.likes_recebidos as total_likes_recebidos,
    us.videos as total_videos_assistidos,
    us.dias_ativos as dias_ativos_30d
  FROM user_stats us
  ORDER BY total_pontos DESC;
END;
$function$;