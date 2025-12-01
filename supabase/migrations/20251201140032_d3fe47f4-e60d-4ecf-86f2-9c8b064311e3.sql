-- Criar tabela de logs de cliques em botões
CREATE TABLE IF NOT EXISTS button_click_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  button_type TEXT NOT NULL,
  page_origin TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar campos de origem na tabela candidaturas_mentoria
ALTER TABLE candidaturas_mentoria 
ADD COLUMN IF NOT EXISTS origem_pagina TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS plano_origem TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_visitante_origem BOOLEAN DEFAULT TRUE;

-- RLS para button_click_logs
ALTER TABLE button_click_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all click logs"
ON button_click_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert click logs"
ON button_click_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_button_click_logs_user_email ON button_click_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_button_click_logs_button_type ON button_click_logs(button_type);
CREATE INDEX IF NOT EXISTS idx_candidaturas_origem_pagina ON candidaturas_mentoria(origem_pagina);
CREATE INDEX IF NOT EXISTS idx_candidaturas_plano_origem ON candidaturas_mentoria(plano_origem);