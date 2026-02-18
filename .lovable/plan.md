

# Editar Responsavel nos Projetos do Backlog

## Problema
A secao "Responsavel" no modal de detalhes do projeto e somente leitura. Nao existe opcao para trocar ou atribuir um responsavel.

## Solucao

Trocar o display estatico do responsavel por um Select editavel, populado com os membros ativos da equipe. Qualquer membro pode alterar.

### Alteracoes

**1. `src/components/skills/backlog/ProjetoDetailModal.tsx`**

- Adicionar uma query para buscar membros ativos da equipe usando `membros_equipe_skills` + `profiles`
- Substituir a secao read-only do responsavel por um `Select` com avatar e nome de cada membro
- Incluir opcao "Sem responsavel" para remover atribuicao
- Ao selecionar, chamar `onUpdate(item.id, { responsavel_id: selectedId })` que ja esta conectado ao `updateItem` do hook

**2. `src/hooks/useSkillsBacklog.ts`**

- Nenhuma alteracao necessaria. O `updateItem` ja suporta atualizar qualquer campo, incluindo `responsavel_id`.

### Detalhes tecnicos

O modal recebera o `equipeId` como nova prop (vindo do `useSkillsMembro` no `BacklogView`). Com o `equipeId`, fara uma query:

```typescript
supabase
  .from("membros_equipe_skills")
  .select("user_id, profiles!membros_equipe_skills_user_id_fkey(id, nome_completo, avatar_url)")
  .eq("equipe_id", equipeId)
  .eq("status", "ativo")
```

O Select mostrara o avatar + nome de cada membro, e a opcao "Sem responsavel" (valor `null`).

### Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `ProjetoDetailModal.tsx` | Query de membros + Select editavel para responsavel |
| `BacklogView.tsx` | Passar `equipeId` como prop para o modal |

Nenhuma alteracao no banco de dados. A RLS ja permite que todos os membros atualizem o backlog.
