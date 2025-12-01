-- Ocultar menu Favoritos
UPDATE menu_config 
SET visivel = false 
WHERE menu_key = 'favoritos';

-- Renomear menu Chat para "Chat MarIAna"
UPDATE menu_config 
SET label = 'Chat MarIAna' 
WHERE menu_key = 'chat';