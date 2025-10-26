-- Criar tabela para gerenciar temas das aulas semanais
CREATE TABLE aulas_semanais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tema TEXT NOT NULL,
  horario TEXT DEFAULT '19:30',
  dia_semana TEXT DEFAULT 'Toda semana',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE aulas_semanais ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem visualizar aulas ativas
CREATE POLICY "Usuários autenticados podem visualizar aulas ativas"
  ON aulas_semanais FOR SELECT
  TO authenticated
  USING (ativo = true);

-- Política: Admins podem gerenciar todas as aulas
CREATE POLICY "Admins podem gerenciar aulas"
  ON aulas_semanais FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_aulas_semanais_updated_at
  BEFORE UPDATE ON aulas_semanais
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();