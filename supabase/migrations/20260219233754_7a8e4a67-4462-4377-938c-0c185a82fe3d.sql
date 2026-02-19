
CREATE TABLE public.melhorias_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'Funcionalidade',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.melhorias_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar melhorias"
  ON public.melhorias_plataforma
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
