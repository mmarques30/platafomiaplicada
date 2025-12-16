-- Add links_url column to ia_copie_use table
ALTER TABLE ia_copie_use 
ADD COLUMN IF NOT EXISTS links_url jsonb DEFAULT '[]'::jsonb;