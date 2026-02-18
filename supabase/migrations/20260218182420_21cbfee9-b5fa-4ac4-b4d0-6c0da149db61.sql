-- Fix mutable search_path on functions that don't have it set

CREATE OR REPLACE FUNCTION public.atualizar_status_tarefa()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.status IN ('pendente', 'em_andamento') AND NEW.prazo_entrega < CURRENT_DATE THEN
    NEW.status := 'atrasada';
  END IF;
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    NEW.data_conclusao := NOW();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.atualizar_total_respostas()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.completado = true AND OLD.completado = false) THEN
    UPDATE formularios_customizados
    SET total_respostas = total_respostas + 1
    WHERE id = NEW.formulario_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_prazo_sla()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.prazo_sla := calcular_prazo_sla(NEW.user_id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_sla_atrasada()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.status IN ('pendente', 'em_analise') AND NEW.prazo_sla < NOW() THEN
    NEW.atrasada := true;
    NEW.horas_para_vencer := EXTRACT(EPOCH FROM (NEW.prazo_sla - NOW())) / 3600;
  ELSIF NEW.status = 'respondida' THEN
    NEW.atrasada := false;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Also fix notificar_novo_formulario which has SECURITY DEFINER but no search_path
CREATE OR REPLACE FUNCTION public.notificar_novo_formulario()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  mentorado_id UUID;
BEGIN
  IF NEW.visibilidade = 'todos' THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    SELECT 
      p.id,
      'formulario',
      'Novo formulário disponível',
      'O formulário "' || NEW.titulo || '" está disponível para resposta',
      '/mentoria/formularios/' || NEW.id
    FROM profiles p
    WHERE p.id != NEW.created_by;
  ELSIF NEW.visibilidade = 'especificos' THEN
    FOR mentorado_id IN 
      SELECT (value::text)::uuid 
      FROM jsonb_array_elements_text(NEW.mentorados_ids)
    LOOP
      INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
      VALUES (
        mentorado_id,
        'formulario',
        'Novo formulário disponível',
        'O formulário "' || NEW.titulo || '" está disponível para resposta',
        '/mentoria/formularios/' || NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix registrar_auditoria which has SECURITY DEFINER but no search_path
CREATE OR REPLACE FUNCTION public.registrar_auditoria()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  campos_alterados TEXT[] := ARRAY[]::TEXT[];
  col_name TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    FOR col_name IN 
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME
        AND column_name NOT IN ('updated_at', 'created_at')
    LOOP
      IF to_jsonb(OLD) -> col_name IS DISTINCT FROM to_jsonb(NEW) -> col_name THEN
        campos_alterados := array_append(campos_alterados, col_name);
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.auditoria_conteudo (
    tabela, registro_id, operacao, user_id, dados_anteriores, dados_novos, campos_alterados
  ) VALUES (
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    campos_alterados
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;