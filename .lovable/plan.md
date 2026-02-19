

# Mover filtros para abaixo do titulo em Trilhas de Aprendizado

## Problema
Os filtros (Ordenar e Classificacao) estao alinhados a direita (`justify-end`), ao lado do titulo. O usuario quer que fiquem abaixo do titulo.

## Solucao

### Arquivo: `src/pages/Trilhas.tsx`

Mover o componente `TodasAsTrilhas` para ficar apos o titulo, sem alteracoes.

### Arquivo: `src/components/dashboard/TodasAsTrilhas.tsx` (linha ~103)

Alterar a div dos filtros de `justify-end` para `justify-start`, alinhando-os a esquerda abaixo do titulo:

```tsx
// Antes
<div className="flex flex-wrap gap-3 justify-end">

// Depois
<div className="flex flex-wrap gap-3">
```

Isso remove o alinhamento a direita, fazendo os selects ficarem a esquerda, naturalmente abaixo do titulo "Trilhas de Aprendizado" que ja esta acima no layout da pagina.

