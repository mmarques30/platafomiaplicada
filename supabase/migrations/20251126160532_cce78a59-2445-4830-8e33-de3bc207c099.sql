-- Remover ícone do submenu Novidades
UPDATE menu_config 
SET icon = NULL, 
    updated_at = now() 
WHERE menu_key = 'trilhas_novidades';