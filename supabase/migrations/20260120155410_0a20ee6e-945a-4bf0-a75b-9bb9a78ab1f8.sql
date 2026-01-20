-- Adicionar campos à tabela reports_business para suportar IA e HTML
ALTER TABLE reports_business ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'manual';
ALTER TABLE reports_business ADD COLUMN IF NOT EXISTS conteudo_html TEXT;
ALTER TABLE reports_business ADD COLUMN IF NOT EXISTS metricas JSONB;
ALTER TABLE reports_business ADD COLUMN IF NOT EXISTS gerado_por_ia BOOLEAN DEFAULT false;
ALTER TABLE reports_business ADD COLUMN IF NOT EXISTS resumo_executivo TEXT;

-- Criar tabela de links públicos para reports
CREATE TABLE IF NOT EXISTS reports_public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports_business(id) ON DELETE CASCADE,
  public_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE reports_public_links ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para links públicos
CREATE POLICY "Admins podem gerenciar links de reports" ON reports_public_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'equipe')
    )
  );

-- Permitir leitura pública pelo token (para a página pública)
CREATE POLICY "Qualquer um pode ler por token" ON reports_public_links
  FOR SELECT USING (true);