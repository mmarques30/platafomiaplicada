-- Limpar tabela e policies anteriores se existirem
DROP TABLE IF EXISTS public.prompt_copy_logs CASCADE;

-- Criar tabela para rastreamento de prompts copiados
CREATE TABLE public.prompt_copy_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  prompt_id UUID NOT NULL,
  prompt_titulo TEXT NOT NULL,
  copied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompt_copy_logs ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can insert their own logs
CREATE POLICY "Users can log their own prompt copies"
ON public.prompt_copy_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: admins can view all logs (using user_roles table)
CREATE POLICY "Admins can view all prompt copy logs"
ON public.prompt_copy_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create indexes for faster queries
CREATE INDEX idx_prompt_copy_logs_prompt_id ON public.prompt_copy_logs(prompt_id);
CREATE INDEX idx_prompt_copy_logs_copied_at ON public.prompt_copy_logs(copied_at DESC);