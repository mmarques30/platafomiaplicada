-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'mentorado', 'aluno_trilha');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  idade INTEGER,
  linkedin TEXT,
  profissao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (CRITICAL for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create trilhas table
CREATE TABLE public.trilhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cursos table
CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id UUID NOT NULL REFERENCES public.trilhas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  duracao_estimada INTEGER, -- em minutos
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modulos table
CREATE TABLE public.modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  duracao INTEGER, -- em segundos
  ordem INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progresso_videos table
CREATE TABLE public.progresso_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  tempo_assistido INTEGER DEFAULT 0, -- segundos
  completado BOOLEAN DEFAULT FALSE,
  ultima_visualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Create avisos table
CREATE TABLE public.avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'alerta', 'urgente')),
  ativo BOOLEAN DEFAULT TRUE,
  data_expiracao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create formulario_diagnostico table
CREATE TABLE public.formulario_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Seção 1: Informações Pessoais
  nome_completo TEXT,
  idade INTEGER,
  linkedin TEXT,
  profissao TEXT,
  area_atuacao TEXT,
  area_atuacao_outro TEXT,
  tempo_experiencia TEXT,
  tamanho_empresa TEXT,
  lidera_equipe BOOLEAN,
  tamanho_equipe INTEGER,
  
  -- Seção 2: Experiência com IA
  nivel_ia TEXT,
  ferramentas_ia JSONB DEFAULT '[]'::JSONB,
  outras_ferramentas TEXT,
  frequencia_uso_ia TEXT,
  experiencia_ia TEXT,
  maior_dificuldade_ia TEXT,
  
  -- Seção 3: Objetivos
  objetivo_principal TEXT,
  objetivo_especifico TEXT,
  area_aplicacao_ia TEXT,
  meta_3_meses TEXT,
  meta_12_meses TEXT,
  metricas_sucesso TEXT,
  
  -- Seção 4: Cenário Atual
  desafio_1 TEXT,
  desafio_2 TEXT,
  desafio_3 TEXT,
  tempo_disponivel TEXT,
  maior_ladrao_tempo TEXT,
  nivel_autonomia TEXT,
  processo_otimizar TEXT,
  
  -- Seção 5: Estilo de Aprendizagem
  estilo_aprendizagem TEXT,
  preferencia_aprendizado TEXT,
  melhor_horario TEXT,
  tipo_feedback TEXT,
  limitacoes_tecnicas TEXT,
  
  -- Seção 6: Motivação
  motivacao_mentoria TEXT,
  maior_medo_ia TEXT,
  nivel_comprometimento INTEGER CHECK (nivel_comprometimento BETWEEN 1 AND 10),
  zona_conforto TEXT,
  nao_negociaveis TEXT,
  
  -- Seção 7: Expectativas
  tipo_suporte TEXT,
  frequencia_feedback TEXT,
  preferencia_sessoes TEXT,
  duvidas_preocupacoes TEXT,
  vitoria_30_dias TEXT,
  quick_wins JSONB DEFAULT '[]'::JSONB,
  
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create objetivos_mentoria table
CREATE TABLE public.objetivos_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objetivo TEXT NOT NULL,
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
  progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trilhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulario_diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trilhas
CREATE POLICY "Authenticated users can view active trilhas"
  ON public.trilhas FOR SELECT
  TO authenticated
  USING (ativo = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage trilhas"
  ON public.trilhas FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cursos
CREATE POLICY "Authenticated users can view active cursos"
  ON public.cursos FOR SELECT
  TO authenticated
  USING (ativo = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage cursos"
  ON public.cursos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for modulos
CREATE POLICY "Authenticated users can view active modulos"
  ON public.modulos FOR SELECT
  TO authenticated
  USING (ativo = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage modulos"
  ON public.modulos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for videos
CREATE POLICY "Authenticated users can view active videos"
  ON public.videos FOR SELECT
  TO authenticated
  USING (ativo = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage videos"
  ON public.videos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for progresso_videos
CREATE POLICY "Users can view their own progress"
  ON public.progresso_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON public.progresso_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progresso_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.progresso_videos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for avisos
CREATE POLICY "Authenticated users can view active avisos"
  ON public.avisos FOR SELECT
  TO authenticated
  USING (ativo = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage avisos"
  ON public.avisos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for formulario_diagnostico
CREATE POLICY "Users can view their own formulario"
  ON public.formulario_diagnostico FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own formulario"
  ON public.formulario_diagnostico FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own formulario"
  ON public.formulario_diagnostico FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all formularios"
  ON public.formulario_diagnostico FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for objetivos_mentoria
CREATE POLICY "Users can view their own objetivos"
  ON public.objetivos_mentoria FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own objetivos"
  ON public.objetivos_mentoria FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all objetivos"
  ON public.objetivos_mentoria FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_trilhas
  BEFORE UPDATE ON public.trilhas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_cursos
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_modulos
  BEFORE UPDATE ON public.modulos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_videos
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_progresso
  BEFORE UPDATE ON public.progresso_videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_avisos
  BEFORE UPDATE ON public.avisos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_formulario
  BEFORE UPDATE ON public.formulario_diagnostico
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_objetivos
  BEFORE UPDATE ON public.objetivos_mentoria
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function and trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();