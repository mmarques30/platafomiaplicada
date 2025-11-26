-- Renomear menu Trilhas para Academy
UPDATE menu_config 
SET label = 'Academy', 
    updated_at = now() 
WHERE menu_key = 'trilhas';