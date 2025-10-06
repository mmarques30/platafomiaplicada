-- Criar tabela de feedbacks de vídeos
CREATE TABLE public.video_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('like', 'comentario')),
  comentario text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_video_like UNIQUE(video_id, user_id, tipo)
);

-- Índices para performance
CREATE INDEX idx_video_feedbacks_video_id ON public.video_feedbacks(video_id);
CREATE INDEX idx_video_feedbacks_user_id ON public.video_feedbacks(user_id);
CREATE INDEX idx_video_feedbacks_tipo ON public.video_feedbacks(tipo);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_video_feedbacks_updated_at
  BEFORE UPDATE ON public.video_feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.video_feedbacks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own feedback"
  ON public.video_feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all feedbacks"
  ON public.video_feedbacks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can update their own feedback"
  ON public.video_feedbacks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON public.video_feedbacks FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedbacks"
  ON public.video_feedbacks FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));