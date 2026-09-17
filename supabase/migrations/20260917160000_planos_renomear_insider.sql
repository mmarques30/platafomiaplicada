-- Planos passam a se chamar pelo nome do negócio.
--
--   business_sistemas  ->  insider_business    (quem é cliente)
--   insider_free       ->  insider_convidado   (tem papel no programa, ainda não é cliente)
--
-- Rename de verdade, não alias: o valor do enum muda, e tudo que cita o valor
-- antigo é reescrito junto. Os dados seguem sozinhos, porque renomear um label
-- de enum não reescreve linha nenhuma.
--
-- Idempotente: se os nomes novos já estiverem no lugar, cada passo vira no-op.
--
-- O tipo da coluna profiles.plano_mentoria já foi criado e renomeado mais de
-- uma vez nesta base, então o passo 1 descobre o tipo real em vez de assumir
-- "public.plano_mentoria". Se a coluna for texto em algum ambiente, o passo 2
-- cobre com UPDATE.

-- ---------------------------------------------------------------------------
-- 1. Renomear os labels do enum
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_type_oid oid;
  v_schema   text;
  v_name     text;
  v_kind     "char";
  v_par      record;
BEGIN
  SELECT a.atttypid INTO v_type_oid
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'profiles'
    AND a.attname = 'plano_mentoria'
    AND NOT a.attisdropped;

  IF v_type_oid IS NULL THEN
    RAISE EXCEPTION 'Coluna public.profiles.plano_mentoria não existe. Confira se este é o banco da plataforma.';
  END IF;

  SELECT n.nspname, t.typname, t.typtype INTO v_schema, v_name, v_kind
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE t.oid = v_type_oid;

  IF v_kind <> 'e' THEN
    RAISE NOTICE 'plano_mentoria não é enum neste banco; o passo 2 cuida dos valores.';
    RETURN;
  END IF;

  FOR v_par IN
    SELECT * FROM (VALUES
      ('business_sistemas', 'insider_business'),
      ('insider_free',      'insider_convidado')
    ) AS t(antigo, novo)
  LOOP
    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = v_type_oid AND enumlabel = v_par.antigo)
       AND NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = v_type_oid AND enumlabel = v_par.novo)
    THEN
      EXECUTE format('ALTER TYPE %I.%I RENAME VALUE %L TO %L',
                     v_schema, v_name, v_par.antigo, v_par.novo);
      RAISE NOTICE 'Plano % renomeado para %.', v_par.antigo, v_par.novo;
    END IF;
  END LOOP;
END
$$;

-- ---------------------------------------------------------------------------
-- 2. Se a coluna for texto em algum ambiente, os valores mudam na mão
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name = 'plano_mentoria' AND data_type = 'text'
  ) THEN
    UPDATE public.profiles SET plano_mentoria = 'insider_business'  WHERE plano_mentoria = 'business_sistemas';
    UPDATE public.profiles SET plano_mentoria = 'insider_convidado' WHERE plano_mentoria = 'insider_free';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. menu_config.planos_permitidos é TEXT[]: troca item a item
-- ---------------------------------------------------------------------------
UPDATE public.menu_config
SET planos_permitidos = array_replace(planos_permitidos, 'business_sistemas', 'insider_business'),
    updated_at = now()
WHERE planos_permitidos @> ARRAY['business_sistemas']::text[];

UPDATE public.menu_config
SET planos_permitidos = array_replace(planos_permitidos, 'insider_free', 'insider_convidado'),
    updated_at = now()
WHERE planos_permitidos @> ARRAY['insider_free']::text[];

-- ---------------------------------------------------------------------------
-- 4. Funções que citavam o valor antigo
-- ---------------------------------------------------------------------------

-- Quem alcança cada nível de acesso.
--
-- Mudança de conteúdo, além do rename: Insider Convidado NÃO entra em nenhum
-- nível. Ele não é cliente, não vê Academy nem Meu projeto. O que ele vê é o
-- espaço Insiders, e quem responde por isso é user_is_insider(), abaixo.
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan FROM profiles WHERE id = auth.uid();
  IF user_plan IS NULL THEN RETURN false; END IF;
  CASE required_level
    WHEN 'academy' THEN RETURN user_plan IN ('academy', 'skills', 'business_parceria', 'insider_business');
    WHEN 'skills'  THEN RETURN user_plan IN ('skills', 'business_parceria', 'insider_business');
    WHEN 'business' THEN RETURN user_plan IN ('business_parceria', 'insider_business');
    ELSE RETURN false;
  END CASE;
END;
$function$;

-- Prazo de SLA por plano.
CREATE OR REPLACE FUNCTION public.calcular_prazo_sla(plano plano_mentoria)
RETURNS timestamptz
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE prazo timestamptz;
BEGIN
  IF plano IN ('business_parceria', 'insider_business') THEN prazo := NOW() + INTERVAL '24 hours';
  ELSE prazo := NOW() + INTERVAL '48 hours';
  END IF;
  RETURN prazo;
END;
$function$;

-- ---------------------------------------------------------------------------
-- 5. Os dois predicados novos do espaço Insiders
-- ---------------------------------------------------------------------------

-- Está no espaço Insiders: cliente Insider ou convidado com papel.
CREATE OR REPLACE FUNCTION public.user_is_insider(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND plano_mentoria IN ('insider_business', 'insider_convidado')
  );
$$;

-- Conferência depois de rodar:
--
-- SELECT plano_mentoria, count(*) FROM public.profiles GROUP BY 1 ORDER BY 2 DESC;
-- SELECT menu_key, planos_permitidos FROM public.menu_config
--   WHERE planos_permitidos && ARRAY['insider_business','insider_convidado']::text[];
