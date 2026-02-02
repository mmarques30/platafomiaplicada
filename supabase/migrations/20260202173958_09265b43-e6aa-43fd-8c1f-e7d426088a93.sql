-- Adicionar novo valor ao enum plano_mentoria
ALTER TYPE plano_mentoria ADD VALUE 'business_iaplicada';

-- Atualizar menus para incluir novo plano onde business é permitido
UPDATE menu_config 
SET planos_permitidos = array_append(planos_permitidos, 'business_iaplicada')
WHERE 'business' = ANY(planos_permitidos)
AND NOT ('business_iaplicada' = ANY(planos_permitidos));