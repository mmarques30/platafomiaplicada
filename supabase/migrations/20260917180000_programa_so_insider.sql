-- O programa é só de Insider: cliente Academy não tem papel.
--
-- Arquivo separado de propósito. A migração 20260917170000 pode já ter rodado
-- no ambiente, e migração aplicada não roda de novo por ser editada.
--
-- Idempotente: CREATE OR REPLACE nas funções, DROP IF EXISTS nos gatilhos.

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

-- Conferência depois de rodar. O insert abaixo deve falhar:
--
-- INSERT INTO public.programa_papeis (user_id, papel)
--   SELECT id, 'indicador' FROM public.profiles WHERE plano_mentoria = 'academy' LIMIT 1;
-- -> ERROR: Só Insider Business ou Insider Convidado participam do programa.
