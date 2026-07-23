-- Fix: auth.admin.deleteUser falha com "Database error deleting user" quando o
-- CASCADE/SET NULL em tabelas public esbarra em RLS (role supabase_auth_admin
-- não passa nas policies). Deletar via SECURITY DEFINER bypassa RLS e permite
-- o cascade completar.

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller uuid := auth.uid();
  caller_role text := coalesce(auth.role(), '');
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'userId é obrigatório';
  END IF;

  -- Chamada com JWT de usuário: exige admin.
  -- Chamada com service_role (edge function): auth.uid() é null.
  IF caller IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = caller
        AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Apenas administradores podem deletar usuários';
    END IF;

    IF p_user_id = caller THEN
      RAISE EXCEPTION 'Você não pode deletar sua própria conta';
    END IF;
  ELSIF caller_role <> 'service_role' THEN
    RAISE EXCEPTION 'Não autorizado';
  END IF;

  IF (
    SELECT count(*)::int
    FROM public.user_roles
    WHERE role = 'admin'
  ) = 1
  AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Não é possível deletar o último administrador do sistema';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário deletado com sucesso'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO service_role;

COMMENT ON FUNCTION public.admin_delete_user(uuid) IS
  'Admin-only user deletion that bypasses RLS on CASCADE/SET NULL from auth.users';

-- Hotfix complementar: permite que o cascade do auth.admin.deleteUser
-- (role supabase_auth_admin) passe no RLS das tabelas public que
-- referenciam auth.users / profiles. Mantém compatibilidade com a edge
-- function antiga até o frontend/RPC novo estar deployado.
DO $policies$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT c.relname AS table_name
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_class confc ON confc.oid = con.confrelid
    JOIN pg_namespace confn ON confn.oid = confc.relnamespace
    WHERE con.contype = 'f'
      AND n.nspname = 'public'
      AND (
        (confn.nspname = 'auth' AND confc.relname = 'users')
        OR (confn.nspname = 'public' AND confc.relname = 'profiles')
      )
      AND c.relrowsecurity
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY supabase_auth_admin_delete_user_cascade ON public.%I FOR ALL TO supabase_auth_admin USING (true) WITH CHECK (true)',
        r.table_name
      );
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
    END;
  END LOOP;
END
$policies$;
