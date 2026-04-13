
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

CREATE INDEX idx_webhook_lia_logs_email ON webhook_lia_logs(customer_email);
CREATE INDEX idx_webhook_lia_logs_status ON webhook_lia_logs(status);
CREATE INDEX idx_webhook_lia_logs_created ON webhook_lia_logs(created_at DESC);

ALTER TABLE webhook_lia_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON webhook_lia_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read logs"
  ON webhook_lia_logs
  FOR SELECT
  TO authenticated
  USING (true);
