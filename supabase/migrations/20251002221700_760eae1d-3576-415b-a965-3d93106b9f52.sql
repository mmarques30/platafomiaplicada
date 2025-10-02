-- Criar tabela para IAs "Copie e Use"
CREATE TABLE public.ia_copie_use (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  ia_recomendada TEXT,
  categoria TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para Ferramentas de IA
CREATE TABLE public.ferramentas_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  logo_url TEXT,
  objetivo TEXT NOT NULL,
  o_que_entrega TEXT NOT NULL,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  vale_a_pena BOOLEAN,
  justificativa TEXT,
  link_ferramenta TEXT,
  categoria TEXT NOT NULL,
  gratuito BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para Biblioteca de Prompts
CREATE TABLE public.biblioteca_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prompt TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para Métodos para Aplicar
CREATE TABLE public.metodos_aplicar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  template TEXT NOT NULL,
  categoria TEXT NOT NULL,
  exemplo TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ia_copie_use ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ferramentas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metodos_aplicar ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ia_copie_use
CREATE POLICY "Authenticated users can view active ia_copie_use"
ON public.ia_copie_use
FOR SELECT
USING (ativo = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage ia_copie_use"
ON public.ia_copie_use
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Políticas RLS para ferramentas_ia
CREATE POLICY "Authenticated users can view active ferramentas_ia"
ON public.ferramentas_ia
FOR SELECT
USING (ativo = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage ferramentas_ia"
ON public.ferramentas_ia
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Políticas RLS para biblioteca_prompts
CREATE POLICY "Authenticated users can view active prompts"
ON public.biblioteca_prompts
FOR SELECT
USING (ativo = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prompts"
ON public.biblioteca_prompts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Políticas RLS para metodos_aplicar
CREATE POLICY "Authenticated users can view active metodos"
ON public.metodos_aplicar
FOR SELECT
USING (ativo = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage metodos"
ON public.metodos_aplicar
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Triggers para updated_at
CREATE TRIGGER update_ia_copie_use_updated_at
BEFORE UPDATE ON public.ia_copie_use
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ferramentas_ia_updated_at
BEFORE UPDATE ON public.ferramentas_ia
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_biblioteca_prompts_updated_at
BEFORE UPDATE ON public.biblioteca_prompts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_metodos_aplicar_updated_at
BEFORE UPDATE ON public.metodos_aplicar
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();