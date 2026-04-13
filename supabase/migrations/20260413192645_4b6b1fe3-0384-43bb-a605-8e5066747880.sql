ALTER TABLE notas_projeto_business
  DROP CONSTRAINT notas_projeto_business_created_by_fkey,
  ADD CONSTRAINT notas_projeto_business_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE webhook_lia_logs
  DROP CONSTRAINT webhook_lia_logs_user_created_id_fkey,
  ADD CONSTRAINT webhook_lia_logs_user_created_id_fkey
    FOREIGN KEY (user_created_id) REFERENCES auth.users(id) ON DELETE SET NULL;