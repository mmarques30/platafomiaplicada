-- Adicionar campo para URL de transcrição em sessões
ALTER TABLE sessoes_mentoria 
ADD COLUMN transcricao_url TEXT;

-- Criar tabela de tarefas de mentoria
CREATE TABLE tarefas_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  projeto_id UUID REFERENCES projetos_mentoria(id) ON DELETE SET NULL,
  sessao_id UUID REFERENCES sessoes_mentoria(id) ON DELETE SET NULL,
  
  -- Informações da tarefa
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrega', 'leitura', 'exercicio', 'revisao')),
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Prazos
  data_acordo TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prazo_entrega DATE NOT NULL,
  data_conclusao TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada')),
  
  -- Anexos e links
  arquivo_entrega_url TEXT,
  link_externo TEXT,
  
  -- Feedback
  feedback_mentor TEXT,
  avaliacao_mentor INTEGER CHECK (avaliacao_mentor >= 1 AND avaliacao_mentor <= 5),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_tarefas_user ON tarefas_mentoria(user_id);
CREATE INDEX idx_tarefas_projeto ON tarefas_mentoria(projeto_id);
CREATE INDEX idx_tarefas_status ON tarefas_mentoria(status);
CREATE INDEX idx_tarefas_prazo ON tarefas_mentoria(prazo_entrega);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON tarefas_mentoria
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Função para atualizar status automaticamente
CREATE OR REPLACE FUNCTION atualizar_status_tarefa()
RETURNS TRIGGER AS $$
BEGIN
  -- Se passou do prazo e ainda não concluiu, marca como atrasada
  IF NEW.status IN ('pendente', 'em_andamento') AND NEW.prazo_entrega < CURRENT_DATE THEN
    NEW.status := 'atrasada';
  END IF;
  
  -- Se concluiu, preenche data_conclusao
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    NEW.data_conclusao := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_status_tarefa
BEFORE INSERT OR UPDATE ON tarefas_mentoria
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_tarefa();

-- Habilitar RLS
ALTER TABLE tarefas_mentoria ENABLE ROW LEVEL SECURITY;

-- RLS Policies para tarefas
CREATE POLICY "Admin can manage all tarefas"
ON tarefas_mentoria FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own tarefas"
ON tarefas_mentoria FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own tarefas"
ON tarefas_mentoria FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tarefas"
ON tarefas_mentoria FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Storage bucket para transcrições
INSERT INTO storage.buckets (id, name, public)
VALUES ('transcricoes-mentoria', 'transcricoes-mentoria', false);

-- Storage bucket para entregas
INSERT INTO storage.buckets (id, name, public)
VALUES ('entregas-mentoria', 'entregas-mentoria', false);

-- RLS para storage de transcrições
CREATE POLICY "Admin can upload transcricoes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transcricoes-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin can update transcricoes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'transcricoes-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin can delete transcricoes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'transcricoes-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users and admin can view transcricoes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transcricoes-mentoria' AND
  (has_role(auth.uid(), 'admin'::app_role) OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- RLS para storage de entregas
CREATE POLICY "Admin can upload entregas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entregas-mentoria' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can upload their entregas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entregas-mentoria' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admin can update entregas"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'entregas-mentoria' AND
  (has_role(auth.uid(), 'admin'::app_role) OR (storage.foldername(name))[1] = auth.uid()::text)
);

CREATE POLICY "Users and admin can view entregas"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'entregas-mentoria' AND
  ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users and admin can delete entregas"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'entregas-mentoria' AND
  ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role))
);