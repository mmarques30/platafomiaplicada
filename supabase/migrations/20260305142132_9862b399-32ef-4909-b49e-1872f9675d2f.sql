CREATE TABLE public.aditivos_contrato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos_business(id) ON DELETE CASCADE,
  texto_original TEXT NOT NULL,
  alteracoes_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  resumo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aditivos_contrato ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage aditivos" ON public.aditivos_contrato
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));