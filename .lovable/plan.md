

# Nav-pill sticky + scroll contínuo para Business Parceria

## Resumo

Para `isBusinessParceria` apenas, substituir o `<Tabs>` por seções contínuas com nav-pill sticky e IntersectionObserver. Academy, Skills e Business Sistemas mantêm as abas inalteradas.

## Alterações

### Arquivo: `src/pages/Mentoria.tsx`

1. **Adicionar `useState`** ao import do React (já tem `useEffect`)

2. **Adicionar hook `activeSection`** + `useEffect` com IntersectionObserver para as 3 seções (`visao-geral`, `roadmap`, `evolucao`), com `threshold: 0.3`

3. **Substituir o bloco de renderização** (linhas 110-173) por condicional:
   - **Se `isBusinessParceria`**: renderizar nav-pill sticky + 3 `<section id="sec-...">` contínuas com os mesmos componentes internos (`BusinessVisaoGeralGrid`, `BusinessExecutiveRoadmap`, `BusinessEvolucaoAprendizado`)
   - **Senão**: manter o `<Tabs>` exatamente como está (Academy, Sistemas, etc.)

4. **Nav-pill**: `div` com `position: sticky`, `top: 64px`, `z-index: 40`, fundo `bg-background/80 backdrop-blur`, contendo 3 botões pill com estilo inline (verde `#AFC040` quando ativo)

5. **Seções**: cada `<section>` com `scroll-mt-28` para compensar header + nav-pill sticky, separadas por `<h2>` de título e os componentes existentes

### Nenhuma outra alteração — componentes filhos, auth, roles, planos, e abas de outros planos permanecem intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/Mentoria.tsx` | Editado — condicional Business Parceria com scroll contínuo |

