
-- Update calcular_prazo_sla function
CREATE OR REPLACE FUNCTION public.calcular_prazo_sla(p_user_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE plano plano_mentoria; prazo TIMESTAMPTZ;
BEGIN
  SELECT plano_mentoria INTO plano FROM profiles WHERE id = p_user_id;
  IF plano IN ('business_parceria', 'business_sistemas') THEN prazo := NOW() + INTERVAL '24 hours';
  ELSIF plano = 'skills' THEN prazo := NOW() + INTERVAL '48 hours';
  ELSE prazo := NOW() + INTERVAL '72 hours'; END IF;
  RETURN prazo;
END; $function$;

-- Update user_has_access_level function
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan FROM profiles WHERE id = auth.uid();
  IF user_plan IS NULL THEN RETURN false; END IF;
  CASE required_level
    WHEN 'academy' THEN RETURN user_plan IN ('academy', 'skills', 'business_parceria', 'business_sistemas');
    WHEN 'skills' THEN RETURN user_plan IN ('skills', 'business_parceria', 'business_sistemas');
    WHEN 'business' THEN RETURN user_plan IN ('business_parceria', 'business_sistemas');
    ELSE RETURN false;
  END CASE;
END;
$function$;
