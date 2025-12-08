-- Renomear Interações para Comunicações
UPDATE menu_config 
SET label = 'Comunicações', updated_at = now()
WHERE menu_key = 'interacoes';

-- Comunidade vira item principal (não mais submenu)
UPDATE menu_config 
SET parent_key = NULL, ordem = 5, updated_at = now()
WHERE menu_key = 'comunidade';