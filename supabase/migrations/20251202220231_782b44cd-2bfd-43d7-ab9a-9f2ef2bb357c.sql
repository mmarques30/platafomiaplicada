-- Recria a view com security_invoker=true para respeitar RLS do usuário
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker=true) AS
SELECT 
  id,
  nome_completo,
  avatar_url,
  bio,
  nivel_comunidade,
  pontos_comunidade,
  ultimo_acesso,
  created_at,
  plano_mentoria,
  conta_ativa,
  is_visitante
FROM public.profiles
WHERE conta_ativa = true;

-- Mantém os grants
GRANT SELECT ON public.public_profiles TO authenticated;
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;