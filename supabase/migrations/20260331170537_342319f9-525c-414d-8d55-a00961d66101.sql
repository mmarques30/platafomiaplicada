
-- 1. Update the tipo CHECK constraint to allow new notification types
ALTER TABLE public.notificacoes DROP CONSTRAINT notificacoes_tipo_check;
ALTER TABLE public.notificacoes ADD CONSTRAINT notificacoes_tipo_check 
  CHECK (tipo = ANY (ARRAY['info'::text, 'alerta'::text, 'novo_conteudo'::text, 'urgente'::text, 'entrega'::text, 'tarefa'::text, 'sessao'::text, 'duvida'::text, 'formulario'::text]));

-- 2. Trigger function: nova entrega criada
CREATE OR REPLACE FUNCTION public.notificar_nova_entrega_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM contratos_business WHERE id = NEW.contrato_id;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    VALUES (v_user_id, 'entrega', 'Nova entrega: ' || NEW.titulo, 'Uma nova entrega foi adicionada ao seu projeto.', '/mentoria');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_nova_entrega_business
AFTER INSERT ON public.entregas_business
FOR EACH ROW EXECUTE FUNCTION public.notificar_nova_entrega_business();

-- 3. Trigger function: tarefa urgente em tarefas_mentoria
CREATE OR REPLACE FUNCTION public.notificar_tarefa_urgente_mentoria()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.prioridade IN ('alta', 'critica', 'urgente') THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    VALUES (NEW.user_id, 'tarefa', 'Tarefa urgente adicionada: ' || NEW.titulo, 'Uma tarefa de prioridade ' || NEW.prioridade || ' foi criada.', '/mentoria/tarefas');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_tarefa_urgente_mentoria
AFTER INSERT ON public.tarefas_mentoria
FOR EACH ROW EXECUTE FUNCTION public.notificar_tarefa_urgente_mentoria();

-- 4. Trigger function: tarefa urgente em tasks_business
CREATE OR REPLACE FUNCTION public.notificar_tarefa_urgente_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.prioridade IN ('alta', 'critica', 'urgente') THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    VALUES (NEW.user_id, 'tarefa', 'Tarefa urgente adicionada: ' || NEW.titulo, 'Uma tarefa de prioridade ' || NEW.prioridade || ' foi criada.', '/mentoria/tarefas');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_tarefa_urgente_business
AFTER INSERT ON public.tasks_business
FOR EACH ROW EXECUTE FUNCTION public.notificar_tarefa_urgente_business();

-- 5. Trigger function: sessão agendada ou horário alterado
CREATE OR REPLACE FUNCTION public.notificar_sessao_mentoria()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    VALUES (NEW.user_id, 'sessao', 'Sessão confirmada: ' || to_char(NEW.data_sessao AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY "às" HH24:MI'), 'Uma nova sessão de mentoria foi agendada.', '/mentoria');
  ELSIF TG_OP = 'UPDATE' AND OLD.data_sessao IS DISTINCT FROM NEW.data_sessao THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    VALUES (NEW.user_id, 'sessao', 'Sessão reagendada: ' || to_char(NEW.data_sessao AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY "às" HH24:MI'), 'O horário da sua sessão foi alterado.', '/mentoria');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_sessao_mentoria
AFTER INSERT OR UPDATE ON public.sessoes_mentoria
FOR EACH ROW EXECUTE FUNCTION public.notificar_sessao_mentoria();

-- 6. Trigger function: status de entrega atualizado
CREATE OR REPLACE FUNCTION public.notificar_status_entrega_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT user_id INTO v_user_id FROM contratos_business WHERE id = NEW.contrato_id;
    IF v_user_id IS NOT NULL THEN
      INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
      VALUES (v_user_id, 'entrega', 'Sua entrega "' || NEW.titulo || '" foi marcada como ' || NEW.status, 'O status da sua entrega foi atualizado.', '/mentoria');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_status_entrega_business
AFTER UPDATE ON public.entregas_business
FOR EACH ROW EXECUTE FUNCTION public.notificar_status_entrega_business();
