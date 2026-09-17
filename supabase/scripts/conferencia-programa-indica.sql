-- Conferência do IAplicada Indica
--
-- Roda no SQL editor do Lovable Cloud. Não escreve nada: só lê o catálogo do
-- Postgres e devolve um quadro dizendo, item por item, se o que o front
-- espera encontrar está mesmo no banco.
--
-- São três passos. Roda um de cada vez e me manda o resultado dos três.
--
--   PASSO 1  o quadro de conferência (estrutura)
--   PASSO 2  o conteúdo das regras comerciais e dos bônus
--   PASSO 3  quantas linhas cada tabela tem hoje
--
-- Na coluna "ok" do PASSO 1, "ok" é o esperado e "CONFERIR" é o que preciso
-- olhar. Uma linha em CONFERIR não quebra o sistema sozinha; ela me diz o que
-- ainda falta rodar.


-- ===========================================================================
-- PASSO 1: o quadro de conferência
-- ===========================================================================

WITH tipo_plano AS (
  -- O tipo de profiles.plano_mentoria já foi criado e renomeado mais de uma
  -- vez nesta base, então é descoberto pela coluna, não pelo nome.
  SELECT a.atttypid AS oid
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  WHERE c.relnamespace = 'public'::regnamespace
    AND c.relname = 'profiles'
    AND a.attname = 'plano_mentoria'
    AND NOT a.attisdropped
)

-- 1. As tabelas do programa, e se a RLS está ligada em cada uma
SELECT
  '1. Tabelas'::text AS bloco,
  e.nome::text AS item,
  'existe, com RLS ligada'::text AS esperado,
  CASE
    WHEN c.oid IS NULL THEN 'NÃO EXISTE'
    WHEN NOT c.relrowsecurity THEN 'existe, mas a RLS está DESLIGADA'
    ELSE 'existe, com RLS ligada'
  END::text AS encontrado,
  CASE WHEN c.oid IS NOT NULL AND c.relrowsecurity THEN 'ok' ELSE 'CONFERIR' END::text AS ok
FROM (VALUES
  ('programa_papeis'), ('programa_regras'), ('convites'), ('indicacoes'),
  ('indicacao_eventos'), ('bonus_catalogo'), ('recompensas'),
  ('recompensa_parcelas'), ('parcerias'), ('mural_oportunidades')
) AS e(nome)
LEFT JOIN pg_class c
  ON c.relname = e.nome
 AND c.relnamespace = 'public'::regnamespace
 AND c.relkind = 'r'

UNION ALL

-- 2. Os tipos enumerados criados pelo programa
SELECT
  '2. Tipos',
  e.nome,
  e.labels,
  coalesce(
    (SELECT string_agg(en.enumlabel, ', ' ORDER BY en.enumlabel)
       FROM pg_enum en WHERE en.enumtypid = t.oid),
    'NÃO EXISTE'
  ),
  CASE
    WHEN (SELECT string_agg(en.enumlabel, ', ' ORDER BY en.enumlabel)
            FROM pg_enum en WHERE en.enumtypid = t.oid) = e.labels
    THEN 'ok' ELSE 'CONFERIR'
  END
FROM (VALUES
  ('papel_programa',    'indicador, parceria_aberta, parceria_executora'),
  ('status_convite',    'aceito, cancelado, expirado, pendente'),
  ('status_indicacao',  'em_contato, fechada, nova, perdida, proposta, qualificada'),
  ('tipo_recompensa',   'bonus, cashback'),
  ('status_recompensa', 'aprovada, cancelada, escolhida, paga, prevista'),
  ('status_parceria',   'encerrada, rascunho, vigente'),
  ('tipo_oportunidade', 'oferta, procura')
) AS e(nome, labels)
LEFT JOIN pg_type t
  ON t.typname = e.nome
 AND t.typnamespace = 'public'::regnamespace
 AND t.typtype = 'e'

UNION ALL

-- 3. O rename dos planos: os nomes novos entraram e os velhos sumiram
SELECT
  '3. Planos',
  e.rotulo,
  e.esperado,
  CASE
    WHEN (SELECT oid FROM tipo_plano) IS NULL THEN 'coluna plano_mentoria não encontrada'
    WHEN EXISTS (SELECT 1 FROM pg_enum en, tipo_plano tp
                  WHERE en.enumtypid = tp.oid AND en.enumlabel = e.label)
    THEN 'o valor existe no enum'
    ELSE 'o valor não existe no enum'
  END,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_enum en, tipo_plano tp
                  WHERE en.enumtypid = tp.oid AND en.enumlabel = e.label) = e.deve_existir
    THEN 'ok' ELSE 'CONFERIR'
  END
FROM (VALUES
  ('insider_business (nome novo)',   'insider_business',  true,  'tem que existir'),
  ('insider_convidado (nome novo)',  'insider_convidado', true,  'tem que existir'),
  ('business_sistemas (nome antigo)','business_sistemas', false, 'não pode mais existir'),
  ('insider_free (nome antigo)',     'insider_free',      false, 'não pode mais existir')
) AS e(rotulo, label, deve_existir, esperado)

UNION ALL

-- 4. As funções que o front e a RLS chamam
SELECT
  '4. Funções',
  e.nome,
  'existe',
  CASE WHEN p.oid IS NULL THEN 'NÃO EXISTE' ELSE 'existe' END,
  CASE WHEN p.oid IS NULL THEN 'CONFERIR' ELSE 'ok' END
FROM (VALUES
  ('tem_papel_programa'), ('papel_vigente'), ('percentual_da_proxima'),
  ('programa_permanencia_ok'), ('user_is_insider')
) AS e(nome)
LEFT JOIN LATERAL (
  SELECT pr.oid FROM pg_proc pr
  WHERE pr.proname = e.nome AND pr.pronamespace = 'public'::regnamespace
  LIMIT 1
) p ON true

UNION ALL

-- 5. As colunas que vieram na migração das regras comerciais.
--    Se alguma faltar, é sinal de que a 20260917190000 não rodou.
SELECT
  '5. Colunas',
  e.tabela || '.' || e.coluna,
  'existe',
  CASE WHEN a.attname IS NULL THEN 'NÃO EXISTE' ELSE 'existe' END,
  CASE WHEN a.attname IS NULL THEN 'CONFERIR' ELSE 'ok' END
FROM (VALUES
  ('recompensas',     'valor_base'),
  ('recompensas',     'percentual'),
  ('recompensas',     'ordem_fechamento'),
  ('bonus_catalogo',  'prazo_entrega_dias'),
  ('programa_regras', 'percentual_teto'),
  ('programa_regras', 'volume_minimo_mes'),
  ('indicacoes',      'qualificada_em'),
  ('indicacoes',      'fechada_em'),
  ('indicacoes',      'valor_fechado'),
  ('convites',        'creditar_a'),
  ('convites',        'token')
) AS e(tabela, coluna)
LEFT JOIN pg_class c
  ON c.relname = e.tabela AND c.relnamespace = 'public'::regnamespace
LEFT JOIN pg_attribute a
  ON a.attrelid = c.oid AND a.attname = e.coluna AND NOT a.attisdropped

UNION ALL

-- 6. Os índices que sustentam as regras estruturais
SELECT
  '6. Índices',
  e.nome,
  e.para_que,
  CASE WHEN i.relname IS NULL THEN 'NÃO EXISTE' ELSE 'existe' END,
  CASE WHEN i.relname IS NULL THEN 'CONFERIR' ELSE 'ok' END
FROM (VALUES
  ('programa_papeis_um_vigente',    'um papel vigente por pessoa'),
  ('convites_email_pendente',       'um convite pendente por e-mail'),
  ('recompensas_uma_por_indicacao', 'uma recompensa por indicação')
) AS e(nome, para_que)
LEFT JOIN pg_class i
  ON i.relname = e.nome AND i.relnamespace = 'public'::regnamespace AND i.relkind = 'i'

UNION ALL

-- 7. Os gatilhos que amarram o papel ao plano Insider
SELECT
  '7. Gatilhos',
  e.nome || ' (em ' || e.tabela || ')',
  e.para_que,
  CASE WHEN tg.tgname IS NULL THEN 'NÃO EXISTE' ELSE 'existe' END,
  CASE WHEN tg.tgname IS NULL THEN 'CONFERIR' ELSE 'ok' END
FROM (VALUES
  ('papel_so_insider', 'programa_papeis',
   'só quem é Insider recebe papel'),
  ('encerra_papel_ao_sair_do_insider', 'profiles',
   'sai do Insider, o papel encerra junto')
) AS e(nome, tabela, para_que)
LEFT JOIN pg_class c
  ON c.relname = e.tabela AND c.relnamespace = 'public'::regnamespace
LEFT JOIN pg_trigger tg
  ON tg.tgrelid = c.oid AND tg.tgname = e.nome AND NOT tg.tgisinternal

UNION ALL

-- 8. Quantas políticas de RLS cada tabela tem.
--    Zero política com RLS ligada trava a tabela inteira.
SELECT
  '8. Políticas',
  e.nome,
  'pelo menos uma política',
  coalesce((SELECT count(*) FROM pg_policies pp
             WHERE pp.schemaname = 'public' AND pp.tablename = e.nome), 0)::text
    || ' política(s)',
  CASE WHEN (SELECT count(*) FROM pg_policies pp
              WHERE pp.schemaname = 'public' AND pp.tablename = e.nome) > 0
       THEN 'ok' ELSE 'CONFERIR' END
FROM (VALUES
  ('programa_papeis'), ('convites'), ('indicacoes'), ('indicacao_eventos'),
  ('bonus_catalogo'), ('recompensas'), ('parcerias'), ('mural_oportunidades')
) AS e(nome)

ORDER BY 1, 2;


-- ===========================================================================
-- PASSO 2: o conteúdo comercial
-- ===========================================================================
--
-- As três linhas de programa_regras têm que bater com a tabela do material:
--
--   indicador           4,00 base   +1,00   1 nome/mês   sem contrato
--   parceria_aberta     6,00 base   +1,00   5 nomes/mês  com contrato, 6 meses
--   parceria_executora  sem base                         com contrato
--
-- percentual_teto vem nulo de propósito: o negócio ainda não definiu onde a
-- progressão para. Enquanto for nulo, ela não trava.

SELECT papel, rotulo, percentual_base, percentual_incremento, percentual_teto,
       volume_minimo_mes, exige_contrato, renovacao_meses
FROM public.programa_regras
ORDER BY papel;

SELECT nome, valor_referencia, prazo_entrega_dias, ativo, ordem
FROM public.bonus_catalogo
ORDER BY ordem;

-- A Comunidade tem que estar fora do menu.
SELECT menu_key, label, visivel
FROM public.menu_config
WHERE menu_key = 'comunidade' OR menu_key LIKE 'comunidade\_%'
ORDER BY menu_key;


-- ===========================================================================
-- PASSO 3: o que já tem dentro
-- ===========================================================================

SELECT 'programa_papeis'     AS tabela, count(*) FROM public.programa_papeis
UNION ALL SELECT 'convites',            count(*) FROM public.convites
UNION ALL SELECT 'indicacoes',          count(*) FROM public.indicacoes
UNION ALL SELECT 'indicacao_eventos',   count(*) FROM public.indicacao_eventos
UNION ALL SELECT 'recompensas',         count(*) FROM public.recompensas
UNION ALL SELECT 'recompensa_parcelas', count(*) FROM public.recompensa_parcelas
UNION ALL SELECT 'parcerias',           count(*) FROM public.parcerias
UNION ALL SELECT 'mural_oportunidades', count(*) FROM public.mural_oportunidades
ORDER BY 1;

-- E os planos como estão hoje, para eu saber quem já é Insider.
SELECT plano_mentoria, count(*)
FROM public.profiles
GROUP BY 1
ORDER BY 2 DESC;
