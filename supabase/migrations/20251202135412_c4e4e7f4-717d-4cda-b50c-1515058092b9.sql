-- Corrigir o trigger notificar_novo_visitante para usar tipo válido
CREATE OR REPLACE FUNCTION public.notificar_novo_visitante()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Só notifica se for visitante
  IF NEW.is_visitante = true THEN
    -- Buscar todos os admins
    SELECT ARRAY_AGG(user_id) INTO admin_ids
    FROM user_roles
    WHERE role = 'admin'::app_role;
    
    -- Criar notificação para cada admin (usando 'info' como tipo válido)
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    SELECT 
      unnest(admin_ids),
      'info',
      'Novo visitante cadastrado',
      'Visitante: ' || NEW.nome_completo || ' (' || COALESCE(NEW.email, 'sem email') || ')',
      '/admin/visitantes';
  END IF;
  
  RETURN NEW;
END;
$$;