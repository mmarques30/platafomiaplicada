
CREATE TABLE public.notas_projeto_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos_business(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Sem título',
  conteudo TEXT DEFAULT '',
  categoria TEXT DEFAULT 'geral',
  ordem INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notas_projeto_business ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access notas" ON public.notas_projeto_business
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "User read own notas" ON public.notas_projeto_business
  FOR SELECT TO authenticated
  USING (contrato_id IN (SELECT id FROM public.contratos_business WHERE user_id = auth.uid()));

CREATE TRIGGER update_notas_projeto_business_updated_at
  BEFORE UPDATE ON public.notas_projeto_business
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
