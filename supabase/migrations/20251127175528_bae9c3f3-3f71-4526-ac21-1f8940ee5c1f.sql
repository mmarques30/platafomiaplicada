-- Adicionar campos para datas específicas e descrições em aulas_semanais
ALTER TABLE aulas_semanais 
ADD COLUMN IF NOT EXISTS data_aula DATE,
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Adicionar submenu Calendário sob Notificações
INSERT INTO menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key)
VALUES ('calendario', 'Calendário', 'sidebar', '/notificacoes/calendario', NULL, true, true, 2, 'notificacoes')
ON CONFLICT (menu_key) DO NOTHING;