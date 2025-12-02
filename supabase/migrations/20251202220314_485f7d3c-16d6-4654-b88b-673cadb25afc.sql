-- Cria função RPC segura para retornar apenas dados públicos de perfil
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  nome_completo text,
  avatar_url text,
  bio text,
  nivel_comunidade integer,
  pontos_comunidade integer,
  ultimo_acesso timestamp with time zone,
  created_at timestamp with time zone,
  plano_mentoria plano_mentoria,
  conta_ativa boolean,
  is_visitante boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Remove a view pois usaremos a função RPC
DROP VIEW IF EXISTS public.public_profiles;