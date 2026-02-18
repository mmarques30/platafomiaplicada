
-- Fix historico_completo view
CREATE OR REPLACE VIEW public.historico_completo
WITH (security_invoker = true)
AS
SELECT a.created_at,
    a.tabela,
    a.operacao,
    a.registro_id,
    p.nome_completo AS usuario,
    a.campos_alterados,
    a.dados_anteriores,
    a.dados_novos
FROM auditoria_conteudo a
LEFT JOIN profiles p ON p.id = a.user_id
ORDER BY a.created_at DESC;

-- Fix ranking_dashboard view
CREATE OR REPLACE VIEW public.ranking_dashboard
WITH (security_invoker = true)
AS
SELECT p.id AS user_id,
    p.nome_completo,
    count(pv.id) FILTER (WHERE pv.completado = true) AS total_videos,
    count(pv.id) FILTER (WHERE pv.completado = true AND pv.created_at >= (now() - '24:00:00'::interval)) AS videos_24h,
    count(pv.id) FILTER (WHERE pv.completado = true AND pv.created_at >= (now() - '48:00:00'::interval) AND pv.created_at < (now() - '24:00:00'::interval)) AS videos_24h_anterior
FROM profiles p
LEFT JOIN progresso_videos pv ON p.id = pv.user_id
WHERE p.is_visitante = false
GROUP BY p.id, p.nome_completo
ORDER BY count(pv.id) FILTER (WHERE pv.completado = true) DESC;

-- Fix profiles_community view
CREATE OR REPLACE VIEW public.profiles_community
WITH (security_invoker = true)
AS
SELECT id,
    nome_completo,
    avatar_url,
    bio,
    nivel_comunidade,
    pontos_comunidade,
    plano_mentoria,
    is_visitante,
    conta_ativa,
    ultimo_acesso,
    created_at,
    linkedin
FROM profiles;
