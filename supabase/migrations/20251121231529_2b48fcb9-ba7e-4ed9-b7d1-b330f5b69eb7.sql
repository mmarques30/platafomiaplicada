-- Remove políticas RLS da tabela objetivos_mentoria
DROP POLICY IF EXISTS "Admins can delete all objetivos" ON objetivos_mentoria;
DROP POLICY IF EXISTS "Admins can insert objetivos for any user" ON objetivos_mentoria;
DROP POLICY IF EXISTS "Admins can update all objetivos" ON objetivos_mentoria;
DROP POLICY IF EXISTS "Admins can view all objetivos" ON objetivos_mentoria;
DROP POLICY IF EXISTS "Users can manage their own objetivos" ON objetivos_mentoria;
DROP POLICY IF EXISTS "Users can view their own objetivos" ON objetivos_mentoria;

-- Remove triggers relacionados
DROP TRIGGER IF EXISTS handle_updated_at ON objetivos_mentoria;
DROP TRIGGER IF EXISTS audit_objetivos_mentoria ON objetivos_mentoria;

-- Remove a tabela objetivos_mentoria
DROP TABLE IF EXISTS objetivos_mentoria;