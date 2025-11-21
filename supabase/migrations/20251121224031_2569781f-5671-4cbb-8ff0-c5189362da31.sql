-- Permitir que admins façam UPDATE em objetivos de qualquer usuário
CREATE POLICY "Admins can update all objetivos"
ON objetivos_mentoria
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins façam DELETE em objetivos de qualquer usuário
CREATE POLICY "Admins can delete all objetivos"
ON objetivos_mentoria
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins façam INSERT em objetivos (criar para outros usuários)
CREATE POLICY "Admins can insert objetivos for any user"
ON objetivos_mentoria
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));