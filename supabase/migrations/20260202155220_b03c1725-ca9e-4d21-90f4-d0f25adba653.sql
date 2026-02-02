-- Parte 1: Adicionar campos na tabela profiles para controle de expiração
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS acesso_expira_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS acesso_expirado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cupom_especial VARCHAR(50);

-- Parte 2: Criar tabela para notificações de expiração
CREATE TABLE public.visitor_expiration_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notice_type VARCHAR(20) NOT NULL,
  shown_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notice_type)
);

-- RLS para visitor_expiration_notices
ALTER TABLE public.visitor_expiration_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem suas notificacoes" ON public.visitor_expiration_notices
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Sistema insere notificacoes" ON public.visitor_expiration_notices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Usuarios atualizam suas notificacoes" ON public.visitor_expiration_notices
  FOR UPDATE USING (auth.uid() = user_id);

-- Parte 3: Trigger para definir data de expiração no cadastro de visitante
CREATE OR REPLACE FUNCTION set_visitor_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_visitante = true AND OLD IS NULL THEN
    NEW.acesso_expira_em := COALESCE(NEW.created_at, NOW()) + INTERVAL '30 days';
    NEW.cupom_especial := 'Academy12';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_set_visitor_expiration
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_visitor_expiration();

-- Parte 4: Função para verificar engajamento do visitante
CREATE OR REPLACE FUNCTION check_visitor_engagement(visitor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  unique_days INTEGER;
  two_weeks_ago TIMESTAMP := NOW() - INTERVAL '14 days';
BEGIN
  SELECT COUNT(DISTINCT DATE(accessed_at))
  INTO unique_days
  FROM content_access_logs cal
  JOIN profiles p ON cal.user_email = p.email
  WHERE p.id = visitor_id
    AND cal.accessed_at >= two_weeks_ago;
    
  RETURN COALESCE(unique_days, 0) >= 4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Parte 5: Atualizar visitantes existentes com data de expiração
UPDATE public.profiles
SET 
  acesso_expira_em = created_at + INTERVAL '30 days',
  cupom_especial = 'Academy12'
WHERE is_visitante = true 
  AND acesso_expira_em IS NULL;