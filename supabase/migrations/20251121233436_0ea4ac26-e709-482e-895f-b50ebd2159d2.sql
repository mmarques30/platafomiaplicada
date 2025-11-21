-- Adicionar coluna feedback_entregas à tabela sessoes_mentoria
ALTER TABLE sessoes_mentoria
ADD COLUMN feedback_entregas TEXT;

COMMENT ON COLUMN sessoes_mentoria.feedback_entregas IS 'Mudanças, melhorias e feedbacks das entregas discutidas na sessão';