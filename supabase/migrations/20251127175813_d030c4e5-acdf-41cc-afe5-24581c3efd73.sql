-- Renomear menu Notificações para Avisos
UPDATE menu_config 
SET label = 'Avisos', updated_at = now()
WHERE menu_key = 'notificacoes';