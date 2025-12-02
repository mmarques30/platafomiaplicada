-- Remove a política permissiva que expõe todos os dados
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Cria uma view pública com apenas dados não-sensíveis para funcionalidades de comunidade
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Adiciona comentário explicando o propósito da view
COMMENT ON VIEW public.public_profiles IS 'View com dados públicos de perfil para funcionalidades de comunidade. Exclui dados sensíveis como email, telefone, linkedin.';

-- Habilita RLS na view (necessário para controle de acesso)
-- Views herdam as políticas da tabela base, mas podemos controlar via grant
GRANT SELECT ON public.public_profiles TO authenticated;

-- Garante que apenas usuários autenticados podem ver a view
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;