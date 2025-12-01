-- 1. Criar tabela de objetivos gerados pela IA
CREATE TABLE objetivos_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  formulario_id UUID REFERENCES formulario_diagnostico(id),
  objetivo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'curto_prazo',
  prioridade INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ativo',
  gerado_por_ia BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE objetivos_mentoria ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own objetivos"
  ON objetivos_mentoria FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own objetivos"
  ON objetivos_mentoria FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objetivos"
  ON objetivos_mentoria FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all objetivos"
  ON objetivos_mentoria FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all objetivos"
  ON objetivos_mentoria FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_objetivos_mentoria_updated_at
  BEFORE UPDATE ON objetivos_mentoria
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 2. Ocultar menu Novidades
UPDATE menu_config SET visivel = false WHERE menu_key = 'trilhas_novidades';

-- 3. Adicionar menu Meu Diagnóstico
INSERT INTO menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, planos_permitidos)
VALUES ('meu_diagnostico', 'Meu Diagnóstico', 'sidebar', '/meu-diagnostico', 'FileSearch', true, true, 4, NULL)
ON CONFLICT (menu_key) DO NOTHING;