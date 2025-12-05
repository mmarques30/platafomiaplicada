-- Permitir user_id NULL para respostas anônimas
ALTER TABLE respostas_pesquisas 
  ALTER COLUMN user_id DROP NOT NULL;

-- Adicionar campo email para identificar respondentes não logados
ALTER TABLE respostas_pesquisas 
  ADD COLUMN email_respondente TEXT;

-- Política para permitir INSERT anônimo (pessoas não logadas)
CREATE POLICY "Anyone can insert pesquisa responses"
  ON respostas_pesquisas FOR INSERT
  WITH CHECK (true);