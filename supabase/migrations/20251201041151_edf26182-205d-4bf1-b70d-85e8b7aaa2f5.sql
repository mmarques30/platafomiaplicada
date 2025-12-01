-- Remover o submenu "Meus Avisos" que estava impedindo Avisos de ser um botão direto
DELETE FROM menu_config WHERE menu_key = 'meus_avisos';