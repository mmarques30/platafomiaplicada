-- Remove a política problemática que expõe todos os dados pessoais
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;

-- Mantém apenas as políticas seguras:
-- 1. Usuários veem apenas seu próprio perfil
-- 2. Admins podem ver todos os perfis
-- As funções RPC get_public_profiles e get_ranking_engajamento
-- continuam funcionando por serem SECURITY DEFINER

-- Adiciona comentário explicativo
COMMENT ON FUNCTION public.get_public_profiles IS 'Retorna apenas dados públicos dos perfis (nome, avatar, bio, nível comunidade). Usado para funcionalidades de comunidade sem expor dados sensíveis como email, telefone, linkedin.';