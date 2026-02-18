-- Drop the view and recreate WITHOUT security_invoker (so it bypasses base table RLS)
DROP VIEW IF EXISTS public.profiles_community;

CREATE VIEW public.profiles_community AS
  SELECT 
    id,
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
  FROM public.profiles;

-- Now remove the overly permissive policy on base table
DROP POLICY IF EXISTS "Authenticated users can view community profiles" ON public.profiles;

-- The remaining SELECT policies on profiles are:
-- 1. "Users can only view their own profile" - auth.uid() = id OR admin
-- 2. "Admins can view all profiles" - admin role
-- 3. "Equipe can view profiles" - equipe role
-- These are all properly scoped. No USING(true) remains.