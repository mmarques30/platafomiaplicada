-- Adicionar role de admin para mariana@iaplicada.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('63e8042f-22e0-4159-aa44-16a77a41eeb6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;