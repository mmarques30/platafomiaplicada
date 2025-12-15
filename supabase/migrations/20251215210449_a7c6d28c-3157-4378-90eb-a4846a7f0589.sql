-- Criar tabela de bônus condicionados
CREATE TABLE public.bonus_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  link TEXT,
  arquivo_url TEXT,
  comando_uso TEXT,
  condicao_tipo TEXT NOT NULL DEFAULT 'preenchimento',
  condicao_descricao TEXT,
  liberado BOOLEAN DEFAULT FALSE,
  data_liberacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bonus_mentoria ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all bonus"
ON public.bonus_mentoria
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own bonus"
ON public.bonus_mentoria
FOR SELECT
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_bonus_mentoria_updated_at
BEFORE UPDATE ON public.bonus_mentoria
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket privado para documentos de bônus
INSERT INTO storage.buckets (id, name, public)
VALUES ('bonus-mentoria', 'bonus-mentoria', false);

-- Storage policies para o bucket
CREATE POLICY "Admins can manage bonus files"
ON storage.objects
FOR ALL
USING (bucket_id = 'bonus-mentoria' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own bonus files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bonus-mentoria' AND auth.uid()::text = (storage.foldername(name))[1]);