CREATE OR REPLACE FUNCTION public.calcular_prazo_sla(p_user_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  plano plano_mentoria;
  prazo TIMESTAMPTZ;
BEGIN
  SELECT plano_mentoria INTO plano
  FROM profiles
  WHERE id = p_user_id;
  
  -- Club: 24h | Lab/Boost/Legacy/Pro: 48h | Academy/Skills: 72h
  IF plano = 'club' THEN
    prazo := NOW() + INTERVAL '24 hours';
  ELSIF plano IN ('lab', 'boost', 'legacy', 'pro') THEN
    prazo := NOW() + INTERVAL '48 hours';
  ELSE
    prazo := NOW() + INTERVAL '72 hours';
  END IF;
  
  RETURN prazo;
END;
$function$;