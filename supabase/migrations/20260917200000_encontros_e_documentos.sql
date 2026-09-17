-- Encontros Insider e documentos de consulta
--
-- Duas mudanças que andam juntas, porque vêm da mesma decisão: a plataforma
-- deixa de acompanhar a execução do projeto do cliente e passa a ser consumo
-- de conteúdo e o programa Indica.
--
-- 1. ENCONTROS. "Próxima sessão" vira "Próximo encontro Insider", e ganha uma
--    tela própria com agenda, quem fala e o material de cada encontro.
--
--    A tabela não é nova: aulas_semanais já guarda tema, data, horário, link
--    e se já aconteceu, e é dela que o painel lê o próximo encontro hoje.
--    Criar uma tabela paralela de "encontros" faria a mesma informação viver
--    em dois lugares e sair de sincronia no primeiro encontro remarcado.
--    Então ela só ganha o que falta: a gravação, e duas tabelas filhas.
--
-- 2. DOCUMENTOS DE CONSULTA. O cliente continua recebendo documentos, mas
--    documentos_business é indexada por contrato_id, e contrato é parte da
--    máquina de projeto que está saindo. A tabela nova não conhece contrato:
--    é material de consulta publicado pela equipe, para quem tem acesso.

-- ---------------------------------------------------------------------------
-- 1. Encontros: o que falta em aulas_semanais
-- ---------------------------------------------------------------------------
ALTER TABLE public.aulas_semanais
  ADD COLUMN IF NOT EXISTS gravacao_url text,
  ADD COLUMN IF NOT EXISTS resumo text;

COMMENT ON COLUMN public.aulas_semanais.gravacao_url IS
  'Link da gravação, preenchido depois que o encontro acontece.';
COMMENT ON COLUMN public.aulas_semanais.resumo IS
  'O que foi tratado no encontro. Vira o texto do card depois de realizado.';

-- Quem fala no encontro. Um encontro pode ter mais de um, e a ordem importa
-- na hora de mostrar.
CREATE TABLE IF NOT EXISTS public.encontro_speakers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id     uuid NOT NULL REFERENCES public.aulas_semanais(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  papel       text,
  empresa     text,
  bio         text,
  foto_url    text,
  ordem       integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS encontro_speakers_aula_idx
  ON public.encontro_speakers (aula_id, ordem);

-- O material do encontro: slide, planilha, gravação extra, link de leitura.
CREATE TABLE IF NOT EXISTS public.encontro_materiais (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id     uuid NOT NULL REFERENCES public.aulas_semanais(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  descricao   text,
  tipo        text NOT NULL DEFAULT 'link',
  url         text NOT NULL,
  ordem       integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT encontro_materiais_tipo_valido
    CHECK (tipo IN ('link', 'slide', 'planilha', 'documento', 'video', 'outro'))
);

CREATE INDEX IF NOT EXISTS encontro_materiais_aula_idx
  ON public.encontro_materiais (aula_id, ordem);

-- ---------------------------------------------------------------------------
-- 2. Documentos de consulta
-- ---------------------------------------------------------------------------
--
-- Publicado pela equipe, lido por quem tem acesso. Sem contrato no meio.
--
-- destinatario_id nulo significa "para todo mundo que tem acesso". Preenchido,
-- é um documento de uma pessoa só. É o que permite mandar o documento de um
-- cliente específico sem precisar de uma tabela de projeto por trás.
CREATE TABLE IF NOT EXISTS public.documentos_consulta (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          text NOT NULL,
  descricao       text,
  categoria       text,
  arquivo_url     text NOT NULL,
  destinatario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  publicado_por   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ativo           boolean NOT NULL DEFAULT true,
  ordem           integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documentos_consulta_destinatario_idx
  ON public.documentos_consulta (destinatario_id) WHERE destinatario_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS documentos_consulta_ativo_idx
  ON public.documentos_consulta (ativo, ordem, created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. updated_at
-- ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['encontro_speakers', 'encontro_materiais', 'documentos_consulta']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%1$s ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t);
  END LOOP;
END
$$;

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.encontro_speakers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encontro_materiais   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_consulta  ENABLE ROW LEVEL SECURITY;

-- Speakers e materiais acompanham o encontro: quem está autenticado e vê o
-- calendário vê quem fala e o que foi distribuído.
DROP POLICY IF EXISTS speakers_leitura ON public.encontro_speakers;
CREATE POLICY speakers_leitura ON public.encontro_speakers
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS speakers_escrita_equipe ON public.encontro_speakers;
CREATE POLICY speakers_escrita_equipe ON public.encontro_speakers
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

DROP POLICY IF EXISTS materiais_leitura ON public.encontro_materiais;
CREATE POLICY materiais_leitura ON public.encontro_materiais
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS materiais_escrita_equipe ON public.encontro_materiais;
CREATE POLICY materiais_escrita_equipe ON public.encontro_materiais
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- Documento geral é de todo mundo que tem acesso; documento endereçado é só
-- de quem recebeu. A equipe vê e mantém tudo.
DROP POLICY IF EXISTS documentos_consulta_leitura ON public.documentos_consulta;
CREATE POLICY documentos_consulta_leitura ON public.documentos_consulta
  FOR SELECT USING (
    (ativo AND destinatario_id IS NULL AND auth.uid() IS NOT NULL)
    OR destinatario_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );

DROP POLICY IF EXISTS documentos_consulta_escrita_equipe ON public.documentos_consulta;
CREATE POLICY documentos_consulta_escrita_equipe ON public.documentos_consulta
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- Conferência depois de rodar:
--
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'aulas_semanais' AND column_name IN ('gravacao_url','resumo');
-- SELECT tablename, count(*) FROM pg_policies
--   WHERE tablename IN ('encontro_speakers','encontro_materiais','documentos_consulta')
--   GROUP BY 1;

-- ---------------------------------------------------------------------------
-- 5. Os dois itens no menu
-- ---------------------------------------------------------------------------
--
-- "Encontros Insider" entra como submenu de "Aprender", logo depois de
-- "Central". A ordem é calculada a partir da do Central em vez de chutada:
-- se a agenda de menus mudar, o item continua no lugar certo.
--
-- "Documentos" entra como menu principal, no lugar que a antiga tela de
-- documentos do projeto ocupava.
DO $$
DECLARE
  v_ordem_central integer;
  v_parent        text;
  v_ordem_max     integer;
BEGIN
  -- Onde está o Central hoje, e de quem ele é filho.
  SELECT ordem, parent_key INTO v_ordem_central, v_parent
  FROM public.menu_config
  WHERE menu_key IN ('inicio_central', 'central')
  ORDER BY CASE menu_key WHEN 'inicio_central' THEN 0 ELSE 1 END
  LIMIT 1;

  -- Sem Central no banco, "abaixo de Central" não tem âncora: o item vai para
  -- o fim de "Aprender", que é onde ele foi pedido.
  IF v_ordem_central IS NULL THEN
    v_parent := 'aprender';
    SELECT coalesce(max(ordem), 0) INTO v_ordem_central
    FROM public.menu_config WHERE parent_key = 'aprender';
  END IF;

  INSERT INTO public.menu_config
    (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key, planos_permitidos)
  VALUES
    ('encontros', 'Encontros Insider', 'sidebar', '/encontros', 'CalendarDays',
     true, true, v_ordem_central + 1, coalesce(v_parent, 'aprender'), NULL)
  ON CONFLICT (menu_key) DO UPDATE SET
    label      = EXCLUDED.label,
    url        = EXCLUDED.url,
    icon       = EXCLUDED.icon,
    visivel    = true,
    parent_key = EXCLUDED.parent_key,
    updated_at = now();

  -- Documentos: menu principal, depois do último que existe.
  SELECT coalesce(max(ordem), 0) INTO v_ordem_max
  FROM public.menu_config WHERE parent_key IS NULL;

  INSERT INTO public.menu_config
    (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key, planos_permitidos)
  VALUES
    ('documentos', 'Documentos', 'sidebar', '/documentos', 'FileText',
     true, true, v_ordem_max + 1, NULL, NULL)
  ON CONFLICT (menu_key) DO UPDATE SET
    label      = EXCLUDED.label,
    url        = EXCLUDED.url,
    icon       = EXCLUDED.icon,
    visivel    = true,
    parent_key = NULL,
    updated_at = now();
END
$$;

-- Os menus da máquina de projeto saem de cena. As linhas ficam no banco, só
-- invisíveis: se algo tiver que voltar, é um UPDATE, não uma migração nova.
UPDATE public.menu_config
SET visivel = false, updated_at = now()
WHERE menu_key IN (
  'meu_sistema', 'meu_sistema_entregas', 'meu_sistema_documentos', 'meu_sistema_fases',
  'projeto_skills', 'projeto_skills_visao_geral', 'projeto_skills_performance',
  'projeto_skills_diagnostico', 'projeto_skills_projetos', 'projeto_skills_entregas',
  'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas',
  'skills_lider', 'skills_painel_lider', 'squad', 'squad_lider',
  'mentoria', 'mentoria_sessoes', 'mentoria_entregas', 'mentoria_documentos',
  'mentoria_tarefas', 'mentoria_processo', 'mentoria_recursos', 'mentoria_projetos',
  'meu_progresso_visao_geral', 'meu_progresso_roadmap',
  'meu_progresso_conteudo', 'meu_progresso_entregas'
);
