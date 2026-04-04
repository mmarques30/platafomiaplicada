CREATE TABLE public.onboarding_eventos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plano text,
  evento text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.onboarding_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own" ON public.onboarding_eventos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_read_all" ON public.onboarding_eventos
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'equipe')
  );