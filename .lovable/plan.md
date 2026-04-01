
Diagnóstico rápido:
- Verifiquei o código atual e a duplicação ainda existe em `src/pages/Mentoria.tsx` na aba `evolucao-aprendizado` (renderiza `BusinessProgressoConteudo` + `BusinessEvolucaoAprendizado` juntos).
- Em `src/pages/Evolucao.tsx` já está consolidado apenas com `BusinessEvolucaoAprendizado`.

Plano de ajuste:
1. Atualizar somente `src/pages/Mentoria.tsx`.
2. Remover o import de `BusinessProgressoConteudo`.
3. Na aba `evolucao-aprendizado`, remover `<BusinessProgressoConteudo />` e manter apenas `<BusinessEvolucaoAprendizado />`.
4. Não alterar cálculo, hooks, filtros, JSX estrutural de outras abas ou outros arquivos.

Resultado esperado:
- Business Parceria deixa de exibir blocos duplicados na “Evolução Aprendizado”.
- Layout fica consolidado em um único painel (o componente completo com filtros), igual ao padrão já aplicado em `/evolucao`.

Detalhes técnicos:
- Arquivo: `src/pages/Mentoria.tsx`
- Mudanças: 2 remoções (1 import + 1 render)
- Escopo: zero impacto em Academy, Skills, Business Sistemas e demais páginas
