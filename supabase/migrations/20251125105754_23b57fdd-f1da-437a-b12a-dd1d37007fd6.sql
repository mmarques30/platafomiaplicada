-- 1. Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'b2c', 'b2b'
  formato TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  valor_com_desconto DECIMAL(10,2),
  periodicidade TEXT, -- 'anual', 'mensal', 'unico'
  duracao TEXT,
  descricao_curta TEXT NOT NULL,
  descricao_completa TEXT NOT NULL,
  beneficios JSONB DEFAULT '[]'::jsonb,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Criar tabela de regras de upsell
CREATE TABLE IF NOT EXISTS public.regras_upsell (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_origem_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
  produto_destino_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
  valor_desconto DECIMAL(10,2) NOT NULL,
  economia DECIMAL(10,2) NOT NULL,
  descricao_oferta TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Atualizar enum plano_mentoria para incluir novos valores
ALTER TYPE plano_mentoria ADD VALUE IF NOT EXISTS 'academy';
ALTER TYPE plano_mentoria ADD VALUE IF NOT EXISTS 'lab';
ALTER TYPE plano_mentoria ADD VALUE IF NOT EXISTS 'skills';

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_upsell ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para produtos
CREATE POLICY "Admins can manage produtos" ON public.produtos
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active produtos" ON public.produtos
  FOR SELECT USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));

-- 6. Políticas RLS para regras_upsell
CREATE POLICY "Admins can manage regras_upsell" ON public.regras_upsell
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active upsells" ON public.regras_upsell
  FOR SELECT USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));

-- 7. Triggers para updated_at
CREATE TRIGGER handle_updated_at_produtos
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_regras_upsell
  BEFORE UPDATE ON public.regras_upsell
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();