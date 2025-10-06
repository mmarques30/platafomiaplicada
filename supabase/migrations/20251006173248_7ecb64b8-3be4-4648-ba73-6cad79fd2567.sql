-- Create exercicios_praticos table
CREATE TABLE public.exercicios_praticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo_resposta TEXT NOT NULL CHECK (tipo_resposta IN ('texto', 'documento', 'imagem')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create respostas_exercicios table
CREATE TABLE public.respostas_exercicios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_id UUID REFERENCES public.exercicios_praticos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  resposta_texto TEXT,
  arquivo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_avaliacao', 'aprovado', 'reprovado')),
  nota INTEGER CHECK (nota >= 0 AND nota <= 100),
  feedback_mentor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create certificados table
CREATE TABLE public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trilha_id UUID REFERENCES public.trilhas(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  status TEXT NOT NULL DEFAULT 'em_progresso' CHECK (status IN ('em_progresso', 'disponivel', 'emitido')),
  criterios JSONB DEFAULT '{"videos_concluidos": 100, "exercicios_aprovados": 80}'::jsonb,
  data_emissao TIMESTAMP WITH TIME ZONE,
  codigo_verificacao TEXT UNIQUE,
  url_pdf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, trilha_id)
);

-- Create storage bucket for exercicios-respostas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercicios-respostas', 'exercicios-respostas', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.exercicios_praticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercicios_praticos
CREATE POLICY "Authenticated users can view active exercicios"
ON public.exercicios_praticos FOR SELECT
USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage exercicios"
ON public.exercicios_praticos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for respostas_exercicios
CREATE POLICY "Users can view their own respostas"
ON public.respostas_exercicios FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own respostas"
ON public.respostas_exercicios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own respostas"
ON public.respostas_exercicios FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all respostas"
ON public.respostas_exercicios FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for certificados
CREATE POLICY "Users can view their own certificados"
ON public.certificados FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage certificados"
ON public.certificados FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for storage bucket
CREATE POLICY "Users can upload their own exercise responses"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercicios-respostas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own exercise responses"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exercicios-respostas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all exercise responses"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exercicios-respostas' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Triggers for updated_at
CREATE TRIGGER update_exercicios_praticos_updated_at
BEFORE UPDATE ON public.exercicios_praticos
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_respostas_exercicios_updated_at
BEFORE UPDATE ON public.respostas_exercicios
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_certificados_updated_at
BEFORE UPDATE ON public.certificados
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();