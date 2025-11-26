-- Adicionar campos de controle de onboarding na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_acesso_enviado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS adicionado_grupo_whatsapp boolean DEFAULT false;