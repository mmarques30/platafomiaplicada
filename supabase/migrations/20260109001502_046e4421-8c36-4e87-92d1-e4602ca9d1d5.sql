-- Corrigir políticas de INSERT na tabela respostas_pesquisas
-- Remover políticas duplicadas e restringir acesso

-- Remover políticas de INSERT existentes
DROP POLICY IF EXISTS "Users can insert own respostas" ON public.respostas_pesquisas;
DROP POLICY IF EXISTS "Users can submit survey responses" ON public.respostas_pesquisas;

-- Criar política única e mais segura para INSERT
-- Usuários autenticados podem inserir suas próprias respostas
CREATE POLICY "Authenticated users can submit survey responses" 
ON public.respostas_pesquisas 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- O user_id deve ser o próprio usuário autenticado
  user_id = auth.uid() AND
  -- Deve ter pesquisa_id válido
  pesquisa_id IS NOT NULL AND
  -- Deve ter respostas
  respostas IS NOT NULL
);

-- Política separada para respostas anônimas (sem user_id, mas com email obrigatório)
CREATE POLICY "Anonymous users can submit survey responses with email" 
ON public.respostas_pesquisas 
FOR INSERT 
TO anon
WITH CHECK (
  -- Para anônimos, user_id deve ser NULL
  user_id IS NULL AND
  -- Email é obrigatório para rastreabilidade
  email_respondente IS NOT NULL AND 
  email_respondente <> '' AND
  -- Deve ter pesquisa_id válido
  pesquisa_id IS NOT NULL AND
  -- Deve ter respostas
  respostas IS NOT NULL
);