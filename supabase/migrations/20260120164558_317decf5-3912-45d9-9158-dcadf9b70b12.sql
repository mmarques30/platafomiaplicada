-- Criar bucket para recursos das instruções
INSERT INTO storage.buckets (id, name, public) 
VALUES ('instrucoes-recursos', 'instrucoes-recursos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies para o bucket
CREATE POLICY "Admins podem fazer upload de recursos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'instrucoes-recursos');

CREATE POLICY "Admins podem atualizar recursos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'instrucoes-recursos');

CREATE POLICY "Admins podem deletar recursos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'instrucoes-recursos');

CREATE POLICY "Qualquer um pode visualizar recursos" ON storage.objects
  FOR SELECT USING (bucket_id = 'instrucoes-recursos');