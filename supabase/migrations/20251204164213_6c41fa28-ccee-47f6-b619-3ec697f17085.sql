-- Drop the restrictive policy
DROP POLICY IF EXISTS "Qualquer pessoa pode enviar candidatura" ON candidaturas_mentoria;

-- Recreate as PERMISSIVE (default behavior when not specifying RESTRICTIVE)
CREATE POLICY "Qualquer pessoa pode enviar candidatura"
ON candidaturas_mentoria
FOR INSERT
WITH CHECK (true);