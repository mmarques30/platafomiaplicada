-- Remove a política permissiva que permite leitura pública
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;

-- Cria nova política que só permite usuários AUTENTICADOS verem perfis
-- Isso é necessário para funcionalidades de comunidade (ranking, posts, membros)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Nota: Usuários não autenticados NÃO podem mais ver nenhum dado de perfil