-- Criar tabela knowledge_base para armazenar documentos do conhecimento
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  conteudo_extraido TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  categoria TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice para buscas por categoria e ativo
CREATE INDEX idx_knowledge_base_categoria ON public.knowledge_base(categoria);
CREATE INDEX idx_knowledge_base_ativo ON public.knowledge_base(ativo);

-- Habilitar RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can manage knowledge_base"
ON public.knowledge_base
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Policy: Edge function ai-chat pode ler documentos ativos
CREATE POLICY "AI can read active knowledge"
ON public.knowledge_base
FOR SELECT
USING (ativo = true);

-- Criar storage bucket para documentos (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-documents', 'knowledge-documents', false);

-- Policy: Admins podem fazer upload
CREATE POLICY "Admins can upload knowledge documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-documents' 
  AND has_role(auth.uid(), 'admin')
);

-- Policy: Admins podem visualizar documentos
CREATE POLICY "Admins can view knowledge documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'knowledge-documents'
  AND has_role(auth.uid(), 'admin')
);

-- Policy: Admins podem deletar documentos
CREATE POLICY "Admins can delete knowledge documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'knowledge-documents'
  AND has_role(auth.uid(), 'admin')
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();