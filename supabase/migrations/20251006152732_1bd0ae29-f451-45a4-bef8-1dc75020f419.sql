-- Create ENUMs for status
CREATE TYPE public.status_sessao AS ENUM ('agendada', 'realizada', 'cancelada');
CREATE TYPE public.status_projeto AS ENUM ('planejamento', 'em_andamento', 'concluido', 'cancelado');

-- Create sessoes_mentoria table
CREATE TABLE public.sessoes_mentoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  data_sessao TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao INTEGER, -- em minutos
  transcricao TEXT,
  video_url TEXT,
  notas TEXT,
  status status_sessao NOT NULL DEFAULT 'agendada',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recursos_mentoria table
CREATE TABLE public.recursos_mentoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  link TEXT,
  categoria TEXT NOT NULL,
  para_que_serve TEXT NOT NULL,
  como_usar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projetos_mentoria table
CREATE TABLE public.projetos_mentoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  objetivo_id UUID REFERENCES public.objetivos_mentoria(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  objetivo_projeto TEXT NOT NULL,
  contribuicao_plano TEXT NOT NULL,
  status status_projeto NOT NULL DEFAULT 'planejamento',
  devolutiva_mentor TEXT,
  avaliacao_mentorado INTEGER, -- 1 a 5
  avaliacao_mentor INTEGER, -- 1 a 5
  comentarios_mentorado TEXT,
  comentarios_mentor TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  data_entrega DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessoes_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_mentoria ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessoes_mentoria
CREATE POLICY "Users can view their own sessoes"
  ON public.sessoes_mentoria
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessoes"
  ON public.sessoes_mentoria
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own sessoes"
  ON public.sessoes_mentoria
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create sessoes"
  ON public.sessoes_mentoria
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own sessoes"
  ON public.sessoes_mentoria
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all sessoes"
  ON public.sessoes_mentoria
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sessoes"
  ON public.sessoes_mentoria
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for recursos_mentoria
CREATE POLICY "Users can view their own recursos"
  ON public.recursos_mentoria
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recursos"
  ON public.recursos_mentoria
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own recursos"
  ON public.recursos_mentoria
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create recursos"
  ON public.recursos_mentoria
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own recursos"
  ON public.recursos_mentoria
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all recursos"
  ON public.recursos_mentoria
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete recursos"
  ON public.recursos_mentoria
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for projetos_mentoria
CREATE POLICY "Users can view their own projetos"
  ON public.projetos_mentoria
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all projetos"
  ON public.projetos_mentoria
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own projetos"
  ON public.projetos_mentoria
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create projetos"
  ON public.projetos_mentoria
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own projetos"
  ON public.projetos_mentoria
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all projetos"
  ON public.projetos_mentoria
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete projetos"
  ON public.projetos_mentoria
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_sessoes_mentoria_updated_at
  BEFORE UPDATE ON public.sessoes_mentoria
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_recursos_mentoria_updated_at
  BEFORE UPDATE ON public.recursos_mentoria
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projetos_mentoria_updated_at
  BEFORE UPDATE ON public.projetos_mentoria
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();