-- Criar função RPC para estatísticas de trilhas
CREATE OR REPLACE FUNCTION get_trilhas_stats()
RETURNS TABLE (
  trilha_id UUID,
  total_modulos BIGINT,
  total_videos BIGINT,
  total_materiais BIGINT
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id as trilha_id,
    COUNT(DISTINCT m.id) as total_modulos,
    COUNT(DISTINCT v.id) as total_videos,
    COALESCE(SUM(jsonb_array_length(COALESCE(v.materiais, '[]'::jsonb))), 0) as total_materiais
  FROM trilhas t
  LEFT JOIN modulos m ON m.trilha_id = t.id
  LEFT JOIN videos v ON v.modulo_id = m.id
  GROUP BY t.id;
$$;

-- Criar função RPC para estatísticas de módulos
CREATE OR REPLACE FUNCTION get_modulos_stats()
RETURNS TABLE (
  modulo_id UUID,
  total_videos BIGINT,
  total_materiais BIGINT
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id as modulo_id,
    COUNT(DISTINCT v.id) as total_videos,
    COALESCE(SUM(jsonb_array_length(COALESCE(v.materiais, '[]'::jsonb))), 0) as total_materiais
  FROM modulos m
  LEFT JOIN videos v ON v.modulo_id = m.id
  GROUP BY m.id;
$$;