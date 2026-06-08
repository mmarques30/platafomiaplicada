-- Adiciona as colunas que o schema TS (academy + business) usa mas que NUNCA
-- foram criadas no banco. Sem essas colunas, o autosave do
-- FormularioWizard fazia INSERT/UPDATE com colunas inexistentes → Postgres
-- rejeitava → erro caía em console.error silencioso → cliente clicava
-- "Próximo" e nada acontecia (campos required do passo continuavam vazios
-- porque a gravação anterior falhou).
--
-- Diagnóstico (caso Anna Luisa, id 3df44b76): registro existe com apenas
-- profissao + area_atuacao + como_conheceu_iaplicada salvos; resto null.
-- Quando ela começou a preencher motivo_compra/expectativa_produto, o
-- autosave passou a falhar silenciosamente.
--
-- IF NOT EXISTS pra idempotência. Tipos vêm do schema.ts (todos string
-- exceto importancia_ia_carreira que é number 1..10).

ALTER TABLE public.formulario_diagnostico
  ADD COLUMN IF NOT EXISTS motivo_compra             text,
  ADD COLUMN IF NOT EXISTS expectativa_produto       text,
  ADD COLUMN IF NOT EXISTS ja_fez_curso_ia            text,
  ADD COLUMN IF NOT EXISTS resultado_curso_anterior  text,
  ADD COLUMN IF NOT EXISTS maior_desafio_profissional text,
  ADD COLUMN IF NOT EXISTS tarefa_repetitiva_automatizar text,
  ADD COLUMN IF NOT EXISTS trabalha_em_empresa       text,
  ADD COLUMN IF NOT EXISTS equipe_poderia_usar_ia    text,
  ADD COLUMN IF NOT EXISTS interesse_projeto_customizado text,
  ADD COLUMN IF NOT EXISTS recomendaria_amigo        text,
  ADD COLUMN IF NOT EXISTS preferencia_contato       text,
  ADD COLUMN IF NOT EXISTS importancia_ia_carreira   integer;
