-- Remover 'skills' dos menus Academy-only para separar corretamente os ambientes
UPDATE menu_config 
SET planos_permitidos = ARRAY['academy'],
    updated_at = now()
WHERE menu_key IN ('evolucao', 'meu_diagnostico', 'minhas_duvidas');