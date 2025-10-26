-- Criar bucket para imagens de módulos (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('modulos-imagens', 'modulos-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para bucket modulos-imagens
CREATE POLICY "Admins can upload modulo images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'modulos-imagens' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update modulo images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'modulos-imagens' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete modulo images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'modulos-imagens' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public can view modulo images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'modulos-imagens');

-- Remover trigger e função que força categoria da trilha nos módulos
DROP TRIGGER IF EXISTS set_modulo_categoria ON modulos;
DROP FUNCTION IF EXISTS public.modulo_set_categoria() CASCADE;

-- Remover trigger e função que cascateia mudanças de categoria da trilha
DROP TRIGGER IF EXISTS cascade_update_modulos ON trilhas;
DROP FUNCTION IF EXISTS public.trilha_categoria_changed() CASCADE;

-- Comentário explicativo
COMMENT ON COLUMN modulos.categoria IS 'Categoria personalizada do módulo - não mais herdada da trilha';