-- Criar tabela de dúvidas da mentoria com SLA automático
CREATE TABLE duvidas_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Conteúdo
  titulo TEXT NOT NULL,
  duvida TEXT NOT NULL,
  contexto TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'em_analise', 'respondida', 'fechada')),
  prioridade TEXT NOT NULL DEFAULT 'normal' 
    CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  
  -- Resposta do mentor
  resposta_mentor TEXT,
  respondida_em TIMESTAMPTZ,
  respondida_por UUID REFERENCES profiles(id),
  
  -- SLA automático baseado no plano do mentorado
  prazo_sla TIMESTAMPTZ NOT NULL,
  atrasada BOOLEAN DEFAULT false,
  horas_para_vencer INTEGER,
  
  -- Tags
  tags JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_duvidas_user_id ON duvidas_mentoria(user_id);
CREATE INDEX idx_duvidas_status ON duvidas_mentoria(status);
CREATE INDEX idx_duvidas_atrasada ON duvidas_mentoria(atrasada) WHERE atrasada = true;

-- Função para calcular SLA baseado no plano
CREATE OR REPLACE FUNCTION calcular_prazo_sla(p_user_id UUID)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  plano plano_mentoria;
  prazo TIMESTAMPTZ;
BEGIN
  SELECT plano_mentoria INTO plano
  FROM profiles
  WHERE id = p_user_id;
  
  -- Premium: 24h | Light: 48h | Intensivo: 72h
  IF plano = 'premium' THEN
    prazo := NOW() + INTERVAL '24 hours';
  ELSIF plano = 'light' THEN
    prazo := NOW() + INTERVAL '48 hours';
  ELSE
    prazo := NOW() + INTERVAL '72 hours';
  END IF;
  
  RETURN prazo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para calcular prazo automaticamente ao inserir
CREATE OR REPLACE FUNCTION set_prazo_sla()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prazo_sla := calcular_prazo_sla(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_prazo_sla
BEFORE INSERT ON duvidas_mentoria
FOR EACH ROW EXECUTE FUNCTION set_prazo_sla();

-- Trigger para marcar como atrasada
CREATE OR REPLACE FUNCTION check_sla_atrasada()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_sla
BEFORE UPDATE ON duvidas_mentoria
FOR EACH ROW EXECUTE FUNCTION check_sla_atrasada();

-- RLS Policies
ALTER TABLE duvidas_mentoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own duvidas"
ON duvidas_mentoria FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own duvidas"
ON duvidas_mentoria FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own duvidas"
ON duvidas_mentoria FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can answer duvidas"
ON duvidas_mentoria FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Notificação automática ao admin
CREATE OR REPLACE FUNCTION notificar_nova_duvida()
RETURNS TRIGGER AS $$
DECLARE
  admin_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(user_id) INTO admin_ids
  FROM user_roles
  WHERE role = 'admin'::app_role;
  
  INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
  SELECT 
    unnest(admin_ids),
    'duvida',
    'Nova dúvida de mentorado',
    'Dúvida: "' || NEW.titulo || '"',
    '/admin/mentoria?tab=duvidas&user=' || NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notificar_duvida
AFTER INSERT ON duvidas_mentoria
FOR EACH ROW EXECUTE FUNCTION notificar_nova_duvida();