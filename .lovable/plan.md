

# Simplificar Cards e Modal de Projetos

## 1. BacklogCard - Layout mais limpo

**Remover:** badge de area_impactada (classificacao como "TI", "Operacoes", "Financeiro")

**Novo layout do rodape do card:** responsavel (nome) e data de criacao lado a lado, sem icones

```
+----------------------------------+
| Titulo do projeto                |
| Descricao opcional...            |
| Lucio Torres        19/02/2026   |
+----------------------------------+
```

- Nome do responsavel a esquerda (texto simples, sem avatar)
- Data de criacao a direita (formato curto dd/mm/yy)
- Sem badges, sem icones internos

### Arquivo: `src/components/skills/backlog/BacklogCard.tsx`
- Remover import de `Badge` e `Avatar`/`AvatarFallback`/`AvatarImage`
- Substituir rodape atual (badge + avatares) por dois textos lado a lado: nome do responsavel e data formatada
- Adicionar import de `format` do `date-fns` para formatar a data

## 2. ProjetoDetailModal - Remover badge de status redundante

O modal atualmente mostra um badge de status E um dropdown de status. Como o dropdown ja permite ver e alterar o status, o badge separado e desnecessario.

### Arquivo: `src/components/skills/backlog/ProjetoDetailModal.tsx`
- Remover o bloco do badge de status (linhas 153-158) que mostra o badge visual do status atual
- Manter apenas o dropdown e os botoes de acao rapida de status

### Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `BacklogCard.tsx` | Remover Badge/Avatar, mostrar nome responsavel + data lado a lado |
| `ProjetoDetailModal.tsx` | Remover badge de status visivel (manter dropdown) |
| `useSkillsBacklog.ts` | Nenhuma alteracao necessaria (created_at ja disponivel) |

