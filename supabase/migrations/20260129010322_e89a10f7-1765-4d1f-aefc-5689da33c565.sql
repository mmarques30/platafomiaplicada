-- =============================================
-- PROBLEMA 1: Corrigir RLS da tabela favoritos
-- =============================================

DROP POLICY IF EXISTS "Users can view their own favoritos" ON favoritos;
DROP POLICY IF EXISTS "Users can create their own favoritos" ON favoritos;
DROP POLICY IF EXISTS "Users can delete their own favoritos" ON favoritos;

CREATE POLICY "Users can view their own favoritos"
ON favoritos FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favoritos"
ON favoritos FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favoritos"
ON favoritos FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- PROBLEMA 2: Criar sistema de avaliações de ferramentas
-- =============================================

-- Criar tabela de avaliações individuais
CREATE TABLE avaliacoes_ferramentas_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta_id UUID NOT NULL REFERENCES ferramentas_ia(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ferramenta_id, user_id)
);

-- Habilitar RLS
ALTER TABLE avaliacoes_ferramentas_ia ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios podem ver todas as avaliacoes"
ON avaliacoes_ferramentas_ia FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Mentorados podem criar avaliacoes"
ON avaliacoes_ferramentas_ia FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  (has_role(auth.uid(), 'mentorado') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Usuarios podem atualizar suas avaliacoes"
ON avaliacoes_ferramentas_ia FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar suas avaliacoes"
ON avaliacoes_ferramentas_ia FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Função para atualizar estatísticas na tabela ferramentas_ia
CREATE OR REPLACE FUNCTION update_ferramenta_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ferramentas_ia
  SET 
    avaliacao_comunidade = (
      SELECT AVG(nota) FROM avaliacoes_ferramentas_ia 
      WHERE ferramenta_id = COALESCE(NEW.ferramenta_id, OLD.ferramenta_id)
    ),
    total_avaliacoes_comunidade = (
      SELECT COUNT(*) FROM avaliacoes_ferramentas_ia 
      WHERE ferramenta_id = COALESCE(NEW.ferramenta_id, OLD.ferramenta_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.ferramenta_id, OLD.ferramenta_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para atualizar automaticamente
CREATE TRIGGER on_avaliacao_ferramenta_change
AFTER INSERT OR UPDATE OR DELETE ON avaliacoes_ferramentas_ia
FOR EACH ROW EXECUTE FUNCTION update_ferramenta_rating_stats();