-- Documentos sai do sidebar.
--
-- O menu foi criado junto com Encontros Insider, para servir de prateleira
-- de documentos de consulta. Na prática não entrou no fluxo de ninguém:
-- nem aluno, nem mentorado, nem admin abre essa tela. Ter um item de menu
-- que nunca é clicado custa uma linha de atenção em toda sessão.
--
-- A linha fica no banco, só invisível, que é a mesma regra usada quando os
-- menus da máquina de projeto saíram de cena: se um dia tiver que voltar, é
-- um UPDATE e não uma migração nova. A tabela `documentos_consulta` e o que
-- estiver dentro dela não são tocados.
UPDATE public.menu_config
SET visivel = false, updated_at = now()
WHERE menu_key = 'documentos';
