-- Adicionar coluna direcional_entregas na tabela formulario_diagnostico
ALTER TABLE formulario_diagnostico 
ADD COLUMN IF NOT EXISTS direcional_entregas TEXT;