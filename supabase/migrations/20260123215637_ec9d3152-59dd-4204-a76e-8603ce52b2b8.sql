-- Add numero_entrega column to entregas_business table
ALTER TABLE entregas_business 
ADD COLUMN IF NOT EXISTS numero_entrega INTEGER;

-- Update existing entregas with ordem as numero_entrega
UPDATE entregas_business 
SET numero_entrega = ordem 
WHERE numero_entrega IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN entregas_business.numero_entrega IS 'Número original da entrega conforme documento importado';