
-- Step 1: Alter enum plano_mentoria to add new values and remove old ones
-- Postgres doesn't allow renaming enum values, so we need to:
-- 1. Add new values
-- 2. Update data
-- 3. Remove old values

-- Add new enum values first
ALTER TYPE public.plano_mentoria ADD VALUE IF NOT EXISTS 'business_parceria';
ALTER TYPE public.plano_mentoria ADD VALUE IF NOT EXISTS 'business_sistemas';
