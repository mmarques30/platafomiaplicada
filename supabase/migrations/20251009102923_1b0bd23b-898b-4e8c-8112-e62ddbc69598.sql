-- Criar tabela de formulários customizados
CREATE TABLE formularios_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  
  -- Informações básicas
  titulo TEXT NOT NULL,
  descricao TEXT,
  
  -- Configuração de acesso
  visibilidade TEXT NOT NULL DEFAULT 'todos',
  mentorados_ids JSONB DEFAULT '[]'::jsonb,
  
  -- Prazo
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  
  -- Conteúdo do formulário
  texto_original TEXT NOT NULL,
  perguntas_geradas JSONB NOT NULL,
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'ativo',
  total_respostas INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para formulários
CREATE INDEX idx_formularios_created_by ON formularios_customizados(created_by);
CREATE INDEX idx_formularios_status ON formularios_customizados(status);
CREATE INDEX idx_formularios_expiracao ON formularios_customizados(data_expiracao);

-- Trigger para updated_at
CREATE TRIGGER update_formularios_customizados_updated_at
BEFORE UPDATE ON formularios_customizados
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Criar tabela de respostas
CREATE TABLE respostas_formularios_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id UUID NOT NULL REFERENCES formularios_customizados(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Respostas
  respostas JSONB NOT NULL,
  
  -- Metadata
  tempo_resposta INTEGER,
  completado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Um usuário pode responder apenas uma vez por formulário
  UNIQUE(formulario_id, user_id)
);

-- Índices para respostas
CREATE INDEX idx_respostas_form_id ON respostas_formularios_customizados(formulario_id);
CREATE INDEX idx_respostas_user_id ON respostas_formularios_customizados(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_respostas_formularios_updated_at
BEFORE UPDATE ON respostas_formularios_customizados
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- RLS para formulários_customizados
ALTER TABLE formularios_customizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all formularios"
ON formularios_customizados FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view formularios directed to them"
ON formularios_customizados FOR SELECT
TO authenticated
USING (
  status = 'ativo' AND
  (data_expiracao IS NULL OR data_expiracao > NOW()) AND
  (
    visibilidade = 'todos' OR
    (visibilidade = 'especificos' AND mentorados_ids ? auth.uid()::text)
  )
);

-- RLS para respostas_formularios_customizados
ALTER TABLE respostas_formularios_customizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own respostas"
ON respostas_formularios_customizados FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all respostas"
ON respostas_formularios_customizados FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Função para notificar novo formulário
CREATE OR REPLACE FUNCTION notificar_novo_formulario()
RETURNS TRIGGER AS $$
DECLARE
  mentorado_id UUID;
BEGIN
  -- Se for para todos
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
  
  -- Se for para específicos
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notificar_formulario
AFTER INSERT ON formularios_customizados
FOR EACH ROW
EXECUTE FUNCTION notificar_novo_formulario();

-- Função para atualizar contador de respostas
CREATE OR REPLACE FUNCTION atualizar_total_respostas()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.completado = true AND OLD.completado = false) THEN
    UPDATE formularios_customizados
    SET total_respostas = total_respostas + 1
    WHERE id = NEW.formulario_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_total_respostas
AFTER INSERT OR UPDATE ON respostas_formularios_customizados
FOR EACH ROW
EXECUTE FUNCTION atualizar_total_respostas();