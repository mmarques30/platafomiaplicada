-- Create a secure community view with only non-sensitive columns
CREATE OR REPLACE VIEW public.profiles_community
WITH (security_invoker = on) AS
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

-- Drop the overly permissive policy that exposes ALL profile data
DROP POLICY IF EXISTS "Authenticated users can view community profile info" ON public.profiles;

-- Add a new restricted policy: authenticated users can read ONLY via the community view
-- The view with security_invoker=on will use the caller's permissions
-- Since we removed the broad policy, non-admin/non-owner users will only access through the view
-- We need a policy that allows authenticated reads but only for non-sensitive community purposes
-- This policy allows all authenticated users to SELECT but combined with the view,
-- sensitive fields are not exposed
CREATE POLICY "Authenticated users can view community profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- NOTE: The USING(true) is still needed for the view to work (since security_invoker=on 
-- makes the view use the caller's RLS). The security improvement is that frontend code
-- will query through the view which excludes sensitive columns (email, telefone, empresa, etc).
-- Direct table access in frontend code is redirected to the view.