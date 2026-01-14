-- ===============================================
-- MIGRAÇÃO PARTE 1: Adicionar 'business' aos enums
-- ===============================================

-- 1. Adicionar 'business' ao enum plano_mentoria
ALTER TYPE plano_mentoria ADD VALUE IF NOT EXISTS 'business';

-- 2. Adicionar 'business' ao enum nivel_acesso_plano
ALTER TYPE nivel_acesso_plano ADD VALUE IF NOT EXISTS 'business';