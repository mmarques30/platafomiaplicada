
CREATE TABLE public.metas_academy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  descricao text,
  tipo text DEFAULT 'tarefa',
  status text DEFAULT 'pendente',
  prioridade text DEFAULT 'media',
  prazo date,
  objetivo_vinculado text,
  etapa_vinculada integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.metas_academy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own metas" ON public.metas_academy
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_metas_academy_updated_at
  BEFORE UPDATE ON public.metas_academy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
