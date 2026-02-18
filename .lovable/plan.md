

# Corrigir fluxo de subtarefas nas entregas

## Problema identificado

Existem dois problemas impedindo o uso de subtarefas:

1. **Ao criar uma nova entrega**: O modal fecha imediatamente apos salvar (`onSuccess: () => setModalEquipeOpen(false)`). Como subtarefas precisam de um `entrega_equipe_id` para existir, a secao de subtarefas so aparece ao editar — mas o usuario nunca tem a oportunidade de continuar no modal apos a criacao.

2. **Entregas de IA**: O modal `EntregaSkillsEditModal` nao possui nenhuma secao de subtarefas. A tabela `subtarefas_entregas_skills` referencia apenas `entrega_equipe_id`, portanto subtarefas sao estruturalmente limitadas a entregas manuais.

## Solucao

### 1. Manter modal aberto apos criar entrega manual

Nos dois arquivos que controlam o fluxo (`ProjetoSkillsEntregas.tsx` e `SkillsEntregas.tsx`):

- Alterar `handleSaveEquipe`: apos o `upsertMutation` bem-sucedido para uma **nova** entrega (sem `id` no payload), em vez de fechar o modal, buscar o registro recem-criado e atualizar `selectedEquipe` com ele
- Isso fara o modal recarregar com o `entregaId` preenchido, revelando a secao de subtarefas automaticamente
- Manter o comportamento atual (fechar modal) para edicoes de entregas existentes

Logica:
```text
handleSaveEquipe(values):
  se values.id existe (edicao):
    upsertMutation -> fechar modal
  se values.id nao existe (criacao):
    upsertMutation -> buscar entrega recem-criada -> setSelectedEquipe(nova) -> manter modal aberto
```

### 2. Hook `useEntregasEquipe` — retornar dados do insert

- Alterar o `upsertMutation` para retornar os dados inseridos (usando `.select().single()` no insert), permitindo que o callback `onSuccess` receba o registro completo com o `id` gerado

### 3. Adicionar subtarefas ao modal de entregas IA (opcional mas recomendado)

- Adicionar a mesma secao de subtarefas do `EntregaEquipeModal` ao `EntregaSkillsEditModal`
- Reutilizar a mesma tabela `subtarefas_entregas_skills`, adicionando um campo opcional `entrega_skills_id` (UUID, nullable) para vincular subtarefas a entregas IA
- Isso requer uma migration para adicionar a coluna

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/hooks/useEntregasEquipe.ts` | Alterar insert para usar `.select().single()` e retornar o registro criado |
| `src/components/skills/ProjetoSkillsEntregas.tsx` | Alterar `handleSaveEquipe` para manter modal aberto apos criacao, atualizando `selectedEquipe` com o registro retornado |
| `src/pages/skills/SkillsEntregas.tsx` | Mesma alteracao do `handleSaveEquipe` |
| `src/components/skills/EntregaSkillsEditModal.tsx` | Adicionar secao de subtarefas (reutilizando logica do `EntregaEquipeModal`) |
| Migration SQL | Adicionar coluna `entrega_skills_id` (UUID nullable) na tabela `subtarefas_entregas_skills` |

## Comportamento esperado

- Ao criar uma nova entrega manual: o modal permanece aberto apos salvar, exibindo a secao de subtarefas para adicionar imediatamente
- Ao editar uma entrega manual: subtarefas continuam funcionando normalmente (sem mudanca)
- Ao editar uma entrega IA: nova secao de subtarefas disponivel no modal
- Subtarefas de entregas IA usam o mesmo padrao visual e funcional das manuais

