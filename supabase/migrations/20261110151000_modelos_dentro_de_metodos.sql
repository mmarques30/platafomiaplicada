-- Modelos prontos deixa de ser item de menu e vira aba de Métodos práticos.
--
-- As duas telas respondiam à mesma pergunta — "me dá o material pronto para
-- eu aplicar hoje" — e a pessoa tinha de adivinhar em qual das duas o que
-- ela procura foi parar. Métodos práticos passa a ter quatro abas: Skills,
-- Biblioteca, Materiais e Modelos.
--
-- A linha fica no banco, só invisível, como na saída dos menus da máquina de
-- projeto: se tiver que voltar a ser menu próprio, é um UPDATE. A rota
-- /ia-copie-use continua de pé e redireciona para a aba, então nenhum link
-- antigo quebra.
UPDATE public.menu_config
SET visivel = false, updated_at = now()
WHERE menu_key = 'ia_copie_use';
