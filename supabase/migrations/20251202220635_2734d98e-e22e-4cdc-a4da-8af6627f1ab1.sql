-- Remove política permissiva que expõe documentos internos
DROP POLICY IF EXISTS "AI can read active knowledge" ON public.knowledge_base;

-- Mantém apenas a política de admin que já existe
-- "Admins can manage knowledge_base" já cobre todas as operações para admins

-- O edge function ai-chat-user usa service_role_key que bypassa RLS,
-- então o AI ainda conseguirá ler a knowledge_base sem precisar de política pública