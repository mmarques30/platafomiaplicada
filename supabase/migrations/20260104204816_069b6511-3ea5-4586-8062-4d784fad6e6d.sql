-- Função para tratar login via Google
CREATE OR REPLACE FUNCTION public.handle_google_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_profile record;
BEGIN
  -- Verificar se já existe perfil com este email
  SELECT id, is_visitante INTO existing_profile
  FROM public.profiles
  WHERE email = NEW.email;
  
  IF existing_profile.id IS NOT NULL THEN
    -- Perfil já existe - o Supabase vincula automaticamente
    RETURN NEW;
  ELSE
    -- Novo usuário via Google: criar como visitante
    INSERT INTO public.profiles (
      id, 
      email, 
      nome_completo, 
      is_visitante, 
      primeiro_acesso,
      conta_ativa
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        split_part(NEW.email, '@', 1)
      ),
      true,
      true,
      true
    );
    
    -- Atribuir role de visitante
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'visitante');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger se existir
DROP TRIGGER IF EXISTS on_google_auth_user_created ON auth.users;

-- Criar trigger para novos usuários via Google
CREATE TRIGGER on_google_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION public.handle_google_auth();