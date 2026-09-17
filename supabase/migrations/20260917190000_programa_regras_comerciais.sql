-- As regras comerciais do IAplicada Indica, lidas do material do programa.
--
-- O modelo anterior foi escrito antes de eu ver o material, e três coisas
-- estavam erradas ou faltando:
--
--   1. A recompensa não é um valor fixo. É percentual progressivo: base por
--      formato, mais 1 ponto a cada fechamento, até um teto. O percentual
--      precisa ser CONGELADO no fechamento, pela mesma razão que o crédito é
--      gravado: recalcular depois muda dinheiro já prometido.
--   2. O pagamento não é único. "Liberado conforme o indicado paga" aparece
--      nos três formatos, então uma recompensa tem parcelas.
--   3. A permanência não é a janela de 90 dias que eu tinha inventado. O
--      material fala em volume mensal, e ele varia por formato: mínimo 1
--      nome por mês na Indicação Simples, 5 na Parceria Aberta.
--
-- Os números ficam em tabela, não em função, porque são decisão comercial e
-- vão mudar sem envolver quem mexe no banco.

-- ---------------------------------------------------------------------------
-- programa_regras: a tabela de comparação do material, em dados
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_regras (
  papel                 public.papel_programa PRIMARY KEY,
  rotulo                text NOT NULL,
  percentual_base       numeric(5,2),
  percentual_incremento numeric(5,2) NOT NULL DEFAULT 0,
  percentual_teto       numeric(5,2),
  volume_minimo_mes     integer,
  exige_contrato        boolean NOT NULL DEFAULT false,
  renovacao_meses       integer,
  observacao            text,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.programa_regras.percentual_teto IS
  'Onde a progressão para. Ao atingir, a pessoa muda de categoria. Valor ainda não definido pelo negócio, por isso nulo.';

INSERT INTO public.programa_regras
  (papel, rotulo, percentual_base, percentual_incremento, percentual_teto,
   volume_minimo_mes, exige_contrato, renovacao_meses, observacao)
VALUES
  ('indicador', 'Indicação Simples', 4.00, 1.00, NULL, 1, false, NULL,
   'Escolhe entre aditivo do próprio sistema ou cashback progressivo. Não abre a base; a abordagem é da pessoa.'),
  ('parceria_aberta', 'Parceria Aberta', 6.00, 1.00, NULL, 5, true, 6,
   'Abre a base para a IAplicada, que conduz proposta e fechamento. Sem exclusividade.'),
  ('parceria_executora', 'Parceria Executora', NULL, 0, NULL, NULL, true, NULL,
   'Split negociado por projeto. A pessoa vende como produto próprio e a IAplicada implementa. Sem meta.')
ON CONFLICT (papel) DO UPDATE SET
  rotulo                = EXCLUDED.rotulo,
  percentual_base       = EXCLUDED.percentual_base,
  percentual_incremento = EXCLUDED.percentual_incremento,
  volume_minimo_mes     = EXCLUDED.volume_minimo_mes,
  exige_contrato        = EXCLUDED.exige_contrato,
  renovacao_meses       = EXCLUDED.renovacao_meses,
  observacao            = EXCLUDED.observacao,
  updated_at            = now();
-- percentual_teto fica de fora do UPDATE de propósito: quando o negócio
-- definir o valor, ele não é sobrescrito por uma reexecução desta migração.

-- ---------------------------------------------------------------------------
-- recompensas: o percentual congelado, e a base sobre a qual ele incide
-- ---------------------------------------------------------------------------
ALTER TABLE public.recompensas
  ADD COLUMN IF NOT EXISTS valor_base        numeric(12,2),
  ADD COLUMN IF NOT EXISTS percentual        numeric(5,2),
  ADD COLUMN IF NOT EXISTS ordem_fechamento  integer;

COMMENT ON COLUMN public.recompensas.percentual IS
  'A taxa aplicada, gravada no fechamento. Nunca recalculada: a progressão muda a taxa das próximas, não das que já fecharam.';
COMMENT ON COLUMN public.recompensas.ordem_fechamento IS
  'Qual fechamento deste beneficiário este é: 1 para o primeiro, 2 para o segundo. É o que define a taxa.';
COMMENT ON COLUMN public.recompensas.valor IS
  'Total devido. Em cashback, valor_base * percentual. Em bônus, o valor de referência do item.';

-- ---------------------------------------------------------------------------
-- recompensa_parcelas: "liberado conforme o indicado paga"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recompensa_parcelas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recompensa_id uuid NOT NULL REFERENCES public.recompensas(id) ON DELETE CASCADE,
  valor         numeric(12,2) NOT NULL,
  previsto_para date,
  pago_em       date,
  observacao    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parcela_valor_positivo CHECK (valor > 0)
);

CREATE INDEX IF NOT EXISTS parcelas_recompensa_idx ON public.recompensa_parcelas (recompensa_id, previsto_para);
CREATE INDEX IF NOT EXISTS parcelas_em_aberto_idx ON public.recompensa_parcelas (previsto_para) WHERE pago_em IS NULL;

DROP TRIGGER IF EXISTS set_updated_at_recompensa_parcelas ON public.recompensa_parcelas;
CREATE TRIGGER set_updated_at_recompensa_parcelas
  BEFORE UPDATE ON public.recompensa_parcelas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_programa_regras ON public.programa_regras;
CREATE TRIGGER set_updated_at_programa_regras
  BEFORE UPDATE ON public.programa_regras
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- bonus_catalogo: o aditivo tem teto e prazo próprios
-- ---------------------------------------------------------------------------
ALTER TABLE public.bonus_catalogo
  ADD COLUMN IF NOT EXISTS prazo_entrega_dias integer;

COMMENT ON COLUMN public.bonus_catalogo.valor_referencia IS
  'Teto do benefício. No aditivo do sistema, R$ 3.000.';

INSERT INTO public.bonus_catalogo (nome, descricao, valor_referencia, prazo_entrega_dias, ordem)
SELECT 'Aditivo do seu sistema',
       'Automação ou módulo novo no que já rodamos para você.',
       3000.00, 45, 1
WHERE NOT EXISTS (SELECT 1 FROM public.bonus_catalogo WHERE nome = 'Aditivo do seu sistema');

-- ---------------------------------------------------------------------------
-- A taxa da próxima indicação que fechar
-- ---------------------------------------------------------------------------
--
-- base + incremento por fechamento anterior, limitado ao teto. Enquanto o
-- teto for nulo, a progressão não trava: quando o negócio definir o valor,
-- basta preencher a coluna.
CREATE OR REPLACE FUNCTION public.percentual_da_proxima(_user_id uuid DEFAULT auth.uid())
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_papel  papel_programa;
  v_regra  programa_regras%ROWTYPE;
  v_ja     integer;
  v_taxa   numeric(5,2);
BEGIN
  v_papel := public.papel_vigente(_user_id);
  IF v_papel IS NULL THEN RETURN NULL; END IF;

  SELECT * INTO v_regra FROM public.programa_regras WHERE papel = v_papel;
  IF v_regra.percentual_base IS NULL THEN
    RETURN NULL;  -- executora é split negociado, não tem taxa de tabela
  END IF;

  SELECT count(*) INTO v_ja
  FROM public.indicacoes
  WHERE indicador_id = _user_id AND status = 'fechada';

  v_taxa := v_regra.percentual_base + (v_regra.percentual_incremento * v_ja);

  IF v_regra.percentual_teto IS NOT NULL THEN
    v_taxa := least(v_taxa, v_regra.percentual_teto);
  END IF;

  RETURN v_taxa;
END;
$$;

-- ---------------------------------------------------------------------------
-- Permanência, agora com o número do material
-- ---------------------------------------------------------------------------
--
-- Substitui a janela de 90 dias que eu tinha inventado. O critério agora é o
-- volume mensal do formato: 1 nome por mês na Indicação Simples, 5 na
-- Parceria Aberta, sem mínimo na Executora.
--
-- Continua valendo só para o Insider Convidado: cliente não precisa se manter.
-- Contrato de parceria vigente também mantém, como antes.
CREATE OR REPLACE FUNCTION public.programa_permanencia_ok(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plano  plano_mentoria;
  v_papel  papel_programa;
  v_minimo integer;
  v_trazidas integer;
BEGIN
  SELECT plano_mentoria INTO v_plano FROM public.profiles WHERE id = _user_id;

  IF v_plano IS DISTINCT FROM 'insider_convidado' THEN
    RETURN true;
  END IF;

  -- Contrato de parceria vigente mantém, independente de volume.
  IF EXISTS (
    SELECT 1 FROM public.parcerias
    WHERE user_id = _user_id
      AND status = 'vigente'
      AND (vigencia_fim IS NULL OR vigencia_fim >= current_date)
  ) THEN
    RETURN true;
  END IF;

  v_papel := public.papel_vigente(_user_id);
  IF v_papel IS NULL THEN RETURN false; END IF;

  SELECT volume_minimo_mes INTO v_minimo FROM public.programa_regras WHERE papel = v_papel;
  IF v_minimo IS NULL THEN RETURN true; END IF;  -- formato sem mínimo

  -- Conta o que entrou no mês corrente. Vale a data em que a indicação foi
  -- trazida, não a em que fechou: fechar não depende de quem indicou.
  SELECT count(*) INTO v_trazidas
  FROM public.indicacoes
  WHERE indicador_id = _user_id
    AND created_at >= date_trunc('month', now());

  RETURN v_trazidas >= v_minimo;
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.programa_regras     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recompensa_parcelas ENABLE ROW LEVEL SECURITY;

-- As regras são públicas para quem está no programa: a pessoa precisa saber
-- a taxa dela antes de indicar.
DROP POLICY IF EXISTS regras_leitura ON public.programa_regras;
CREATE POLICY regras_leitura ON public.programa_regras
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS regras_escrita_equipe ON public.programa_regras;
CREATE POLICY regras_escrita_equipe ON public.programa_regras
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- Parcela acompanha a visibilidade da recompensa.
DROP POLICY IF EXISTS parcelas_leitura ON public.recompensa_parcelas;
CREATE POLICY parcelas_leitura ON public.recompensa_parcelas
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.recompensas r
    WHERE r.id = recompensa_id
      AND (r.beneficiario_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  ));

DROP POLICY IF EXISTS parcelas_escrita_equipe ON public.recompensa_parcelas;
CREATE POLICY parcelas_escrita_equipe ON public.recompensa_parcelas
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe'));

-- ---------------------------------------------------------------------------
-- Conferência depois de rodar
-- ---------------------------------------------------------------------------
-- SELECT papel, rotulo, percentual_base, percentual_incremento, percentual_teto,
--        volume_minimo_mes, exige_contrato, renovacao_meses
--   FROM public.programa_regras ORDER BY papel;
--
-- Deve devolver 4.00 para quem é indicador sem nenhum fechamento:
-- SELECT public.percentual_da_proxima('<user_id>');
