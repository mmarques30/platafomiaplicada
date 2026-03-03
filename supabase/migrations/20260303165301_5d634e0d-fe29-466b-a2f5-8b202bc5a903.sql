
-- === DROP ALL DEPENDENT OBJECTS ===
DROP POLICY IF EXISTS "Users can view their bonuses or global bonuses" ON public.bonus_mentoria;
DROP POLICY IF EXISTS "Trilhas visibility by user type and level" ON public.trilhas;
DROP POLICY IF EXISTS "Users and visitors can view active modulos" ON public.modulos;
DROP POLICY IF EXISTS "Users and visitors can view active videos" ON public.videos;
DROP VIEW IF EXISTS public.profiles_community;
DROP FUNCTION IF EXISTS public.get_public_profiles();
DROP FUNCTION IF EXISTS public.user_has_access_level(nivel_acesso_plano);
DROP FUNCTION IF EXISTS public.calcular_prazo_sla(uuid);

-- === PLANO_MENTORIA ENUM ===
ALTER TYPE public.plano_mentoria RENAME TO plano_mentoria_old;
CREATE TYPE public.plano_mentoria AS ENUM ('academy', 'skills', 'business', 'business_iaplicada');
ALTER TABLE public.profiles 
  ALTER COLUMN plano_mentoria TYPE public.plano_mentoria 
  USING plano_mentoria::text::public.plano_mentoria;
DROP TYPE public.plano_mentoria_old CASCADE;

-- === NIVEL_ACESSO_PLANO ENUM ===
ALTER TABLE public.trilhas ALTER COLUMN nivel_minimo_acesso DROP DEFAULT;
ALTER TABLE public.modulos ALTER COLUMN nivel_minimo_acesso DROP DEFAULT;
ALTER TABLE public.videos ALTER COLUMN nivel_minimo_acesso DROP DEFAULT;

ALTER TYPE public.nivel_acesso_plano RENAME TO nivel_acesso_plano_old;
CREATE TYPE public.nivel_acesso_plano AS ENUM ('academy', 'skills', 'business');

ALTER TABLE public.trilhas ALTER COLUMN nivel_minimo_acesso TYPE public.nivel_acesso_plano USING nivel_minimo_acesso::text::public.nivel_acesso_plano;
ALTER TABLE public.modulos ALTER COLUMN nivel_minimo_acesso TYPE public.nivel_acesso_plano USING nivel_minimo_acesso::text::public.nivel_acesso_plano;
ALTER TABLE public.videos ALTER COLUMN nivel_minimo_acesso TYPE public.nivel_acesso_plano USING nivel_minimo_acesso::text::public.nivel_acesso_plano;

ALTER TABLE public.trilhas ALTER COLUMN nivel_minimo_acesso SET DEFAULT 'academy'::nivel_acesso_plano;
ALTER TABLE public.modulos ALTER COLUMN nivel_minimo_acesso SET DEFAULT 'academy'::nivel_acesso_plano;
ALTER TABLE public.videos ALTER COLUMN nivel_minimo_acesso SET DEFAULT 'academy'::nivel_acesso_plano;

DROP TYPE public.nivel_acesso_plano_old CASCADE;

-- === RECREATE FUNCTIONS FIRST ===
CREATE OR REPLACE FUNCTION public.calcular_prazo_sla(p_user_id uuid)
 RETURNS timestamp with time zone LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE plano plano_mentoria; prazo TIMESTAMPTZ;
BEGIN
  SELECT plano_mentoria INTO plano FROM profiles WHERE id = p_user_id;
  IF plano IN ('business', 'business_iaplicada') THEN prazo := NOW() + INTERVAL '24 hours';
  ELSIF plano = 'skills' THEN prazo := NOW() + INTERVAL '48 hours';
  ELSE prazo := NOW() + INTERVAL '72 hours'; END IF;
  RETURN prazo;
END; $function$;

CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
 RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan FROM profiles WHERE id = auth.uid();
  IF user_plan IS NULL THEN RETURN false; END IF;
  CASE required_level
    WHEN 'academy' THEN RETURN user_plan IN ('academy', 'skills', 'business', 'business_iaplicada');
    WHEN 'skills' THEN RETURN user_plan = 'skills';
    WHEN 'business' THEN RETURN user_plan IN ('business', 'business_iaplicada');
    ELSE RETURN false;
  END CASE;
END; $function$;

CREATE OR REPLACE FUNCTION public.get_public_profiles()
 RETURNS TABLE(id uuid, nome_completo text, avatar_url text, bio text, nivel_comunidade integer, pontos_comunidade integer, ultimo_acesso timestamp with time zone, created_at timestamp with time zone, plano_mentoria plano_mentoria, conta_ativa boolean, is_visitante boolean)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT id, nome_completo, avatar_url, bio, nivel_comunidade, pontos_comunidade,
    ultimo_acesso, created_at, plano_mentoria, conta_ativa, is_visitante
  FROM public.profiles WHERE conta_ativa = true;
$function$;

-- === RECREATE VIEW ===
CREATE VIEW public.profiles_community AS
  SELECT id, nome_completo, avatar_url, bio, nivel_comunidade, pontos_comunidade,
    plano_mentoria, is_visitante, conta_ativa, ultimo_acesso, created_at, linkedin
  FROM profiles;

-- === RECREATE ALL POLICIES ===
CREATE POLICY "Users can view their bonuses or global bonuses" ON public.bonus_mentoria
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id) OR (
      publico_alvo = 'todos'
      OR (publico_alvo = 'academy' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.plano_mentoria = 'academy'))
      OR (publico_alvo = 'skills' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.plano_mentoria = 'skills'))
      OR (publico_alvo = 'business' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.plano_mentoria IN ('business', 'business_iaplicada')))
    )
  );

CREATE POLICY "Trilhas visibility by user type and level" ON public.trilhas
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'visitante'::app_role)
    OR (ativo = true AND (visivel_mentorados = true OR bloqueada = true)
        AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role))
        AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
  );

CREATE POLICY "Users and visitors can view active modulos" ON public.modulos
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (visivel_visitantes = true AND has_role(auth.uid(), 'visitante'::app_role))
    OR (ativo = true AND visivel_mentorados = true
        AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role))
        AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
  );

CREATE POLICY "Users and visitors can view active videos" ON public.videos
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (visivel_visitantes = true AND has_role(auth.uid(), 'visitante'::app_role))
    OR (ativo = true AND visivel_mentorados = true
        AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role))
        AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
  );
