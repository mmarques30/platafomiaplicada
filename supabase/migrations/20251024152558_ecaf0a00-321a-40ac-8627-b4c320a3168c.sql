-- Atualizar categorias dos módulos de acordo com a organização das trilhas

-- 1. Módulos da trilha "Aulas Semanais" → aula_ao_vivo
UPDATE modulos 
SET categoria = 'aula_ao_vivo' 
WHERE trilha_id = 'ba25c7a1-5d8d-4ea6-ac3b-cf52c4ac4eb6';

-- 2. Módulos das trilhas NÚCLEO → gravacao_videos
UPDATE modulos 
SET categoria = 'gravacao_videos' 
WHERE trilha_id IN (
  '83df428c-b86b-4887-a71f-9a427c5366d7',  -- Fundamentos de IA
  '39a7856f-65de-48b8-b98d-885274d40ef9',  -- Planilhas & Dados
  '8118b647-3250-4cc2-b21d-c5f4e570a26d',  -- Fundamentos de Automação
  '6b54e8e2-4644-4b9e-bf91-eed8fe918b04',  -- Comunicação com IA
  '302da0e7-1bf7-471b-83c4-0a3fef4e9e74'   -- Claude Avançado
);

-- 3. Módulos das trilhas FERRAMENTAS → gravacao_videos
UPDATE modulos 
SET categoria = 'gravacao_videos' 
WHERE trilha_id IN (
  '8393c6b0-e53a-43e6-aad3-dede5de8d504',  -- Dashboard e BI
  'b7ae7b03-1e83-4988-b726-6b45fa15180a',  -- Zapier
  'e69d86a7-e2e6-420d-8d23-22f86336cfe6',  -- Make
  '30356e58-4156-4e46-a6d1-2d29894f9b4f',  -- Apresentações
  'd03299b6-c5e2-4c62-91f0-0ddae52e16d6'   -- Apps Web
);

-- 4. Módulos das trilhas PROFISSÃO → conteudo_mentorados
UPDATE modulos 
SET categoria = 'conteudo_mentorados' 
WHERE trilha_id IN (
  '45dcf411-5e65-48e6-aeb9-5c4c6543e7e6',  -- IA para Vendas
  'a140758e-cc2d-4d54-b5ca-65837552e45f',  -- IA para Marketing
  '5e78b95d-3192-4ef7-ab3c-982a6db6c5f7',  -- IA para RH
  'e640f6aa-e3e8-4e94-96c1-1f2859d03cde',  -- IA para Gestão de Projetos
  '2aacb19a-02a4-4002-9000-20b0d712a683'   -- IA para Gestão de Equipe
);