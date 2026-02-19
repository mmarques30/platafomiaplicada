
-- Função para sincronizar título de trilha nos JSONB de projetos_mentoria
CREATE OR REPLACE FUNCTION public.sync_trilha_titulo_projetos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  proj RECORD;
  i INTEGER;
  arr jsonb;
  updated_arr jsonb;
  elem jsonb;
  changed BOOLEAN;
BEGIN
  IF OLD.titulo = NEW.titulo THEN
    RETURN NEW;
  END IF;

  -- Atualizar trilhas_recomendadas
  FOR proj IN
    SELECT id, trilhas_recomendadas
    FROM projetos_mentoria
    WHERE trilhas_recomendadas IS NOT NULL
      AND trilhas_recomendadas::text LIKE '%' || OLD.id::text || '%'
  LOOP
    arr := proj.trilhas_recomendadas;
    updated_arr := '[]'::jsonb;
    changed := false;
    FOR i IN 0..jsonb_array_length(arr) - 1 LOOP
      elem := arr->i;
      IF (elem->>'trilha_id') = OLD.id::text THEN
        elem := jsonb_set(elem, '{titulo}', to_jsonb(NEW.titulo));
        changed := true;
      END IF;
      updated_arr := updated_arr || jsonb_build_array(elem);
    END LOOP;
    IF changed THEN
      UPDATE projetos_mentoria SET trilhas_recomendadas = updated_arr, updated_at = NOW() WHERE id = proj.id;
    END IF;
  END LOOP;

  -- Atualizar trilha_titulo em modulos_obrigatorios (se existir campo trilha_id referenciando esta trilha)
  FOR proj IN
    SELECT id, modulos_obrigatorios
    FROM projetos_mentoria
    WHERE modulos_obrigatorios IS NOT NULL
      AND modulos_obrigatorios::text LIKE '%' || OLD.id::text || '%'
  LOOP
    arr := proj.modulos_obrigatorios;
    updated_arr := '[]'::jsonb;
    changed := false;
    FOR i IN 0..jsonb_array_length(arr) - 1 LOOP
      elem := arr->i;
      IF (elem->>'trilha_id') = OLD.id::text AND elem ? 'trilha_titulo' THEN
        elem := jsonb_set(elem, '{trilha_titulo}', to_jsonb(NEW.titulo));
        changed := true;
      END IF;
      updated_arr := updated_arr || jsonb_build_array(elem);
    END LOOP;
    IF changed THEN
      UPDATE projetos_mentoria SET modulos_obrigatorios = updated_arr, updated_at = NOW() WHERE id = proj.id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Função para sincronizar título de módulo nos JSONB de projetos_mentoria
CREATE OR REPLACE FUNCTION public.sync_modulo_titulo_projetos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  proj RECORD;
  i INTEGER;
  arr jsonb;
  updated_arr jsonb;
  elem jsonb;
  changed BOOLEAN;
BEGIN
  IF OLD.titulo = NEW.titulo THEN
    RETURN NEW;
  END IF;

  FOR proj IN
    SELECT id, modulos_obrigatorios
    FROM projetos_mentoria
    WHERE modulos_obrigatorios IS NOT NULL
      AND modulos_obrigatorios::text LIKE '%' || OLD.id::text || '%'
  LOOP
    arr := proj.modulos_obrigatorios;
    updated_arr := '[]'::jsonb;
    changed := false;
    FOR i IN 0..jsonb_array_length(arr) - 1 LOOP
      elem := arr->i;
      IF (elem->>'modulo_id') = OLD.id::text THEN
        elem := jsonb_set(elem, '{titulo}', to_jsonb(NEW.titulo));
        changed := true;
      END IF;
      updated_arr := updated_arr || jsonb_build_array(elem);
    END LOOP;
    IF changed THEN
      UPDATE projetos_mentoria SET modulos_obrigatorios = updated_arr, updated_at = NOW() WHERE id = proj.id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER on_trilha_rename
  AFTER UPDATE OF titulo ON public.trilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_trilha_titulo_projetos();

CREATE TRIGGER on_modulo_rename
  AFTER UPDATE OF titulo ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_modulo_titulo_projetos();
