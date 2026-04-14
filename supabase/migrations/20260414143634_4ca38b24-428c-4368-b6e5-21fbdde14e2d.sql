
-- backlog_skills.colaborador_id
ALTER TABLE public.backlog_skills DROP CONSTRAINT IF EXISTS backlog_skills_colaborador_id_fkey;
ALTER TABLE public.backlog_skills ADD CONSTRAINT backlog_skills_colaborador_id_fkey FOREIGN KEY (colaborador_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- backlog_skills.responsavel_id
ALTER TABLE public.backlog_skills DROP CONSTRAINT IF EXISTS backlog_skills_responsavel_id_fkey;
ALTER TABLE public.backlog_skills ADD CONSTRAINT backlog_skills_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- candidaturas_mentoria.admin_responsavel
ALTER TABLE public.candidaturas_mentoria DROP CONSTRAINT IF EXISTS candidaturas_mentoria_admin_responsavel_fkey;
ALTER TABLE public.candidaturas_mentoria ADD CONSTRAINT candidaturas_mentoria_admin_responsavel_fkey FOREIGN KEY (admin_responsavel) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- duvidas_mentoria.respondida_por
ALTER TABLE public.duvidas_mentoria DROP CONSTRAINT IF EXISTS duvidas_mentoria_respondida_por_fkey;
ALTER TABLE public.duvidas_mentoria ADD CONSTRAINT duvidas_mentoria_respondida_por_fkey FOREIGN KEY (respondida_por) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- melhorias_plataforma.created_by
ALTER TABLE public.melhorias_plataforma DROP CONSTRAINT IF EXISTS melhorias_plataforma_created_by_fkey;
ALTER TABLE public.melhorias_plataforma ADD CONSTRAINT melhorias_plataforma_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- premiacoes_comunidade.vencedor_id
ALTER TABLE public.premiacoes_comunidade DROP CONSTRAINT IF EXISTS premiacoes_comunidade_vencedor_id_fkey;
ALTER TABLE public.premiacoes_comunidade ADD CONSTRAINT premiacoes_comunidade_vencedor_id_fkey FOREIGN KEY (vencedor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- subtarefas_entregas_skills.responsavel_id
ALTER TABLE public.subtarefas_entregas_skills DROP CONSTRAINT IF EXISTS subtarefas_entregas_skills_responsavel_id_fkey;
ALTER TABLE public.subtarefas_entregas_skills ADD CONSTRAINT subtarefas_entregas_skills_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
