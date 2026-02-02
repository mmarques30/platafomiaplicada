-- 1. Atualizar função check_visitor_engagement com nova regra (10+ conteúdos)
CREATE OR REPLACE FUNCTION public.check_visitor_engagement(visitor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_acessos INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO total_acessos
  FROM content_access_logs cal
  JOIN profiles p ON cal.user_email = p.email
  WHERE p.id = visitor_id;
    
  RETURN COALESCE(total_acessos, 0) >= 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Atualizar visitantes existentes que já têm 10+ acessos para Academy15
UPDATE public.profiles p
SET cupom_especial = 'Academy15'
WHERE p.is_visitante = true
  AND (
    SELECT COUNT(*)
    FROM content_access_logs cal
    WHERE cal.user_email = p.email
  ) >= 10;

-- 3. Atualizar descrição do cupom Academy15
UPDATE public.cupons_visitantes
SET descricao = 'Cupom para visitantes engajados (consumiram +10 conteúdos)'
WHERE codigo = 'Academy15';