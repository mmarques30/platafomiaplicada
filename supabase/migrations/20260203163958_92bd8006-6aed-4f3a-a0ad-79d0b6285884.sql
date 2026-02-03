-- Adicionar campo para autorização de login com Google para emails não-Google
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_login_autorizado boolean DEFAULT false;

COMMENT ON COLUMN profiles.google_login_autorizado IS 
  'Autorização do admin para login com Google quando o email não é @gmail.com';