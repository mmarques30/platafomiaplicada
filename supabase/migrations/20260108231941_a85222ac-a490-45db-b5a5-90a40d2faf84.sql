-- Permitir usuários autenticados verem profiles de outros membros da comunidade
-- Isso é necessário para exibir nome/avatar dos autores de posts no feed
CREATE POLICY "Authenticated users can view public profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);