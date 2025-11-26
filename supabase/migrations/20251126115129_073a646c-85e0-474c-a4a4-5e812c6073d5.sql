-- Adicionar campos para rastrear origem de consultoria
ALTER TABLE public.profiles
ADD COLUMN origem_consultoria BOOLEAN DEFAULT false,
ADD COLUMN empresa_consultoria TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.origem_consultoria IS 'Indica se o usuário tem acesso via projeto Consult (cada consultoria tem direito a um acesso)';
COMMENT ON COLUMN public.profiles.empresa_consultoria IS 'Nome da empresa ou projeto de consultoria de origem (opcional)';