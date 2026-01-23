-- Tabela para links importantes do Business
CREATE TABLE public.links_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos_business(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT 'link',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.links_business ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar todos os links
CREATE POLICY "Admins podem gerenciar links business"
ON public.links_business FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Usuarios podem ver links do proprio contrato
CREATE POLICY "Usuarios podem ver seus links business"
ON public.links_business FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contratos_business cb
    WHERE cb.id = links_business.contrato_id
    AND cb.user_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_links_business_updated_at
BEFORE UPDATE ON public.links_business
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();