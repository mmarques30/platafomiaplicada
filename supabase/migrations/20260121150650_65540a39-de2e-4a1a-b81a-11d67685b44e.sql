-- Tabela de materiais da comunidade
CREATE TABLE public.materiais_comunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('prompt', 'imagem', 'documento', 'template', 'outro')),
  categoria TEXT NOT NULL CHECK (categoria IN ('chatgpt', 'claude', 'midjourney', 'canva', 'notion', 'excel', 'outro')),
  conteudo_texto TEXT,
  arquivo_url TEXT,
  criador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  adicionado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  media_avaliacoes NUMERIC(3,2) DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de avaliacoes
CREATE TABLE public.avaliacoes_materiais_comunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materiais_comunidade(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, user_id)
);

-- Enable RLS
ALTER TABLE public.materiais_comunidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_materiais_comunidade ENABLE ROW LEVEL SECURITY;

-- Policies para materiais_comunidade
CREATE POLICY "materiais_comunidade_select_policy" ON public.materiais_comunidade
  FOR SELECT USING (ativo = true OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "materiais_comunidade_insert_policy" ON public.materiais_comunidade
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "materiais_comunidade_update_policy" ON public.materiais_comunidade
  FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "materiais_comunidade_delete_policy" ON public.materiais_comunidade
  FOR DELETE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies para avaliacoes
CREATE POLICY "avaliacoes_materiais_select_policy" ON public.avaliacoes_materiais_comunidade
  FOR SELECT USING (true);

CREATE POLICY "avaliacoes_materiais_insert_policy" ON public.avaliacoes_materiais_comunidade
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "avaliacoes_materiais_update_policy" ON public.avaliacoes_materiais_comunidade
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "avaliacoes_materiais_delete_policy" ON public.avaliacoes_materiais_comunidade
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_materiais_comunidade_updated_at
  BEFORE UPDATE ON public.materiais_comunidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_materiais_updated_at
  BEFORE UPDATE ON public.avaliacoes_materiais_comunidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Funcao para atualizar estatisticas e pontos
CREATE OR REPLACE FUNCTION public.update_material_stats_and_points()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_id UUID;
BEGIN
  -- Atualizar estatisticas do material
  UPDATE public.materiais_comunidade
  SET 
    total_avaliacoes = (SELECT COUNT(*) FROM public.avaliacoes_materiais_comunidade WHERE material_id = NEW.material_id),
    media_avaliacoes = (SELECT COALESCE(AVG(nota), 0) FROM public.avaliacoes_materiais_comunidade WHERE material_id = NEW.material_id),
    total_comentarios = (SELECT COUNT(*) FROM public.avaliacoes_materiais_comunidade WHERE material_id = NEW.material_id AND comentario IS NOT NULL AND comentario != '')
  WHERE id = NEW.material_id
  RETURNING criador_id INTO v_criador_id;

  -- Pontos para quem avaliou (2 pontos)
  PERFORM public.add_community_points(NEW.user_id, 2);
  
  -- Pontos para o criador (5 pontos por avaliacao recebida)
  IF v_criador_id IS NOT NULL THEN
    PERFORM public.add_community_points(v_criador_id, 5);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para avaliacoes
CREATE TRIGGER trigger_update_material_stats
  AFTER INSERT ON public.avaliacoes_materiais_comunidade
  FOR EACH ROW EXECUTE FUNCTION public.update_material_stats_and_points();

-- Bucket de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materiais-comunidade', 'materiais-comunidade', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "materiais_comunidade_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'materiais-comunidade');

CREATE POLICY "materiais_comunidade_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'materiais-comunidade' AND 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "materiais_comunidade_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'materiais-comunidade' AND 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );