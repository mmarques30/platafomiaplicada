-- Biblioteca de Ferramentas: novos critérios de classificação.
-- O ranking passa a considerar, além das avaliações da mentora e da comunidade,
-- a relevância de mercado e a atualidade dos modelos ("últimos modelos").
-- Ambos em escala 0–5, definidos pela mentora.

ALTER TABLE public.ferramentas_ia
  ADD COLUMN IF NOT EXISTS relevancia_mercado numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recencia_modelo numeric DEFAULT 0;

COMMENT ON COLUMN public.ferramentas_ia.relevancia_mercado IS 'Relevância de mercado (0-5), definida pela mentora. Usada no ranking da Biblioteca de Ferramentas.';
COMMENT ON COLUMN public.ferramentas_ia.recencia_modelo IS 'Atualidade dos modelos / "últimos modelos" (0-5), definida pela mentora. Usada no ranking da Biblioteca de Ferramentas.';
