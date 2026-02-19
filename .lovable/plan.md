
# Editar Titulo e Descricao de Projetos e Entregas IA

## Problema atual

1. **Projeto (ProjetoDetailModal)**: O titulo do projeto e exibido como texto estatico no `DialogTitle`. Nao ha campo de descricao editavel visivel (a descricao existe mas e exibida como texto).
2. **Entrega IA (EntregaSkillsEditModal)**: O titulo da entrega e exibido como `<p>` estatico (linha 151). A descricao ja e editavel via `Textarea`. A interface `onSave` nao inclui `titulo`.

Nota: A entrega manual (`EntregaEquipeModal`) ja possui titulo e descricao editaveis -- nao precisa de alteracao.

## Alteracoes

### 1. ProjetoDetailModal.tsx - Titulo e Descricao editaveis

- Adicionar estados `tituloValue` e `descricaoValue` (mesmo padrao de `obsValue`/`areaValue` com auto-save onBlur)
- Inicializar no `useEffect` existente
- Substituir o titulo estatico `{item.titulo}` no `DialogTitle` por um `Input` editavel (quando `onUpdate` existe), com `onBlur` que chama `onUpdate(item.id, { titulo })`
- Localizar onde a descricao e exibida e torna-la editavel com `Textarea` + `onBlur` auto-save, seguindo o mesmo padrao das observacoes

### 2. EntregaSkillsEditModal.tsx - Titulo editavel

- Adicionar estado `tituloValue` inicializado com `entrega.titulo`
- Substituir `<p className="font-medium">{entrega.titulo}</p>` por um `Input` editavel
- Expandir a interface `onSave` para aceitar `titulo?: string`
- Incluir titulo no `hasChanges` e no `handleSave`

### 3. Chamadas do onSave (ProjetoSkillsEntregas.tsx)

- Verificar se o handler de `onSave` da `EntregaSkillsEditModal` repassa o campo `titulo` ao mutation de update. Ajustar se necessario.

## Comportamento esperado

1. Abrir projeto no modal: titulo aparece como Input editavel, descricao como Textarea editavel
2. Alterar e clicar fora: salva automaticamente (onBlur)
3. Abrir entrega IA: titulo aparece como Input editavel (em vez de texto estatico)
4. Clicar "Salvar Alteracoes" no modal de entrega: envia titulo atualizado junto com os demais campos

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Adicionar estados `tituloValue` e `descricaoValue`, substituir titulo estatico por `Input` com onBlur auto-save, tornar descricao editavel com `Textarea` + onBlur |
| `src/components/skills/EntregaSkillsEditModal.tsx` | Adicionar estado `tituloValue`, substituir `<p>` por `Input`, expandir interface `onSave` para incluir `titulo`, incluir no `hasChanges`/`handleSave` |
| `src/components/skills/ProjetoSkillsEntregas.tsx` | Garantir que o handler de save da entrega IA repasse o campo `titulo` ao mutation |
