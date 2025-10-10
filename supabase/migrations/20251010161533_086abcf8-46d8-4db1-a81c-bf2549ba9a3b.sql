-- 1. Corrigir materiais existentes que foram salvos como string JSON
UPDATE public.videos
SET materiais = 
  CASE 
    WHEN jsonb_typeof(materiais) = 'string' 
    THEN (materiais::text)::jsonb
    ELSE materiais
  END
WHERE materiais IS NOT NULL;

-- 2. Drop e recriar função get_trilhas_stats com nova coluna
DROP FUNCTION IF EXISTS public.get_trilhas_stats();

CREATE FUNCTION public.get_trilhas_stats()
RETURNS TABLE(trilha_id uuid, total_modulos bigint, total_videos bigint, total_materiais bigint, total_exercicios bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    t.id as trilha_id,
    COUNT(DISTINCT m.id) as total_modulos,
    COUNT(DISTINCT v.id) as total_videos,
    COALESCE(SUM(jsonb_array_length(COALESCE(v.materiais, '[]'::jsonb))), 0) as total_materiais,
    COALESCE(COUNT(DISTINCT e.id), 0) as total_exercicios
  FROM trilhas t
  LEFT JOIN modulos m ON m.trilha_id = t.id
  LEFT JOIN videos v ON v.modulo_id = m.id
  LEFT JOIN exercicios_praticos e ON e.video_id = v.id AND e.ativo = true
  GROUP BY t.id;
$function$;

-- 3. Drop e recriar função get_modulos_stats com nova coluna
DROP FUNCTION IF EXISTS public.get_modulos_stats();

CREATE FUNCTION public.get_modulos_stats()
RETURNS TABLE(modulo_id uuid, total_videos bigint, total_materiais bigint, total_exercicios bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    m.id as modulo_id,
    COUNT(DISTINCT v.id) as total_videos,
    COALESCE(SUM(jsonb_array_length(COALESCE(v.materiais, '[]'::jsonb))), 0) as total_materiais,
    COALESCE(COUNT(DISTINCT e.id), 0) as total_exercicios
  FROM modulos m
  LEFT JOIN videos v ON v.modulo_id = m.id
  LEFT JOIN exercicios_praticos e ON e.video_id = v.id AND e.ativo = true
  GROUP BY m.id;
$function$;