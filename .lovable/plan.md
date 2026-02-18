
# Tornar prazos e responsaveis editaveis nas entregas IA

## Problema atual

O modal de edicao de entregas IA (`EntregaSkillsEditModal`) exibe prazo e responsavel como **texto somente leitura**. O usuario nao consegue alterar esses campos. Alem disso, o hook `atualizarEntrega` so aceita `status`, `descricao` e `titulo` — ignorando `prazo` e `responsavel_id`.

As entregas manuais (`EntregaEquipeModal`) ja possuem prazo e responsavel editaveis. Nenhuma alteracao necessaria nesse modal.

## Solucao

### 1. `src/hooks/useSkillsEntregas.ts` — Expandir mutation

Alterar o tipo do `atualizarEntrega` para aceitar tambem `prazo` e `responsavel_id`:

```
dados: Partial<{ status; descricao; titulo; prazo; responsavel_id }>
```

### 2. `src/components/skills/EntregaSkillsEditModal.tsx` — Campos editaveis

- **Responsavel**: Trocar texto estatico por um `Select` com a lista de membros da equipe (recebido via nova prop `membros`)
- **Prazo**: Trocar texto estatico por um `DatePicker` (Popover + Calendar, mesmo padrao do `EntregaEquipeModal`)
- Atualizar `onSave` para incluir `prazo` e `responsavel_id` quando alterados
- Atualizar a interface `Props` para receber `membros: { id: string; nome_completo: string }[]`

### 3. Chamadas do modal — Passar membros

Nos arquivos que usam `EntregaSkillsEditModal` (`ProjetoSkillsEntregas.tsx` e `SkillsEntregas.tsx`), passar a prop `membros` que ja e buscada para os filtros.

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/hooks/useSkillsEntregas.ts` | Expandir tipo da mutation `atualizarEntrega` para incluir `prazo` e `responsavel_id` |
| `src/components/skills/EntregaSkillsEditModal.tsx` | Adicionar prop `membros`; trocar responsavel por Select; trocar prazo por DatePicker com Calendar; incluir novos campos no `onSave` |
| `src/components/skills/ProjetoSkillsEntregas.tsx` | Passar `membros` ao `EntregaSkillsEditModal` |
| `src/pages/skills/SkillsEntregas.tsx` | Passar `membros` ao `EntregaSkillsEditModal` |
