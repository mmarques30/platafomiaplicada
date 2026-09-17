-- A Comunidade deixa de existir como tela da plataforma.
--
-- A conversa acontece no grupo do WhatsApp, e o mural de negócios dos
-- Insiders passa a ser o lugar de encontrar gente. O ranking continua vivo,
-- em "Meu progresso", e não dependia do feed: ele lê content_access_logs.
--
-- Nada é apagado. community_posts, community_comments e as tabelas vizinhas
-- continuam como estão, e a moderação no admin ainda enxerga o histórico.
-- Isto aqui só tira a entrada do menu.

UPDATE public.menu_config
SET visivel = false,
    updated_at = now()
WHERE menu_key = 'comunidade'
   OR menu_key LIKE 'comunidade\_%';

-- Conferência: nenhuma linha visível deve sobrar.
-- SELECT menu_key, label, visivel FROM public.menu_config WHERE menu_key LIKE 'comunidade%';
