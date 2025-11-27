-- Adicionar role visitante ao enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'visitante';

-- Adicionar campos ao profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS is_visitante BOOLEAN DEFAULT false;

-- Flags de visibilidade para visitantes
ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS visivel_visitantes BOOLEAN DEFAULT false;
ALTER TABLE modulos ADD COLUMN IF NOT EXISTS visivel_visitantes BOOLEAN DEFAULT false;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS visivel_visitantes BOOLEAN DEFAULT false;

-- Menu Comunidade
INSERT INTO menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key)
VALUES ('comunidade', 'Comunidade', 'sidebar', '/comunidade', 'Users', true, true, 8, NULL)
ON CONFLICT (menu_key) DO NOTHING;