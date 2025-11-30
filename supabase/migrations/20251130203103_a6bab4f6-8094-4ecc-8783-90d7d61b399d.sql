-- Add bloqueada field to trilhas table for lock system
ALTER TABLE trilhas ADD COLUMN bloqueada BOOLEAN DEFAULT false;

COMMENT ON COLUMN trilhas.bloqueada IS 'Marca se a trilha deve aparecer bloqueada (com cadeado) no dashboard';