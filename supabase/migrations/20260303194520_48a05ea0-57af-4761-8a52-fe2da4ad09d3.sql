
-- =============================================
-- 1. RLS policies for password_reset_tokens
-- =============================================
CREATE POLICY "Service role manages tokens"
ON public.password_reset_tokens
FOR ALL
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- Allow users to read their own token (for verification flow)
CREATE POLICY "Users can read own tokens"
ON public.password_reset_tokens
FOR SELECT
USING (user_id = auth.uid());

-- =============================================
-- 2. Rate limiting trigger for password_reset_requests
-- =============================================
CREATE OR REPLACE FUNCTION public.throttle_password_reset()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM password_reset_requests
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '15 minutes';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Muitas solicitações de reset. Tente novamente em 15 minutos.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_reset_throttle
BEFORE INSERT ON public.password_reset_requests
FOR EACH ROW
EXECUTE FUNCTION public.throttle_password_reset();

-- =============================================
-- 3. Convert SECURITY DEFINER views to SECURITY INVOKER
-- =============================================

-- 3a. historico_completo → restrict to admins via SECURITY INVOKER
DROP VIEW IF EXISTS public.historico_completo;
CREATE VIEW public.historico_completo
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

-- 3b. ranking_dashboard → SECURITY INVOKER
DROP VIEW IF EXISTS public.ranking_dashboard;
CREATE VIEW public.ranking_dashboard
WITH (security_invoker = true)
AS
SELECT p.id AS user_id,
    p.nome_completo,
    count(pv.id) FILTER (WHERE pv.completado = true) AS total_videos,
    count(pv.id) FILTER (WHERE pv.completado = true AND pv.created_at >= (now() - interval '24 hours')) AS videos_24h,
    count(pv.id) FILTER (WHERE pv.completado = true AND pv.created_at >= (now() - interval '48 hours') AND pv.created_at < (now() - interval '24 hours')) AS videos_24h_anterior
FROM profiles p
LEFT JOIN progresso_videos pv ON p.id = pv.user_id
WHERE p.is_visitante = false
GROUP BY p.id, p.nome_completo
ORDER BY count(pv.id) FILTER (WHERE pv.completado = true) DESC;

-- 3c. profiles_community → SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_community;
CREATE VIEW public.profiles_community
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

-- =============================================
-- 4. Fix user_has_access_level hierarchy (business includes skills)
-- =============================================
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan FROM profiles WHERE id = auth.uid();
  IF user_plan IS NULL THEN RETURN false; END IF;
  CASE required_level
    WHEN 'academy' THEN RETURN user_plan IN ('academy', 'skills', 'business', 'business_iaplicada');
    WHEN 'skills' THEN RETURN user_plan IN ('skills', 'business', 'business_iaplicada');
    WHEN 'business' THEN RETURN user_plan IN ('business', 'business_iaplicada');
    ELSE RETURN false;
  END CASE;
END;
$$;

-- =============================================
-- 5. Fix inicializar_fases_processo — remove "Club IAplicada" reference
-- =============================================
CREATE OR REPLACE FUNCTION public.inicializar_fases_processo(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
  VALUES (p_user_id, 1, 'Diagnóstico', 'Chamada inicial de alinhamento e mapeamento de necessidades')
  ON CONFLICT (user_id, fase_numero) DO NOTHING;

  INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
  VALUES (p_user_id, 2, 'Onboarding', 'Sessão de 120min para co-criação dos 6 projetos e definição do roadmap personalizado')
  ON CONFLICT (user_id, fase_numero) DO NOTHING;

  FOR i IN 3..8 LOOP
    INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
    VALUES (p_user_id, i, 'Projeto ' || (i-2), 'Sessão de execução (90min) + tarefas e entregas')
    ON CONFLICT (user_id, fase_numero) DO NOTHING;
  END LOOP;

  INSERT INTO fases_processo_mentoria (user_id, fase_numero, nome_fase, descricao)
  VALUES (p_user_id, 9, 'Acesso Estendido', '12 meses de acesso à plataforma e comunidade IAplicada')
  ON CONFLICT (user_id, fase_numero) DO NOTHING;
END;
$$;
