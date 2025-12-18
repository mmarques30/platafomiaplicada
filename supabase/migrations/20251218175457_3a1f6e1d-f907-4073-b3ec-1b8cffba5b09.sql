-- Adicionar campos para Feedback da Mentora (Academy)
ALTER TABLE formulario_diagnostico
ADD COLUMN IF NOT EXISTS video_call_url TEXT,
ADD COLUMN IF NOT EXISTS transcricao_call_url TEXT,
ADD COLUMN IF NOT EXISTS link_plano_execucao TEXT,
ADD COLUMN IF NOT EXISTS feedback_mentora_em TIMESTAMP WITH TIME ZONE;