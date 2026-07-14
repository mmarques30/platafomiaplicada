-- Trilhas: ferramentas/modelos de IA compatíveis.
-- Permite deixar claro logo de início em quais ferramentas/modelos a trilha
-- pode ser aplicada (ex.: ChatGPT, Claude, Gemini, Google AI Studio),
-- exibido como badges e usado como filtro em "Aprender".

ALTER TABLE public.trilhas
  ADD COLUMN IF NOT EXISTS ferramentas text[] DEFAULT '{}';

COMMENT ON COLUMN public.trilhas.ferramentas IS 'Ferramentas/modelos de IA compatíveis com a trilha (ex.: ChatGPT, Claude, Gemini, Google AI Studio). Exibido como badges e usado no filtro em Aprender.';
