-- Add 'mentorado' role to admin users for testing
-- This allows admin users to access mentoria sections

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'mentorado'::public.app_role
FROM auth.users
WHERE id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;