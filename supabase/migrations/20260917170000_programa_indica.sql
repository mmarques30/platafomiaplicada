-- Programa Indica: papéis, convites, indicações, recompensas, parcerias e mural.
--
-- Tudo novo. Nenhuma tabela legada é lida ou escrita aqui, e nada deste
-- arquivo toca profiles.plano_mentoria: plano e papel são eixos independentes.
--
-- Três regras estão gravadas no desenho, não no código de tela:
--
--   1. O papel tem vigência, não é coluna. Papel vira linha com vigente_de e
--      vigente_ate, porque a equipe pode alterar depois e não se pode perder o
--      que a pessoa era quando uma indicação fechou.
--   2. O crédito da indicação é gravado uma vez. indicacoes.indicador_id nunca
--      é recalculado a partir do papel atual: o que já aconteceu continua
--      sendo de quem trouxe.
--   3. E-mail de convite é sempre minúsculo, com único parcial entre os
--      pendentes. Busca sensível a maiúscula já travou acesso nesta base.
--   4. Só quem é Insider participa do programa. Cliente Academy não tem
--      papel, e o banco recusa em vez de confiar na tela.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'papel_programa') THEN
    CREATE TYPE public.papel_programa AS ENUM ('indicador', 'parceria_aberta', 'parceria_executora');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_convite') THEN
    CREATE TYPE public.status_convite AS ENUM ('pendente', 'aceito', 'expirado', 'cancelado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_indicacao') THEN
    CREATE TYPE public.status_indicacao AS ENUM ('nova', 'em_contato', 'qualificada', 'proposta', 'fechada', 'perdida');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_recompensa') THEN
    CREATE TYPE public.tipo_recompensa AS ENUM ('cashback', 'bonus');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_recompensa') THEN
    CREATE TYPE public.status_recompensa AS ENUM ('prevista', 'escolhida', 'aprovada', 'paga', 'cancelada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_parceria') THEN
    CREATE TYPE public.status_parceria AS ENUM ('rascunho', 'vigente', 'encerrada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_oportunidade') THEN
    CREATE TYPE public.tipo_oportunidade AS ENUM ('oferta', 'procura');
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- programa_papeis: o que a pessoa é, com vigência
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_papeis (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  papel             public.papel_programa NOT NULL,
  vigente_de        timestamptz NOT NULL DEFAULT now(),
  vigente_ate       timestamptz,
  definido_por      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  origem_convite_id uuid,
  observacao        text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_papeis_vigencia_coerente CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de)
);

-- Um papel vigente por pessoa. O histórico fica nas linhas já encerradas.
CREATE UNIQUE INDEX IF NOT EXISTS programa_papeis_um_vigente
  ON public.programa_papeis (user_id) WHERE vigente_ate IS NULL;

CREATE INDEX IF NOT EXISTS programa_papeis_user_idx ON public.programa_papeis (user_id, vigente_de DESC);

-- ---------------------------------------------------------------------------
-- convites: quem gera, quem leva o crédito, quem recebe
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.convites (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  nome          text,
  empresa       text,
  token         text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  papel         public.papel_programa NOT NULL,
  status        public.status_convite NOT NULL DEFAULT 'pendente',
  expira_em     timestamptz NOT NULL DEFAULT now() + INTERVAL '30 days',
  gerado_por    uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  creditar_a    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  aceito_em     timestamptz,
  usuario_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT convites_email_minusculo CHECK (email = lower(email))
);

-- Um convite pendente por e-mail. Aceitos e expirados podem se repetir.
CREATE UNIQUE INDEX IF NOT EXISTS convites_email_pendente
  ON public.convites (email) WHERE status = 'pendente';

CREATE INDEX IF NOT EXISTS convites_creditar_idx ON public.convites (creditar_a) WHERE creditar_a IS NOT NULL;

-- ---------------------------------------------------------------------------
-- indicacoes: a empresa que alguém trouxe
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.indicacoes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  convite_id       uuid REFERENCES public.convites(id) ON DELETE SET NULL,
  empresa_nome     text NOT NULL,
  contato_nome     text,
  contato_email    text,
  contato_whatsapp text,
  observacao       text,
  status           public.status_indicacao NOT NULL DEFAULT 'nova',
  responsavel_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  qualificada_em   timestamptz,
  fechada_em       timestamptz,
  valor_fechado    numeric(12,2),
  motivo_perda     text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT indicacoes_fechada_tem_data CHECK (status <> 'fechada' OR fechada_em IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS indicacoes_indicador_idx ON public.indicacoes (indicador_id, created_at DESC);
CREATE INDEX IF NOT EXISTS indicacoes_status_idx ON public.indicacoes (status);
-- Serve a regra de permanência: qualificadas recentes por indicador.
CREATE INDEX IF NOT EXISTS indicacoes_qualificada_idx
  ON public.indicacoes (indicador_id, qualificada_em DESC) WHERE qualificada_em IS NOT NULL;

-- ---------------------------------------------------------------------------
-- indicacao_eventos: a trilha de status
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.indicacao_eventos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicacao_id uuid NOT NULL REFERENCES public.indicacoes(id) ON DELETE CASCADE,
  de_status    public.status_indicacao,
  para_status  public.status_indicacao NOT NULL,
  por          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nota         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS indicacao_eventos_idx ON public.indicacao_eventos (indicacao_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- bonus_catalogo e recompensas: o que a indicação gerou
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bonus_catalogo (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             text NOT NULL,
  descricao        text,
  valor_referencia numeric(12,2),
  ativo            boolean NOT NULL DEFAULT true,
  ordem            integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recompensas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicacao_id   uuid NOT NULL REFERENCES public.indicacoes(id) ON DELETE CASCADE,
  beneficiario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  tipo           public.tipo_recompensa,
  valor          numeric(12,2),
  bonus_id       uuid REFERENCES public.bonus_catalogo(id) ON DELETE SET NULL,
  status         public.status_recompensa NOT NULL DEFAULT 'prevista',
  escolhida_em   timestamptz,
  aprovada_em    timestamptz,
  paga_em        timestamptz,
  observacao     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  -- Cashback tem valor, bônus tem item do catálogo. Enquanto está prevista,
  -- a pessoa ainda não escolheu, então os dois podem estar vazios.
  CONSTRAINT recompensas_forma_coerente CHECK (
    status = 'prevista'
    OR (tipo = 'cashback' AND valor IS NOT NULL)
    OR (tipo = 'bonus' AND bonus_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS recompensas_beneficiario_idx ON public.recompensas (beneficiario_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS recompensas_uma_por_indicacao ON public.recompensas (indicacao_id);

-- ---------------------------------------------------------------------------
-- parcerias: o contrato por trás dos dois tipos de parceiro
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parcerias (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  papel            public.papel_programa NOT NULL,
  status           public.status_parceria NOT NULL DEFAULT 'rascunho',
  contrato_url     text,
  vigencia_inicio  date,
  vigencia_fim     date,
  condicoes        text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parcerias_so_parceiro CHECK (papel IN ('parceria_aberta', 'parceria_executora')),
  CONSTRAINT parcerias_vigencia_coerente CHECK (vigencia_fim IS NULL OR vigencia_inicio IS NULL OR vigencia_fim >= vigencia_inicio)
);

CREATE INDEX IF NOT EXISTS parcerias_user_idx ON public.parcerias (user_id, status);

-- ---------------------------------------------------------------------------
-- mural_oportunidades: o mural de negócios dos Insiders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mural_oportunidades (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo        public.tipo_oportunidade NOT NULL,
  titulo      text NOT NULL,
  descricao   text NOT NULL,
  area        text,
  ativo       boolean NOT NULL DEFAULT true,
  expira_em   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mural_ativo_idx ON public.mural_oportunidades (ativo, created_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'programa_papeis', 'convites', 'indicacoes', 'recompensas',
    'bonus_catalogo', 'parcerias', 'mural_oportunidades'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%1$s ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t);
  END LOOP;
END
$$;

-- ---------------------------------------------------------------------------
-- Só Insider participa do programa
-- ---------------------------------------------------------------------------
--
-- Cliente Academy não tem papel. Isso não cabe em CHECK, porque a condição
-- mora em outra tabela, então são dois gatilhos: um recusa o papel de quem
-- não é Insider, e o outro encerra o papel de quem deixa de ser.
--
-- O segundo existe porque a regra precisa valer no tempo, não só no insert.
-- Encerrar é a leitura honesta do que aconteceu: o papel valeu até o dia em
-- que o plano mudou, e as indicações daquele período continuam creditadas.

CREATE OR REPLACE FUNCTION public.programa_papel_so_insider()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_plano plano_mentoria;
BEGIN
  -- Linha já encerrada é histórico: não se valida o passado.
  IF NEW.vigente_ate IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT plano_mentoria INTO v_plano FROM public.profiles WHERE id = NEW.user_id;

  IF v_plano IS NULL OR v_plano NOT IN ('insider_business', 'insider_convidado') THEN
    RAISE EXCEPTION
      'Só Insider Business ou Insider Convidado participam do programa. Plano atual: %.',
      COALESCE(v_plano::text, 'sem plano');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS papel_so_insider ON public.programa_papeis;
CREATE TRIGGER papel_so_insider
  BEFORE INSERT OR UPDATE ON public.programa_papeis
  FOR EACH ROW EXECUTE FUNCTION public.programa_papel_so_insider();

CREATE OR REPLACE FUNCTION public.encerrar_papel_ao_sair_do_insider()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plano_mentoria IS DISTINCT FROM OLD.plano_mentoria
     AND (NEW.plano_mentoria IS NULL
          OR NEW.plano_mentoria NOT IN ('insider_business', 'insider_convidado'))
  THEN
    UPDATE public.programa_papeis
    SET vigente_ate = now(),
        observacao = concat_ws(' ', observacao,
          format('Encerrado automaticamente: plano passou para %s.',
                 COALESCE(NEW.plano_mentoria::text, 'sem plano')))
    WHERE user_id = NEW.id AND vigente_ate IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS encerra_papel_fora_do_insider ON public.profiles;
CREATE TRIGGER encerra_papel_fora_do_insider
  AFTER UPDATE OF plano_mentoria ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.encerrar_papel_ao_sair_do_insider();

-- ---------------------------------------------------------------------------
-- Predicados do programa
-- ---------------------------------------------------------------------------

-- Tem papel vigente no programa.
CREATE OR REPLACE FUNCTION public.tem_papel_programa(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.programa_papeis
    WHERE user_id = _user_id AND vigente_ate IS NULL
  );
$$;

-- O papel vigente, ou NULL.
CREATE OR REPLACE FUNCTION public.papel_vigente(_user_id uuid DEFAULT auth.uid())
RETURNS public.papel_programa
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT papel FROM public.programa_papeis
  WHERE user_id = _user_id AND vigente_ate IS NULL
  LIMIT 1;
$$;

-- Regra de permanência do Insider Convidado.
--
-- Fica sozinha numa função porque é a parte que mais vai mudar. Trocar o
-- critério é trocar este corpo, sem migração de tabela e sem tocar em tela.
--
-- Hoje: pelo menos uma indicação qualificada nos últimos 90 dias, OU contrato
-- de parceria vigente. Quem não é Convidado passa direto.
CREATE OR REPLACE FUNCTION public.programa_permanencia_ok(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plano  plano_mentoria;
  v_janela constant interval := INTERVAL '90 days';
BEGIN
  SELECT plano_mentoria INTO v_plano FROM public.profiles WHERE id = _user_id;

  -- A regra só vale para quem é convidado. Cliente não precisa se manter.
  IF v_plano IS DISTINCT FROM 'insider_convidado' THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.indicacoes
    WHERE indicador_id = _user_id
      AND qualificada_em IS NOT NULL
      AND qualificada_em >= now() - v_janela
  ) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.parcerias
    WHERE user_id = _user_id
      AND status = 'vigente'
      AND (vigencia_fim IS NULL OR vigencia_fim >= current_date)
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.programa_papeis     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacao_eventos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_catalogo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recompensas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcerias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mural_oportunidades ENABLE ROW LEVEL SECURITY;

-- programa_papeis: a pessoa lê o próprio; só a equipe escreve.
DROP POLICY IF EXISTS papeis_leitura_propria ON public.programa_papeis;
CREATE POLICY papeis_leitura_propria ON public.programa_papeis
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

DROP POLICY IF EXISTS papeis_escrita_equipe ON public.programa_papeis;
CREATE POLICY papeis_escrita_equipe ON public.programa_papeis
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- convites: quem gerou acompanha o seu; a equipe vê tudo.
DROP POLICY IF EXISTS convites_leitura ON public.convites;
CREATE POLICY convites_leitura ON public.convites
  FOR SELECT USING (
    gerado_por = auth.uid() OR creditar_a = auth.uid()
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );

-- Cliente gera convite, mas o papel é decisão da equipe: a tela do cliente
-- manda o convite para uma edge function, que escreve com service role.
DROP POLICY IF EXISTS convites_escrita_equipe ON public.convites;
CREATE POLICY convites_escrita_equipe ON public.convites
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- indicacoes: a pessoa vê e cria as suas; só a equipe muda status e valor.
DROP POLICY IF EXISTS indicacoes_leitura ON public.indicacoes;
CREATE POLICY indicacoes_leitura ON public.indicacoes
  FOR SELECT USING (
    indicador_id = auth.uid() OR responsavel_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );

DROP POLICY IF EXISTS indicacoes_criacao_propria ON public.indicacoes;
CREATE POLICY indicacoes_criacao_propria ON public.indicacoes
  FOR INSERT WITH CHECK (indicador_id = auth.uid() AND public.tem_papel_programa(auth.uid()));

DROP POLICY IF EXISTS indicacoes_gestao_equipe ON public.indicacoes;
CREATE POLICY indicacoes_gestao_equipe ON public.indicacoes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

DROP POLICY IF EXISTS indicacoes_remocao_equipe ON public.indicacoes;
CREATE POLICY indicacoes_remocao_equipe ON public.indicacoes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- indicacao_eventos: acompanha a visibilidade da indicação.
DROP POLICY IF EXISTS eventos_leitura ON public.indicacao_eventos;
CREATE POLICY eventos_leitura ON public.indicacao_eventos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.indicacoes i
    WHERE i.id = indicacao_id
      AND (i.indicador_id = auth.uid() OR i.responsavel_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  ));

DROP POLICY IF EXISTS eventos_escrita_equipe ON public.indicacao_eventos;
CREATE POLICY eventos_escrita_equipe ON public.indicacao_eventos
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- bonus_catalogo: quem está no programa lê; a equipe mantém.
DROP POLICY IF EXISTS bonus_leitura ON public.bonus_catalogo;
CREATE POLICY bonus_leitura ON public.bonus_catalogo
  FOR SELECT USING (ativo OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

DROP POLICY IF EXISTS bonus_escrita_equipe ON public.bonus_catalogo;
CREATE POLICY bonus_escrita_equipe ON public.bonus_catalogo
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- recompensas: a pessoa vê a sua e escolhe a forma; valor e pagamento são da equipe.
DROP POLICY IF EXISTS recompensas_leitura ON public.recompensas;
CREATE POLICY recompensas_leitura ON public.recompensas
  FOR SELECT USING (
    beneficiario_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );

DROP POLICY IF EXISTS recompensas_escolha_propria ON public.recompensas;
CREATE POLICY recompensas_escolha_propria ON public.recompensas
  FOR UPDATE USING (beneficiario_id = auth.uid() AND status = 'prevista')
  WITH CHECK (beneficiario_id = auth.uid() AND status IN ('prevista', 'escolhida'));

DROP POLICY IF EXISTS recompensas_gestao_equipe ON public.recompensas;
CREATE POLICY recompensas_gestao_equipe ON public.recompensas
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- parcerias: a pessoa lê o próprio contrato; a equipe mantém.
DROP POLICY IF EXISTS parcerias_leitura ON public.parcerias;
CREATE POLICY parcerias_leitura ON public.parcerias
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );

DROP POLICY IF EXISTS parcerias_escrita_equipe ON public.parcerias;
CREATE POLICY parcerias_escrita_equipe ON public.parcerias
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- mural: quem está no espaço Insiders lê; cada um cuida do que publicou.
DROP POLICY IF EXISTS mural_leitura_insiders ON public.mural_oportunidades;
CREATE POLICY mural_leitura_insiders ON public.mural_oportunidades
  FOR SELECT USING (
    (ativo AND public.user_is_insider(auth.uid()))
    OR autor_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );

DROP POLICY IF EXISTS mural_escrita_propria ON public.mural_oportunidades;
CREATE POLICY mural_escrita_propria ON public.mural_oportunidades
  FOR INSERT WITH CHECK (autor_id = auth.uid() AND public.user_is_insider(auth.uid()));

DROP POLICY IF EXISTS mural_edicao_propria ON public.mural_oportunidades;
CREATE POLICY mural_edicao_propria ON public.mural_oportunidades
  FOR UPDATE USING (autor_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (autor_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

DROP POLICY IF EXISTS mural_remocao ON public.mural_oportunidades;
CREATE POLICY mural_remocao ON public.mural_oportunidades
  FOR DELETE USING (autor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Conferência depois de rodar
-- ---------------------------------------------------------------------------
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN ('programa_papeis','convites','indicacoes','indicacao_eventos',
--                       'bonus_catalogo','recompensas','parcerias','mural_oportunidades');
-- SELECT public.programa_permanencia_ok(auth.uid());
--
-- Papel de quem não é Insider deve ser recusado:
-- INSERT INTO public.programa_papeis (user_id, papel)
--   SELECT id, 'indicador' FROM public.profiles WHERE plano_mentoria = 'academy' LIMIT 1;
-- -> ERROR: Só Insider Business ou Insider Convidado participam do programa.
