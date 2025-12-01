-- Mover Calendário para ordem 3 (após Trilhas)
UPDATE menu_config SET ordem = 3 WHERE menu_key = 'calendario';

-- Ajustar os demais itens para baixo
UPDATE menu_config SET ordem = 4 WHERE menu_key = 'evolucao';
UPDATE menu_config SET ordem = 5 WHERE menu_key = 'meu_diagnostico';
UPDATE menu_config SET ordem = 6 WHERE menu_key = 'ecossistema';
UPDATE menu_config SET ordem = 7 WHERE menu_key = 'favoritos';
UPDATE menu_config SET ordem = 8 WHERE menu_key = 'chat';
UPDATE menu_config SET ordem = 9 WHERE menu_key = 'notificacoes';
UPDATE menu_config SET ordem = 10 WHERE menu_key = 'comunidade';