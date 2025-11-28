-- Criar tabela de categorias de posts da comunidade
CREATE TABLE IF NOT EXISTS public.community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de posts da comunidade
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  media JSONB DEFAULT '[]'::jsonb,
  pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de comentários
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de reações (likes)
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Criar tabela de cursos do Classroom
CREATE TABLE IF NOT EXISTS public.classroom_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  thumbnail_url TEXT,
  tipo TEXT NOT NULL DEFAULT 'video',
  conteudo JSONB DEFAULT '[]'::jsonb,
  gratuito BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de progresso no Classroom
CREATE TABLE IF NOT EXISTS public.classroom_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.classroom_courses(id) ON DELETE CASCADE,
  progresso INTEGER DEFAULT 0,
  completado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Adicionar campos em profiles para comunidade
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nivel_comunidade INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pontos_comunidade INTEGER DEFAULT 0;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post_id ON public.community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user_id ON public.community_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_progress_user_id ON public.classroom_progress(user_id);

-- Enable RLS em todas as tabelas
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies para community_categories
CREATE POLICY "Anyone can view active categories"
  ON public.community_categories FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins can manage categories"
  ON public.community_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para community_posts
CREATE POLICY "Anyone authenticated can view posts"
  ON public.community_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para community_comments
CREATE POLICY "Anyone authenticated can view comments"
  ON public.community_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.community_comments FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own comments"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para community_reactions
CREATE POLICY "Anyone authenticated can view reactions"
  ON public.community_reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create reactions"
  ON public.community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.community_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para classroom_courses
CREATE POLICY "Anyone authenticated can view courses"
  ON public.classroom_courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND ativo = true);

CREATE POLICY "Admins can manage courses"
  ON public.classroom_courses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para classroom_progress
CREATE POLICY "Users can view their own progress"
  ON public.classroom_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.classroom_progress FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own progress"
  ON public.classroom_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.classroom_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classroom_courses_updated_at
  BEFORE UPDATE ON public.classroom_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classroom_progress_updated_at
  BEFORE UPDATE ON public.classroom_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar contadores de posts
CREATE OR REPLACE FUNCTION public.update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'community_comments' THEN
      UPDATE public.community_posts
      SET comments_count = comments_count + 1
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'community_reactions' THEN
      UPDATE public.community_posts
      SET likes_count = likes_count + 1
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'community_comments' THEN
      UPDATE public.community_posts
      SET comments_count = GREATEST(comments_count - 1, 0)
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'community_reactions' THEN
      UPDATE public.community_posts
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para contadores
CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_counters();

CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_counters();