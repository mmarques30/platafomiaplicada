
# Adicionar campo editavel de Prioridade nos projetos

## Problema atual
No modal de detalhes do projeto (`ProjetoDetailModal`), a prioridade aparece apenas como um **Badge estatico** — nao ha como edita-la. Projetos criados sem prioridade ficam sem essa informacao para sempre, e projetos que precisam mudar de prioridade nao podem ser ajustados.

## Solucao

### Arquivo: `src/components/skills/backlog/ProjetoDetailModal.tsx`

Substituir o Badge estatico de prioridade (linhas 139-143) por um **Select editavel** (quando `onUpdate` estiver disponivel), seguindo o mesmo padrao ja usado para Responsavel e Area Impactada:

- Opcoes: **Alta**, **Media**, **Baixa**, **Sem prioridade**
- Persistencia via `onUpdate(item.id, { prioridade: valor })` — o hook `updateItem` ja aceita qualquer campo
- Quando `onUpdate` nao estiver disponivel (modo leitura), manter o Badge estatico atual
- Posicionar o Select ao lado do Badge de status, na mesma linha

Nenhuma alteracao de banco ou hook necessaria — o `updateItem` do `useSkillsBacklog` ja suporta qualquer campo.
