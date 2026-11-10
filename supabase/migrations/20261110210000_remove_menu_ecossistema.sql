-- Ecossistema sai do sidebar.
--
-- A tela listava os produtos da IAplicada como catálogo. Ela não faz mais
-- parte do que a plataforma oferece a quem já está dentro: quem entra aqui
-- já comprou, e o que precisa existir no lugar é o ambiente do Insider.
--
-- A linha fica no banco, só invisível, como na saída de Documentos e de
-- Modelos prontos: se tiver que voltar, é um UPDATE e não uma migração
-- nova. A tabela `produtos` e o que estiver nela não são tocados — o admin
-- continua cadastrando produto normalmente.
UPDATE public.menu_config
SET visivel = false, updated_at = now()
WHERE menu_key = 'ecossistema';
