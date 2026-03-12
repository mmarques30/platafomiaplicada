

# Fix: Erro ao incluir novo projeto no Skills

## Problema
O modal de "Novo Projeto" envia valores de prioridade como `p1`, `p2`, `p3`, mas a tabela `backlog_skills` tem uma constraint que só aceita `alta`, `media`, `baixa`. Isso causa erro no INSERT.

## Correção

**Arquivo: `src/components/skills/backlog/AddProjetoModal.tsx`** (linhas 131-138)

Alterar os valores do Select de prioridade de `p1/p2/p3` para `alta/media/baixa`:

```tsx
<SelectItem value="alta">Alta</SelectItem>
<SelectItem value="media">Média</SelectItem>
<SelectItem value="baixa">Baixa</SelectItem>
```

Mudança simples em 3 linhas no componente do modal.

