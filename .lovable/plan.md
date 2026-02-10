
# Corrigir erro no modal de edição + adicionar botão de transferência Ativa/Backlog

## Problema identificado

O erro no console é claro:
```
"invalid input syntax for type date: \"\""
```

Quando o admin abre o modal para editar uma entrega, campos como `prazo_previsto` e `etapa_id` são inicializados com `""` (string vazia). Ao salvar, essas strings vazias são enviadas ao banco, que rejeita `""` como valor de data ou UUID.

## Solução (2 ajustes no mesmo arquivo)

### Arquivo: `src/components/admin/business/EntregasBusinessManager.tsx`

**1. Sanitizar dados antes de enviar ao banco (handleSubmit)**

Converter strings vazias em `null` antes de chamar `updateEntrega.mutate` ou `createEntrega.mutate`:

```typescript
const handleSubmit = () => {
  if (!formData.titulo?.trim()) return;

  // Sanitizar: converter strings vazias em null/undefined
  const sanitized = {
    ...formData,
    prazo_previsto: formData.prazo_previsto || null,
    etapa_id: formData.etapa_id || null,
    modulo_relacionado: formData.modulo_relacionado || null,
    descricao: formData.descricao || null,
    justificativa_backlog: formData.justificativa_backlog || null,
  };

  if (editingEntrega) {
    updateEntrega.mutate({ id: editingEntrega.id, ...sanitized });
  } else {
    createEntrega.mutate({ contrato_id: contratoId, ...sanitized } as EntregaInput);
  }
  setModalOpen(false);
};
```

**2. Adicionar botão de transferência Ativa/Backlog no card**

No `renderEntregaCard`, adicionar um botão ao lado do botão de editar que alterna o `tipo` entre `'ativa'` e `'backlog'`:

- Importar icone `ArrowRightLeft` do lucide-react
- Botão com tooltip visual (title) indicando "Mover para Backlog" ou "Mover para Ativas"
- Ao clicar, chamar `updateEntrega.mutate({ id, tipo: novoTipo })`
- A lista atualiza automaticamente pelo react-query

## Resultado esperado

1. Modal de edição funciona sem erro ao salvar (campos vazios viram `null`)
2. Botão de transferência rápida em cada card permite mover entre Ativa e Backlog com um clique
