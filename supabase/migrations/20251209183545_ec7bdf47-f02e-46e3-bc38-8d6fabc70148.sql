-- 1. auditoria_conteudo: alterar para SET NULL
ALTER TABLE auditoria_conteudo 
DROP CONSTRAINT IF EXISTS auditoria_conteudo_user_id_fkey;

ALTER TABLE auditoria_conteudo 
ADD CONSTRAINT auditoria_conteudo_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. button_click_logs: alterar para SET NULL
ALTER TABLE button_click_logs 
DROP CONSTRAINT IF EXISTS button_click_logs_user_id_fkey;

ALTER TABLE button_click_logs 
ADD CONSTRAINT button_click_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;