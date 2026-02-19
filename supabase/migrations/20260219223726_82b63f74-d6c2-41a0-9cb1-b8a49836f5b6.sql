ALTER TABLE biblioteca_prompts
  DROP CONSTRAINT biblioteca_prompts_modulo_id_fkey,
  ADD CONSTRAINT biblioteca_prompts_modulo_id_fkey
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL;