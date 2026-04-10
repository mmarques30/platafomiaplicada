
-- 1) Notificar admins quando um novo documento é adicionado
CREATE OR REPLACE FUNCTION public.notificar_admin_novo_documento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_ids UUID[];
  v_user_id UUID;
  v_nome_empresa TEXT;
BEGIN
  -- Buscar user_id e nome_empresa do contrato
  SELECT cb.user_id, cb.nome_empresa INTO v_user_id, v_nome_empresa
  FROM contratos_business cb
  WHERE cb.id = NEW.contrato_id;

  -- Buscar admins
  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles WHERE role = 'admin'::app_role;

  -- Ignorar se quem inseriu é admin
  IF auth.uid() = ANY(admin_ids) THEN
    RETURN NEW;
  END IF;

  INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
  SELECT
    unnest(admin_ids),
    'info',
    'Novo documento adicionado',
    COALESCE(v_nome_empresa, 'Mentorado') || ' adicionou o documento "' || NEW.titulo || '"',
    '/admin/mentoria?user=' || v_user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_admin_novo_documento
AFTER INSERT ON public.documentos_business
FOR EACH ROW EXECUTE FUNCTION public.notificar_admin_novo_documento();

-- 2) Notificar admins quando uma nova nota é criada
CREATE OR REPLACE FUNCTION public.notificar_admin_nova_nota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_ids UUID[];
  v_user_id UUID;
  v_nome_empresa TEXT;
BEGIN
  SELECT cb.user_id, cb.nome_empresa INTO v_user_id, v_nome_empresa
  FROM contratos_business cb
  WHERE cb.id = NEW.contrato_id;

  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles WHERE role = 'admin'::app_role;

  IF auth.uid() = ANY(admin_ids) THEN
    RETURN NEW;
  END IF;

  INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
  SELECT
    unnest(admin_ids),
    'info',
    'Nova anotação adicionada',
    COALESCE(v_nome_empresa, 'Mentorado') || ' criou a anotação "' || COALESCE(NEW.titulo, 'Sem título') || '"',
    '/admin/mentoria?user=' || v_user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_admin_nova_nota
AFTER INSERT ON public.notas_projeto_business
FOR EACH ROW EXECUTE FUNCTION public.notificar_admin_nova_nota();

-- 3) Notificar admins quando um novo link é adicionado
CREATE OR REPLACE FUNCTION public.notificar_admin_novo_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_ids UUID[];
  v_user_id UUID;
  v_nome_empresa TEXT;
BEGIN
  SELECT cb.user_id, cb.nome_empresa INTO v_user_id, v_nome_empresa
  FROM contratos_business cb
  WHERE cb.id = NEW.contrato_id;

  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles WHERE role = 'admin'::app_role;

  IF auth.uid() = ANY(admin_ids) THEN
    RETURN NEW;
  END IF;

  INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
  SELECT
    unnest(admin_ids),
    'info',
    'Novo link adicionado',
    COALESCE(v_nome_empresa, 'Mentorado') || ' adicionou o link "' || NEW.titulo || '"',
    '/admin/mentoria?user=' || v_user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notificar_admin_novo_link
AFTER INSERT ON public.links_business
FOR EACH ROW EXECUTE FUNCTION public.notificar_admin_novo_link();
