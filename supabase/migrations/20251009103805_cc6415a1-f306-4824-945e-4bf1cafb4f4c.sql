-- Criar bucket para materiais de vídeos
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-materiais', 'video-materiais', true);

-- Políticas RLS para o bucket video-materiais
CREATE POLICY "Admins can upload video materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-materiais' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update video materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'video-materiais' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete video materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'video-materiais' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view video materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'video-materiais');

-- Criar tabela de auditoria de conteúdo
CREATE TABLE IF NOT EXISTS public.auditoria_conteudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  operacao TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES auth.users(id),
  dados_anteriores JSONB,
  dados_novos JSONB,
  campos_alterados TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.auditoria_conteudo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para auditoria
CREATE POLICY "Admins can view all audits"
ON public.auditoria_conteudo
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Função para registrar auditoria
CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  campos_alterados TEXT[] := ARRAY[]::TEXT[];
  col_name TEXT;
BEGIN
  -- Para UPDATE, identificar campos alterados
  IF TG_OP = 'UPDATE' THEN
    FOR col_name IN 
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME
        AND column_name NOT IN ('updated_at', 'created_at')
    LOOP
      IF to_jsonb(OLD) -> col_name IS DISTINCT FROM to_jsonb(NEW) -> col_name THEN
        campos_alterados := array_append(campos_alterados, col_name);
      END IF;
    END LOOP;
  END IF;

  -- Inserir registro de auditoria
  INSERT INTO public.auditoria_conteudo (
    tabela,
    registro_id,
    operacao,
    user_id,
    dados_anteriores,
    dados_novos,
    campos_alterados
  ) VALUES (
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    TG_OP,
    auth.uid(),
    CASE 
      WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
      ELSE NULL
    END,
    campos_alterados
  );

  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Criar triggers para auditoria em trilhas
DROP TRIGGER IF EXISTS trigger_auditoria_trilhas ON public.trilhas;
CREATE TRIGGER trigger_auditoria_trilhas
  AFTER INSERT OR UPDATE OR DELETE ON public.trilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_auditoria();

-- Criar triggers para auditoria em modulos
DROP TRIGGER IF EXISTS trigger_auditoria_modulos ON public.modulos;
CREATE TRIGGER trigger_auditoria_modulos
  AFTER INSERT OR UPDATE OR DELETE ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_auditoria();

-- Criar triggers para auditoria em videos
DROP TRIGGER IF EXISTS trigger_auditoria_videos ON public.videos;
CREATE TRIGGER trigger_auditoria_videos
  AFTER INSERT OR UPDATE OR DELETE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_auditoria();