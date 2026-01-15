-- Limpar políticas duplicadas/conflitantes em profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Garantir que existe a política para usuários autenticados verem perfis na comunidade
-- Isso é necessário para exibir nome/avatar de autores em posts, ranking, etc.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Authenticated users can view community profile info'
  ) THEN
    CREATE POLICY "Authenticated users can view community profile info"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;