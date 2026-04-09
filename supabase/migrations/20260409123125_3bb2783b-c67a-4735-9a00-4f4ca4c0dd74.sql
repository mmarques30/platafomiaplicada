ALTER TABLE public.metodos_aplicar ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'skill';
ALTER TABLE public.metodos_aplicar ADD COLUMN IF NOT EXISTS ferramenta text;
ALTER TABLE public.metodos_aplicar ADD COLUMN IF NOT EXISTS nivel text DEFAULT 'intermediario';
ALTER TABLE public.metodos_aplicar ADD COLUMN IF NOT EXISTS imagem_url text;