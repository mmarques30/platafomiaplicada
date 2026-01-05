-- View pública para ranking do dashboard (bypass RLS)
CREATE OR REPLACE VIEW public.ranking_dashboard AS
SELECT 
  p.id as user_id,
  p.nome_completo,
  COUNT(pv.id) FILTER (WHERE pv.completado = true) as total_videos,
  COUNT(pv.id) FILTER (WHERE pv.completado = true AND pv.created_at >= NOW() - INTERVAL '24 hours') as videos_24h,
  COUNT(pv.id) FILTER (WHERE pv.completado = true AND pv.created_at >= NOW() - INTERVAL '48 hours' AND pv.created_at < NOW() - INTERVAL '24 hours') as videos_24h_anterior
FROM profiles p
LEFT JOIN progresso_videos pv ON p.id = pv.user_id
WHERE p.is_visitante = false
GROUP BY p.id, p.nome_completo
ORDER BY total_videos DESC;