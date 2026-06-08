-- Coluna que faltou na migration anterior. Required no Step 3 do
-- diagnóstico Academy (schema academyStep3Schema). Sem ela, qualquer
-- cliente que chegasse ao Step 3 cairia no mesmo bug silencioso do
-- autosave (INSERT/UPDATE em coluna inexistente → erro engolido).

ALTER TABLE public.formulario_diagnostico
  ADD COLUMN IF NOT EXISTS resultado_esperado_30_dias text;
