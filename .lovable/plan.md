

## Diagnóstico dos dois problemas

### 1. "Removeu o expandir/recolher de Documentos"

Os Collapsibles que adicionamos **continuam intactos** em `MentoriaDocumentos.tsx` (linha 237) e `MeuSistemaDocumentos.tsx` (linha 238) — visão do mentorado.

O que está sem Collapsible é o painel **administrativo** em `src/components/admin/business/DocumentosBusinessManager.tsx` (linha 84-108) — usado quando você acessa Admin → Mentoria → ver mentorado. Esse nunca recebeu o tratamento. Você está vendo essa tela e por isso parece que "sumiu".

### 2. "Não consigo editar entrega gerada por IA antes de salvar"

Inspecionei o modal `GeracaoEntregasModal` → `DroppableFase` → `DraggableEntrega`:

- Ao clicar no ícone de lápis da entrega (`DraggableEntrega.tsx` linha 189-197), o painel de edição abre **fora** do bloco `isExpanded` (linha 210-255). Ou seja: se a entrega estiver **recolhida**, o painel de edição abre colado no header, mas não tem botão **"Concluir/Fechar"** — só fecha clicando de novo no lápis (que vira um X só dentro do bloco de instrução, não da entrega).
- Mesma coisa na edição da **Fase** (`DroppableFase.tsx` linha 228-248): abre o editor inline mas sem botão de "Pronto"/"Fechar" — e o lápis dela nem muda de ícone.
- Pior: os campos de edição da entrega usam o handler `onUpdateEntrega` que dispara em **cada keystroke**. O React re-renderiza a árvore inteira do modal a cada letra, e em contratos com muitas entregas isso fica visivelmente travado, dando a sensação de "não consegue editar".
- Também não há feedback visual de que a edição "pegou" (o título no header só atualiza ao fechar).

O botão "Salvar Selecionados" no rodapé do modal funciona normalmente — ele apenas exige que pelo menos uma fase ou entrega esteja **selecionada (checkbox marcado)**. Se durante a edição você desmarca a entrega sem querer, o botão fica desabilitado.

---

## Plano de correção

### Parte A — Voltar o expandir/recolher também no painel admin

Em `src/components/admin/business/DocumentosBusinessManager.tsx`:

- Envolver o bloco `<Tabs defaultValue="arquivos">` (linhas 94-108 + conteúdo) num `<Collapsible>`, idêntico ao padrão usado em `MentoriaDocumentos.tsx`:
  - Header clicável com ícone `FolderOpen`, título "Documentos e Links" e contagem resumida (`X arquivos · Y anotações · Z links`).
  - Estado `documentosExpandido` com `useState(true)`, persistido em `localStorage` por `contratoId` (chave `documentos-admin-expandido-${contratoId}`).
  - `ChevronDown` rotacionando.
- Manter o restante (Tabs, Arquivos, Anotações, Links) exatamente como está dentro do `<CollapsibleContent>`.

### Parte B — Tornar a edição inline de entrega/fase usável

Em `src/components/admin/business/DraggableEntrega.tsx`:

1. **Adicionar botão "Pronto" (com ícone Check) no rodapé do bloco de edição da entrega** (linha 254, fim do `editingHeader`), idêntico ao já existente no editor de instrução (linha 374-378). Ao clicar, fecha o editor (`setEditingHeader(false)`).
2. **Adicionar um banner sutil** acima dos campos: "Editando entrega — as alterações serão salvas quando você clicar em **Salvar Selecionados** no final do modal." Isso elimina a confusão de "clico em editar e não tem onde salvar".
3. **Mover o painel de edição da entrega para dentro do bloco `isExpanded`** OU forçar `setIsExpanded(true)` ao abrir a edição. Hoje, se a entrega está fechada, o painel abre numa posição estranha entre o header e nada. Vou abrir automaticamente.
4. **Trocar o ícone do botão lápis para X quando `editingHeader=true`** (igual já é feito no editor de instrução, linha 312). Sinal visual claro de "fechar".

Em `src/components/admin/business/DroppableFase.tsx`:

5. Mesmo tratamento: adicionar **botão "Pronto"** no fim do editor inline da fase (linha 247) e **trocar o lápis por X** quando `editingFase=true`.

### Parte C — Garantir que o usuário não perca seleção ao editar

Em `DraggableEntrega.tsx`:

6. Quando o usuário abre o editor (`setEditingHeader(true)`), **forçar `entrega.selecionada = true`** chamando `onUpdateEntrega(numero_entrega, { selecionada: true })`. Garante que o item editado nunca fique desmarcado por engano e o botão "Salvar Selecionados" continue habilitado.

### Arquivos editados

1. `src/components/admin/business/DocumentosBusinessManager.tsx` — adicionar Collapsible no admin.
2. `src/components/admin/business/DraggableEntrega.tsx` — botão "Pronto", banner, forçar expansão e seleção, ícone X.
3. `src/components/admin/business/DroppableFase.tsx` — botão "Pronto" + ícone X no editor de fase.

### Resultado esperado

- O painel admin de Documentos volta a ter o mesmo comportamento de expandir/recolher do mentorado.
- Editar uma entrega gerada pela IA antes de salvar fica óbvio: clica no lápis → abre o painel → digita → clica em **Pronto** → continua editando outras → clica em **Salvar Selecionados** no final.
- Mesma experiência ao editar fases.
- Não dá mais para "perder" uma entrega da seleção só por estar editando.

Sem alterações em hooks, banco ou edge functions.

