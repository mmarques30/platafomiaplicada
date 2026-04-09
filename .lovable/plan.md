

# Remover JornadaStrip do Business Parceria (manter Roadmap)

## O que será feito

Remover apenas o componente `JornadaStrip` (linha do tempo com círculos numerados e conectores) da página de Mentoria para o Business Parceria. O Roadmap **não** será tocado.

## Arquivo: `src/pages/Mentoria.tsx`

**Linha 150** — alterar a condição de renderização do JornadaStrip para excluir Business Parceria:

```tsx
// De:
{(isBusinessParceria || isBusinessSistemas) && estagiosBusiness && <JornadaStrip estagios={estagiosBusiness} />}

// Para:
{isBusinessSistemas && estagiosBusiness && <JornadaStrip estagios={estagiosBusiness} />}
```

Isso remove a strip de estágios apenas do Business Parceria, mantendo-a para Business Sistemas e Academy.

## Sobre o Roadmap

Nenhuma alteração — o Roadmap permanecerá acessível. Para Business Parceria ele não aparece como aba (usa scroll contínuo), mas o submenu "Roadmap" no sidebar pode ser reativado se necessário. Se quiser que o Roadmap volte como seção no scroll contínuo, posso fazer isso num passo seguinte.

