

# Fix: Observações não salvam no Skills

## Problema
Quando o usuário edita observações no modal de detalhe do projeto, o `onBlur` chama `updateItem.mutate` corretamente e o dado é salvo no banco. Porém, o `selectedItem` no `BacklogView` é uma cópia estática do objeto — ele não se atualiza quando a query refetcha os dados novos. Assim, o `useEffect` no `ProjetoDetailModal` vê os mesmos valores antigos e reseta o campo para o valor anterior.

## Solução

**Arquivo: `src/components/skills/backlog/BacklogView.tsx`**

Sincronizar o `selectedItem` com os dados atualizados do `items` sempre que estes mudarem:

```tsx
// Adicionar useEffect para manter selectedItem sincronizado
useEffect(() => {
  if (selectedItem) {
    const updated = items.find(i => i.id === selectedItem.id);
    if (updated) {
      setSelectedItem(updated);
    }
  }
}, [items]);
```

Isso garante que quando o `updateItem.mutate` invalida a query e os dados são refetchados, o `selectedItem` é atualizado com o objeto novo, e o `useEffect` no modal recebe os valores corretos.

