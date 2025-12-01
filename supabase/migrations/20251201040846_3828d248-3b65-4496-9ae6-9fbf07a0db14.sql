-- Transformar Calendário em item principal (ordem 6)
UPDATE menu_config 
SET parent_key = NULL, 
    icon = 'Calendar', 
    ordem = 6,
    url = '/notificacoes/calendario',
    label = 'Calendário'
WHERE menu_key = 'calendario';

-- Remover submenu "Meus Avisos"
DELETE FROM menu_config WHERE menu_key = 'meus_avios';

-- Garantir que Avisos está com URL correto e será clicável
UPDATE menu_config 
SET url = '/notificacoes'
WHERE menu_key = 'notificacoes';