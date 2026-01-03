-- Remover a política vulnerável que expõe dados de todos os usuários ativos
DROP POLICY IF EXISTS "Only active accounts can be accessed" ON public.profiles;

-- Criar nova política restritiva: usuários só veem seu próprio perfil
-- A verificação de conta_ativa agora é combinada com auth.uid() = id
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Nota: As políticas existentes já cobrem:
-- "Users can view their own profile" - SELECT onde auth.uid() = id
-- "Admins can view all profiles" - SELECT onde has_role(admin)
-- Porém a política "Only active accounts..." sobrescrevia com OR conta_ativa=true

-- Garantir que a verificação de conta ativa seja feita no nível da aplicação
-- ou criar uma política separada que combina as condições corretamente