-- Tabela para registrar todos os eventos de webhook recebidos da Lia
CREATE TABLE IF NOT EXISTS webhook_lia_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  payload JSONB NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  offer_id TEXT,
  offer_name TEXT,
  bill_id TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  user_created_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para buscar por email e status
CREATE INDEX idx_webhook_lia_logs_email ON webhook_lia_logs(customer_email);
CREATE INDEX idx_webhook_lia_logs_status ON webhook_lia_logs(status);
CREATE INDEX idx_webhook_lia_logs_created ON webhook_lia_logs(created_at DESC);

-- RLS: apenas admins podem ver os logs
ALTER TABLE webhook_lia_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver logs de webhook"
  ON webhook_lia_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
