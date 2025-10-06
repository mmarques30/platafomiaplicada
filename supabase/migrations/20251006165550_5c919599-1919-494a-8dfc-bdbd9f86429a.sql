-- Criar enum para planos de mentoria
CREATE TYPE public.plano_mentoria AS ENUM (
  'intensivo_grupo',
  'light',
  'premium'
);

-- Adicionar coluna plano_mentoria na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN plano_mentoria public.plano_mentoria;