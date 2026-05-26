-- Libera o grupo "Aprender" (menu pai) e "Trilhas" para o plano Business
-- Parceria, que tem acesso completo ao Academy. Apenas anexa os planos
-- business aos que já têm restrição de planos_permitidos (os com NULL já
-- são visíveis a todos). Idempotente.
UPDATE public.menu_config
SET planos_permitidos = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(planos_permitidos, ARRAY[]::text[]) || ARRAY['business_parceria', 'business']
    )
  )
)
WHERE menu_key IN ('aprender', 'trilhas')
  AND planos_permitidos IS NOT NULL
  AND NOT (planos_permitidos @> ARRAY['business_parceria']::text[]);
