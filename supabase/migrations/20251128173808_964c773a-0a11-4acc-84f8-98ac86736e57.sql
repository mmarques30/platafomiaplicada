-- Função para adicionar pontos da comunidade e atualizar nível
CREATE OR REPLACE FUNCTION public.add_community_points(p_user_id UUID, p_points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Adicionar pontos
  UPDATE profiles
  SET 
    pontos_comunidade = pontos_comunidade + p_points,
    ultimo_acesso = NOW()
  WHERE id = p_user_id
  RETURNING pontos_comunidade INTO current_points;
  
  -- Calcular novo nível baseado em pontos
  -- Nível 1: 0-99, Nível 2: 100-299, Nível 3: 300-599, etc.
  new_level := CASE
    WHEN current_points < 100 THEN 1
    WHEN current_points < 300 THEN 2
    WHEN current_points < 600 THEN 3
    WHEN current_points < 1000 THEN 4
    WHEN current_points < 1500 THEN 5
    WHEN current_points < 2100 THEN 6
    WHEN current_points < 2800 THEN 7
    WHEN current_points < 3600 THEN 8
    ELSE 9
  END;
  
  -- Atualizar nível se mudou
  UPDATE profiles
  SET nivel_comunidade = new_level
  WHERE id = p_user_id;
END;
$$;

-- Função para atualizar último acesso do usuário
CREATE OR REPLACE FUNCTION public.update_last_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET ultimo_acesso = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$;