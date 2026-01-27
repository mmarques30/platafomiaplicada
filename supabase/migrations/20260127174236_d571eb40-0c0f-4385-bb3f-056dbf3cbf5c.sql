
-- Remover a política duplicada e recriar apenas as que faltam
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Equipe can view profiles" ON public.profiles;

-- Política 2: Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Política 3: Equipe autorizada pode ver perfis
CREATE POLICY "Equipe can view profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'equipe'));
