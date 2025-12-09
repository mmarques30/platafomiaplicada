-- Adicionar coluna recorrente à tabela aulas_semanais
ALTER TABLE public.aulas_semanais 
ADD COLUMN recorrente BOOLEAN DEFAULT false;