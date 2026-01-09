-- Corrigir políticas RLS que usam WITH CHECK (true) de forma permissiva

-- 1. button_click_logs: Qualquer usuário autenticado pode inserir seus próprios logs
DROP POLICY IF EXISTS "Anyone can insert click logs" ON public.button_click_logs;
CREATE POLICY "Authenticated users can insert click logs" 
ON public.button_click_logs 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Se user_id for fornecido, deve ser o próprio usuário
  user_id IS NULL OR user_id = auth.uid()
);

-- 2. candidaturas_mentoria: Qualquer pessoa pode enviar candidatura (público), mas sem user_id malicioso
DROP POLICY IF EXISTS "Qualquer pessoa pode enviar candidatura" ON public.candidaturas_mentoria;
CREATE POLICY "Anyone can submit application" 
ON public.candidaturas_mentoria 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Email e whatsapp são obrigatórios e devem ser não vazios
  email IS NOT NULL AND email <> '' AND
  whatsapp IS NOT NULL AND whatsapp <> ''
);

-- 3. content_access_logs: Usuários autenticados inserem seus próprios logs
DROP POLICY IF EXISTS "Users can insert own logs" ON public.content_access_logs;
CREATE POLICY "Authenticated users can insert own access logs" 
ON public.content_access_logs 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- user_id deve ser o próprio usuário ou NULL
  (user_id IS NULL OR user_id = auth.uid())
);

-- 4. respostas_pesquisas: Usuários podem responder pesquisas
DROP POLICY IF EXISTS "Anyone can insert pesquisa responses" ON public.respostas_pesquisas;
CREATE POLICY "Users can submit survey responses" 
ON public.respostas_pesquisas 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Deve ter pesquisa_id válido e respostas não nulas
  pesquisa_id IS NOT NULL AND
  respostas IS NOT NULL
);

-- 5. signup_attempts: Qualquer pessoa pode registrar tentativa de signup
DROP POLICY IF EXISTS "Qualquer um pode inserir signup_attempts" ON public.signup_attempts;
CREATE POLICY "Anyone can insert signup attempts" 
ON public.signup_attempts 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Email é obrigatório
  email IS NOT NULL AND email <> ''
);