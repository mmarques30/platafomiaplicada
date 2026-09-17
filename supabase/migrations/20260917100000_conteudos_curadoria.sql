-- ============================================================================
-- Conteúdos: curadoria que ensina
--
-- A seção deixa de ser mural de notícia e passa a ser curadoria. Entram dois
-- tipos: 'artigo' (análise ou texto que ensina algo) e 'documento' (guia,
-- estudo ou material em PDF).
--
-- Mudança aditiva: os tipos que já existem continuam valendo e nenhum
-- conteúdo cadastrado é alterado.
-- ============================================================================

alter table public.conteudos_dashboard
  drop constraint if exists conteudos_dashboard_tipo_check;

alter table public.conteudos_dashboard
  add constraint conteudos_dashboard_tipo_check
  check (tipo = any (array[
    'artigo',      -- análise / texto que ensina
    'documento',   -- guia, estudo, PDF
    'dica',        -- prática direta
    'noticia',     -- movimento de mercado com impacto real
    'newsletter',
    'material',    -- aulas ao vivo (legado)
    'criador'
  ]));

comment on column public.conteudos_dashboard.resumo is
  'Por que isso importa para quem lê. É a frase que aparece no card, abaixo do título.';
