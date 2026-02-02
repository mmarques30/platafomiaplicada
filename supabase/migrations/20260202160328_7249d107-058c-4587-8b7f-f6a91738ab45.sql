-- Criar tabela para gerenciamento de cupons de visitantes
CREATE TABLE public.cupons_visitantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  desconto_percentual INTEGER NOT NULL CHECK (desconto_percentual > 0 AND desconto_percentual <= 100),
  descricao TEXT,
  tipo VARCHAR(30) DEFAULT 'manual',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir cupons existentes (Academy12 e Academy15)
INSERT INTO public.cupons_visitantes (codigo, desconto_percentual, descricao, tipo)
VALUES 
  ('Academy12', 12, 'Cupom padrão para visitantes', 'padrao'),
  ('Academy15', 15, 'Cupom para visitantes engajados (+2x/semana)', 'engajados');

-- Habilitar RLS
ALTER TABLE public.cupons_visitantes ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem cupons (apenas admin)
CREATE POLICY "Admins podem gerenciar cupons" ON public.cupons_visitantes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cupons_visitantes_updated_at
  BEFORE UPDATE ON public.cupons_visitantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();