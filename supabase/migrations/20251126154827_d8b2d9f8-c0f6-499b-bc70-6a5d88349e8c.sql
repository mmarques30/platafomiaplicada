-- Adicionar menu item "Novidades" como submenu de "Trilhas"
INSERT INTO menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key)
VALUES ('trilhas_novidades', 'Novidades', 'sidebar', '/trilhas/novidades', 'Sparkles', true, true, 2, 'trilhas');