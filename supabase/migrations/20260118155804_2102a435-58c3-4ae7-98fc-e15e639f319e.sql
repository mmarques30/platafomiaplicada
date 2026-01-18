-- Tabela para controle de contratos Business
CREATE TABLE public.contratos_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  modulos_contratados INTEGER NOT NULL DEFAULT 1,
  tempo_consultoria_meses INTEGER NOT NULL DEFAULT 3,
  entregas_esperadas JSONB DEFAULT '[]'::jsonb,
  reunioes_mensais INTEGER NOT NULL DEFAULT 1,
  reports_frequencia TEXT DEFAULT 'mensal',
  suporte_tipo TEXT DEFAULT 'email',
  data_inicio DATE,
  data_fim DATE,
  status TEXT DEFAULT 'ativo',
  valor_contrato DECIMAL(10,2),
  roi_projetado DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contratos_business ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own contracts"
ON public.contratos_business
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contracts"
ON public.contratos_business
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert contracts"
ON public.contratos_business
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update contracts"
ON public.contratos_business
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete contracts"
ON public.contratos_business
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_contratos_business_updated_at
BEFORE UPDATE ON public.contratos_business
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para busca por user_id
CREATE INDEX idx_contratos_business_user_id ON public.contratos_business(user_id);

-- Tabela para reports enviados
CREATE TABLE public.reports_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_url TEXT,
  periodo_referencia TEXT,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports_business ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reports
CREATE POLICY "Users can view their reports"
ON public.reports_business
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contratos_business
    WHERE contratos_business.id = reports_business.contrato_id
    AND contratos_business.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage reports"
ON public.reports_business
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Índice para busca por contrato
CREATE INDEX idx_reports_business_contrato_id ON public.reports_business(contrato_id);