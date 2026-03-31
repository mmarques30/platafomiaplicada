CREATE TABLE public.user_onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  objetivo text NOT NULL,
  area_atuacao text NOT NULL,
  desafio_principal text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding_responses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own onboarding" ON public.user_onboarding_responses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding" ON public.user_onboarding_responses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));