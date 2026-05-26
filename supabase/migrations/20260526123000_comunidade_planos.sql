-- Disponibiliza o menu "Comunidade" (e subitens) para os planos Gratuito,
-- Academy, Business Parceria e Business Sistemas — antes restrito apenas ao
-- acesso de visitante/gratuito. Sobrescreve planos_permitidos com a lista
-- desejada. Idempotente.
UPDATE public.menu_config
SET planos_permitidos = ARRAY[
  'gratuito',
  'academy',
  'business_parceria',
  'business',
  'business_sistemas',
  'business_iaplicada'
]::text[]
WHERE menu_key IN (
  'comunidade',
  'comunidade_feed',
  'comunidade_sala',
  'comunidade_sala_aula'
);
