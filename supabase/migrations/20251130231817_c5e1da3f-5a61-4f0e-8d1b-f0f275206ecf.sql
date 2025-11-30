-- Criar tabela para categorias Q&A
CREATE TABLE categorias_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para categorias_qa
ALTER TABLE categorias_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage categorias_qa"
ON categorias_qa FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active categorias_qa"
ON categorias_qa FOR SELECT
USING (ativo = true);

-- Adicionar campos Q&A na tabela duvidas_mentoria
ALTER TABLE duvidas_mentoria
ADD COLUMN publicar_qa BOOLEAN DEFAULT false,
ADD COLUMN categoria_qa_id UUID REFERENCES categorias_qa(id),
ADD COLUMN video_qa_url TEXT,
ADD COLUMN publicado_qa_em TIMESTAMPTZ;

-- Trigger para updated_at em categorias_qa
CREATE TRIGGER update_categorias_qa_updated_at
BEFORE UPDATE ON categorias_qa
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categorias_qa (nome, descricao, ordem) VALUES
  ('IA Generativa', 'Perguntas sobre modelos de linguagem, ChatGPT, Claude, Gemini', 1),
  ('Prompts', 'Técnicas de prompting, engenharia de prompts, templates', 2),
  ('Ferramentas', 'Recomendações e uso de ferramentas de IA', 3),
  ('Automação', 'Processos automatizados, integrações, workflows', 4),
  ('Produtividade', 'Otimização de trabalho, gestão de tempo com IA', 5),
  ('Estratégia', 'Implementação estratégica de IA nas empresas', 6);