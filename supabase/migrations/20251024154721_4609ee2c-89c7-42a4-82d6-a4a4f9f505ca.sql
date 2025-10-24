-- Passo 1: Adicionar coluna categoria nas trilhas (temporariamente nullable)
ALTER TABLE trilhas ADD COLUMN categoria text;

-- Passo 2: Preencher categorias nas trilhas existentes

-- Aulas Semanais
UPDATE trilhas SET categoria = 'aulas semanais' 
WHERE id = 'eb103a22-6730-48b5-984e-e788c561eb4c';

-- NÚCLEO
UPDATE trilhas SET categoria = 'núcleo' 
WHERE id IN (
  '83df428c-b86b-4887-a71f-9a427c5366d7',
  '39a7856f-65de-48b8-b98d-885274d40ef9',
  '8118b647-3250-4cc2-b21d-c5f4e570a26d',
  '6b54e8e2-4644-4b9e-bf91-eed8fe918b04',
  '302da0e7-1bf7-471b-83c4-0a3fef4e9e74'
);

-- FERRAMENTAS
UPDATE trilhas SET categoria = 'ferramentas' 
WHERE id IN (
  '8393c6b0-e53a-43e6-aad3-dede5de8d504',
  'b7ae7b03-1e83-4988-b726-6b45fa15180a',
  'e69d86a7-e2e6-420d-8d23-22f86336cfe6',
  '30356e58-4156-4e46-a6d1-2d29894f9b4f',
  'd03299b6-c5e2-4c62-91f0-0ddae52e16d6'
);

-- PROFISSÃO
UPDATE trilhas SET categoria = 'profissão' 
WHERE id IN (
  '45dcf411-5e65-48e6-aeb9-5c4c6543e7e6',
  'a140758e-cc2d-4d54-b5ca-65837552e45f',
  '5e78b95d-3192-4ef7-ab3c-982a6db6c5f7',
  'e640f6aa-e3e8-4e94-96c1-1f2859d03cde',
  '2aacb19a-02a4-4002-9000-20b0d712a683'
);

-- Passo 3: Remover constraint antigo de modulos.categoria antes de atualizar
ALTER TABLE modulos DROP CONSTRAINT IF EXISTS modulos_categoria_check;

-- Passo 4: Atualizar todos os módulos para herdarem a categoria da trilha
UPDATE modulos m
SET categoria = t.categoria
FROM trilhas t
WHERE m.trilha_id = t.id;

-- Passo 5: Adicionar constraints DEPOIS de atualizar os dados
ALTER TABLE trilhas
  ADD CONSTRAINT trilhas_categoria_check 
  CHECK (categoria IN ('aulas semanais','núcleo','ferramentas','profissão'));

ALTER TABLE trilhas ALTER COLUMN categoria SET NOT NULL;

ALTER TABLE modulos
  ADD CONSTRAINT modulos_categoria_check 
  CHECK (categoria IN ('aulas semanais','núcleo','ferramentas','profissão'));

ALTER TABLE modulos ALTER COLUMN categoria SET NOT NULL;

-- Passo 6: Criar triggers para manter sincronização automática

-- Trigger 1: Ao inserir/atualizar módulo, herdar categoria da trilha
CREATE OR REPLACE FUNCTION public.modulo_set_categoria()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.trilha_id IS NOT NULL THEN
    SELECT categoria INTO NEW.categoria FROM trilhas WHERE id = NEW.trilha_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_modulo_categoria
BEFORE INSERT OR UPDATE OF trilha_id ON modulos
FOR EACH ROW EXECUTE FUNCTION public.modulo_set_categoria();

-- Trigger 2: Ao atualizar categoria da trilha, cascatear para módulos
CREATE OR REPLACE FUNCTION public.trilha_categoria_changed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.categoria IS DISTINCT FROM OLD.categoria THEN
    UPDATE modulos SET categoria = NEW.categoria WHERE trilha_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cascade_update_modulos
AFTER UPDATE OF categoria ON trilhas
FOR EACH ROW EXECUTE FUNCTION public.trilha_categoria_changed();

-- Passo 7: Remover tabela antiga de categorias
DROP TABLE IF EXISTS categorias_modulos CASCADE;