-- Adicionar novos campos na tabela profiles para gerenciamento de acesso
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_expiracao_acesso TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conta_ativa BOOLEAN DEFAULT true;

-- Atualizar profiles existentes com emails do auth.users
UPDATE profiles p
SET email = (
  SELECT email FROM auth.users WHERE id = p.id
)
WHERE email IS NULL;

-- Criar função para sincronizar email quando usuário é criado/atualizado
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Drop trigger se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_user_email();

-- Criar índice para melhorar performance em consultas de expiração
CREATE INDEX IF NOT EXISTS idx_profiles_expiracao ON profiles(data_expiracao_acesso) WHERE data_expiracao_acesso IS NOT NULL;