-- Adicionar coluna para URL alternativa do Google Drive
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS google_drive_url text;

COMMENT ON COLUMN public.videos.google_drive_url IS 
  'URL alternativa do Google Drive para fallback quando YouTube não estiver disponível';

-- Atualizar o vídeo específico (video 20 - Pare de Fazer, Comece a Delegar)
UPDATE public.videos 
SET google_drive_url = 'https://drive.google.com/file/d/12HCoZ_I_k81q5TydookcUfyO8sxaEn-V/view?usp=sharing'
WHERE id = '38007daa-bf99-409f-993f-d996b595c734';