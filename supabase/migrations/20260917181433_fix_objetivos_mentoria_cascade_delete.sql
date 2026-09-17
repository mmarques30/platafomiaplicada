-- Fix: objetivos_mentoria.formulario_id não tinha ON DELETE CASCADE,
-- bloqueando a deleção de usuários que tinham formulário de diagnóstico preenchido.
-- Erro: "update or delete on table "formulario_diagnostico" violates foreign key
-- constraint "objetivos_mentoria_formulario_id_fkey" on table "objetivos_mentoria""
ALTER TABLE public.objetivos_mentoria
  DROP CONSTRAINT IF EXISTS objetivos_mentoria_formulario_id_fkey;

ALTER TABLE public.objetivos_mentoria
  ADD CONSTRAINT objetivos_mentoria_formulario_id_fkey
  FOREIGN KEY (formulario_id)
  REFERENCES public.formulario_diagnostico(id)
  ON DELETE CASCADE;
