-- Add unique constraint for upsert to work
ALTER TABLE public.respostas_pesquisas
ADD CONSTRAINT respostas_pesquisas_pesquisa_user_unique 
UNIQUE (pesquisa_id, user_id);