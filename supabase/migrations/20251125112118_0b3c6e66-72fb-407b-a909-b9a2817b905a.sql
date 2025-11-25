-- Create descontos table
CREATE TABLE public.descontos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT,
  motivo TEXT NOT NULL,
  tipo_desconto TEXT NOT NULL CHECK (tipo_desconto IN ('percentual', 'valor_fixo')),
  valor NUMERIC NOT NULL CHECK (valor > 0),
  produtos_ids JSONB DEFAULT '[]'::jsonb,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.descontos ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all descontos
CREATE POLICY "Admins can manage descontos"
ON public.descontos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Authenticated users can view active descontos
CREATE POLICY "Authenticated users can view active descontos"
ON public.descontos
FOR SELECT
USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at_descontos
  BEFORE UPDATE ON public.descontos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();