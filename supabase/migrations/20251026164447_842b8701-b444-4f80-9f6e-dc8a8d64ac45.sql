-- Atualizar enum plano_mentoria para novos produtos (club e pro)
ALTER TYPE plano_mentoria RENAME TO plano_mentoria_old;

CREATE TYPE plano_mentoria AS ENUM ('club', 'pro');

-- Migrar dados existentes
ALTER TABLE profiles 
  ALTER COLUMN plano_mentoria TYPE plano_mentoria 
  USING (
    CASE 
      WHEN plano_mentoria::text = 'intensivo_grupo' THEN 'club'::plano_mentoria
      WHEN plano_mentoria::text = 'light' THEN 'club'::plano_mentoria  
      WHEN plano_mentoria::text = 'premium' THEN 'pro'::plano_mentoria
      ELSE NULL
    END
  );

DROP TYPE plano_mentoria_old;

COMMENT ON TYPE plano_mentoria IS 'Produtos de mentoria: club (R$2997 - encontros em grupo), pro (R$7997 - mentoria individual)';