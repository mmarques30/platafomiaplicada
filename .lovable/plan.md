
# Corrigir scroll do Resumo de Atualizacoes

## Problema
O conteudo do resumo esta sendo cortado sem barra de rolagem. O `ScrollArea` do Radix precisa de uma altura fixa (`h-`) para ativar o scroll interno -- usar apenas `max-h-` nao funciona corretamente com esse componente.

## Solucao

### Arquivo: `src/components/admin/dashboard/ResumoTab.tsx`

Trocar `max-h-[500px]` por `h-auto max-h-[70vh]` no `ScrollArea`, e envolver com um container que tenha `overflow-hidden`. A abordagem com `vh` garante que o resumo ocupe ate 70% da tela, com scroll quando ultrapassar.

Alternativa mais simples e confiavel: remover o `ScrollArea` do Radix e usar `overflow-y-auto` nativo do CSS com `max-h`, que funciona sem precisar de altura fixa:

```tsx
<div className="max-h-[70vh] overflow-y-auto pr-2">
  <div className="prose prose-sm dark:prose-invert max-w-none">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {resumo}
    </ReactMarkdown>
  </div>
</div>
```

Isso resolve o corte de conteudo e adiciona scroll nativo quando o resumo for longo.
