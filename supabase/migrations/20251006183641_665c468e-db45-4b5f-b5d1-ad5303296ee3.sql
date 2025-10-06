-- 1. Adicionar coluna trilha_id em modulos
ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS trilha_id UUID REFERENCES trilhas(id);

-- 2. Migrar dados: pegar trilha_id de cada curso e atribuir aos módulos
UPDATE modulos m
SET trilha_id = c.trilha_id
FROM cursos c
WHERE m.curso_id = c.id;

-- 3. Tornar trilha_id obrigatório
ALTER TABLE modulos 
ALTER COLUMN trilha_id SET NOT NULL;

-- 4. Remover coluna curso_id
ALTER TABLE modulos 
DROP COLUMN curso_id;

-- 5. Desativar tabela cursos (mantendo dados por segurança)
UPDATE cursos SET ativo = false;