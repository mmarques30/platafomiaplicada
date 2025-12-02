-- Tabela para registrar tentativas de signup
CREATE TABLE public.signup_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT,
  telefone TEXT,
  sucesso BOOLEAN NOT NULL DEFAULT false,
  erro_mensagem TEXT,
  ip_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver os logs
CREATE POLICY "Admins podem ver signup_attempts"
ON public.signup_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Qualquer um pode inserir (para registrar tentativas)
CREATE POLICY "Qualquer um pode inserir signup_attempts"
ON public.signup_attempts
FOR INSERT
WITH CHECK (true);

-- Trigger para notificar admin quando novo visitante é criado
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
    
    -- Criar notificação para cada admin
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    SELECT 
      unnest(admin_ids),
      'cadastro',
      'Novo visitante cadastrado',
      'Visitante: ' || NEW.nome_completo || ' (' || COALESCE(NEW.email, 'sem email') || ')',
      '/admin/visitantes';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela profiles
CREATE TRIGGER on_new_visitor_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_novo_visitante();