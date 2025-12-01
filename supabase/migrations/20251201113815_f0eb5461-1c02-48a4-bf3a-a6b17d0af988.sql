-- Adicionar campo de visibilidade por plano na tabela avisos
ALTER TABLE avisos 
ADD COLUMN visivel_para text[] DEFAULT ARRAY['visitante', 'academy', 'lab', 'skills', 'club'];

COMMENT ON COLUMN avisos.visivel_para IS 'Define quais tipos de usuário/planos podem visualizar este aviso';