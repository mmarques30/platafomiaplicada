-- Função para verificar se um email pertence a um mentorado
-- SECURITY DEFINER permite bypass do RLS de forma segura
CREATE OR REPLACE FUNCTION public.verificar_email_mentorado(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mentorado BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE email = LOWER(TRIM(email_input))
      AND plano_mentoria IS NOT NULL
      AND is_visitante = false
      AND conta_ativa = true
  ) INTO is_mentorado;
  
  RETURN COALESCE(is_mentorado, false);
END;
$$;

-- Permitir que qualquer pessoa (incluindo anônimos) chame esta função
GRANT EXECUTE ON FUNCTION public.verificar_email_mentorado(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verificar_email_mentorado(TEXT) TO authenticated;