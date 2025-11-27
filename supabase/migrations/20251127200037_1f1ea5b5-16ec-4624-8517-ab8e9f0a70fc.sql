-- Atualizar trigger handle_new_user para criar visitantes automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, telefone, is_visitante, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    NEW.raw_user_meta_data->>'telefone',
    COALESCE((NEW.raw_user_meta_data->>'is_visitante')::boolean, false),
    NEW.email
  );
  
  -- Se for visitante, adicionar role automaticamente
  IF COALESCE((NEW.raw_user_meta_data->>'is_visitante')::boolean, false) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'visitante');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover policies antigas antes de criar as novas
DROP POLICY IF EXISTS "Users with roles can view active trilhas" ON trilhas;
DROP POLICY IF EXISTS "Users with roles can view active modulos" ON modulos;
DROP POLICY IF EXISTS "Users with roles can view active videos" ON videos;

-- RLS policies para visitantes visualizarem conteúdo marcado como visível
CREATE POLICY "Users and visitors can view active trilhas"
ON trilhas FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  (visivel_visitantes = true AND has_role(auth.uid(), 'visitante')) OR
  ((ativo = true) AND (visivel_mentorados = true) AND 
   (has_role(auth.uid(), 'mentorado') OR has_role(auth.uid(), 'aluno_trilha')) AND 
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);

CREATE POLICY "Users and visitors can view active modulos"
ON modulos FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  (visivel_visitantes = true AND has_role(auth.uid(), 'visitante')) OR
  ((ativo = true) AND (visivel_mentorados = true) AND 
   (has_role(auth.uid(), 'mentorado') OR has_role(auth.uid(), 'aluno_trilha')) AND 
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);

CREATE POLICY "Users and visitors can view active videos"
ON videos FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  (visivel_visitantes = true AND has_role(auth.uid(), 'visitante')) OR
  ((ativo = true) AND (visivel_mentorados = true) AND 
   (has_role(auth.uid(), 'mentorado') OR has_role(auth.uid(), 'aluno_trilha')) AND 
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);