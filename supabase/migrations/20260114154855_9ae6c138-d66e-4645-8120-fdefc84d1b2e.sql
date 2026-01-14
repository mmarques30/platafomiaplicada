-- Atualizar função handle_google_auth para BLOQUEAR login via Google 
-- se o email não existir no sistema (apenas login, não cadastro)
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
  SELECT id, is_visitante, conta_ativa INTO existing_profile
  FROM public.profiles
  WHERE LOWER(email) = LOWER(NEW.email);
  
  IF existing_profile.id IS NOT NULL THEN
    -- Perfil existe - verificar se conta está ativa
    IF existing_profile.conta_ativa = false THEN
      RAISE EXCEPTION 'Conta desativada. Entre em contato com o suporte.';
    END IF;
    
    -- Se o perfil já tem um ID diferente do auth.users, precisamos vincular
    IF existing_profile.id != NEW.id THEN
      -- Atualizar o profile para vincular ao novo auth.users ID
      UPDATE public.profiles
      SET id = NEW.id,
          updated_at = NOW()
      WHERE LOWER(email) = LOWER(NEW.email);
      
      -- Vincular roles existentes ao novo ID
      UPDATE public.user_roles
      SET user_id = NEW.id
      WHERE user_id = existing_profile.id;
    END IF;
    
    RETURN NEW;
  ELSE
    -- Email NÃO existe no sistema - BLOQUEAR o cadastro via Google
    -- Isso impede que novos usuários se cadastrem via Google
    RAISE EXCEPTION 'Email não cadastrado. Por favor, crie sua conta primeiro usando email e senha.';
  END IF;
END;
$$;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION public.handle_google_auth IS 'Permite login via Google APENAS para usuários já cadastrados. Bloqueia criação de novos usuários via Google OAuth.';