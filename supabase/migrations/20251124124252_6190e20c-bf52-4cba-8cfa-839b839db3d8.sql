-- FASE 1: Criar enum de níveis de acesso
CREATE TYPE nivel_acesso_plano AS ENUM ('club', 'boost', 'legacy');

-- FASE 2: Adicionar novos valores ao enum plano_mentoria
ALTER TYPE plano_mentoria ADD VALUE IF NOT EXISTS 'boost';
ALTER TYPE plano_mentoria ADD VALUE IF NOT EXISTS 'legacy';

-- FASE 3: Adicionar coluna nivel_minimo_acesso nas tabelas
ALTER TABLE trilhas ADD COLUMN nivel_minimo_acesso nivel_acesso_plano DEFAULT 'club';
ALTER TABLE modulos ADD COLUMN nivel_minimo_acesso nivel_acesso_plano DEFAULT 'club';
ALTER TABLE videos ADD COLUMN nivel_minimo_acesso nivel_acesso_plano DEFAULT 'club';