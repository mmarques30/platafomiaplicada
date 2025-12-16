-- Add links_url column for multiple external links
ALTER TABLE public.materiais_gratuitos
ADD COLUMN IF NOT EXISTS links_url JSONB DEFAULT '[]'::jsonb;