-- Reestruturação dos planos/ambientes da plataforma.
--
-- Antes: Gratuito, Academy, Builder (business_parceria) e System (business_sistemas).
-- Agora:
--   * Não existe mais acesso gratuito. Cadastros gratuitos (is_visitante /
--     sem plano) permanecem na base, mas o app os direciona para /sem-acesso.
--   * Builder deixa de existir: quem era Builder passa a ser Academy.
--   * System passa a se chamar Insider (pago). O valor do enum
--     business_sistemas é mantido para não impactar ninguém que já paga.
--   * Novo plano insider_free: Insider não pago ("outra visão", a definir).
--
-- Idempotente: pode rodar mais de uma vez sem efeito colateral.
--
-- O tipo enum da coluna profiles.plano_mentoria já foi criado/renomeado mais
-- de uma vez ao longo das migrations. Por isso o passo 1 descobre o tipo real
-- da coluna em vez de assumir o nome "public.plano_mentoria". Se a coluna não
-- existir, a migração para com uma mensagem clara (banco errado).

-- 1. Novo valor de plano para o Insider não pago.
DO $$
DECLARE
  v_type_oid oid;
  v_schema   text;
  v_name     text;
  v_kind     "char";
BEGIN
  SELECT a.atttypid
    INTO v_type_oid
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'profiles'
    AND a.attname = 'plano_mentoria'
    AND NOT a.attisdropped;

  IF v_type_oid IS NULL THEN
    RAISE EXCEPTION 'Coluna public.profiles.plano_mentoria não existe neste banco. Confira se este é o projeto da plataforma.';
  END IF;

  SELECT n.nspname, t.typname, t.typtype
    INTO v_schema, v_name, v_kind
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE t.oid = v_type_oid;

  IF v_kind = 'e' THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum WHERE enumtypid = v_type_oid AND enumlabel = 'insider_free'
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', v_schema, v_name, 'insider_free');
    END IF;
  END IF;
  -- Se a coluna for texto, nada a fazer: qualquer valor é aceito.
END
$$;

-- 2. Builder (e o alias legado 'business') vira Academy.
UPDATE public.profiles
SET plano_mentoria = 'academy'
WHERE plano_mentoria::text IN ('business_parceria', 'business');

-- 3. Alias legado do System vira o valor canônico do Insider pago.
UPDATE public.profiles
SET plano_mentoria = 'business_sistemas'
WHERE plano_mentoria::text = 'business_iaplicada';
