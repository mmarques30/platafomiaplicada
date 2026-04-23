

## Diagnóstico

### Por que não dá pra editar
Hoje o `GeracaoEntregasModal` só permite **selecionar** (checkbox) e **arrastar** (drag & drop) entregas entre fases. Os campos `titulo`, `descricao`, `prompt_sugerido`, `dicas`, `prioridade`, `responsavel` e o objetivo da fase chegam da IA e vão direto pro banco — sem nenhum input editável.

### Por que demora tanto pra salvar
No `handleSalvar` (linhas 387–681), pra cada item selecionado o código faz:
1. Um `SELECT` pra checar se já existe
2. Um `INSERT` ou `UPDATE` separado

Para o seu caso (5 fases · 13 entregas · 409 instruções) isso vira **~850 round-trips sequenciais** ao banco. Cada um custa 50–150ms de latência. Conta: ~60 a 120 segundos só de rede, antes de qualquer processamento.

Além disso:
- Tudo é feito em loop `for ... of` com `await` dentro → 100% serial, sem paralelismo
- Sem progresso visual (usuário só vê "Salvando..." parado)
- Sem batch insert (`.insert([...])` aceita arrays e faz 1 round-trip pra N linhas)

## Plano

### 1. Edição inline no modal (`GeracaoEntregasModal.tsx` + `DroppableFase.tsx`)

Tornar editável **antes de salvar**:

**Por fase:**
- Título da fase (input)
- Objetivo (textarea pequena)

**Por entrega:**
- Título (input)
- Descrição (textarea)
- Prioridade (select: baixa/média/alta/urgente)
- Módulo relacionado (input)
- Botão "remover entrega" (ao invés de só desmarcar)

**Por instrução (passo):**
- Título (input)
- Descrição (textarea)
- Prompt sugerido (textarea)
- Dicas (textarea)
- Responsável (select: você/mentor/conjunto)
- Ferramenta (select)
- Botão "remover passo"

**Adicionar manualmente:**
- Botão "+ Nova entrega" dentro de cada fase
- Botão "+ Novo passo" dentro de cada entrega
- Botão "+ Nova fase" no topo

UI: cada item ganha um ícone de lápis (`Pencil`) que expande para edição inline. Dois cliques = pronto. Nada de modal aninhado.

### 2. Salvamento rápido com batch + paralelismo (`GeracaoEntregasModal.tsx → handleSalvar`)

Reescrever o pipeline:

**a) Pré-carregar dados existentes em 1 query por tabela:**
- 1 `SELECT id,titulo,status FROM entregas_business WHERE contrato_id = ?`
- 1 `SELECT id,titulo,status,entrega_id FROM instrucoes_etapa WHERE entrega_id IN (...)`
- 1 `SELECT id,titulo,status FROM tasks_business WHERE contrato_id = ?`

Construir Maps em memória (`titulo → registro`). Zero SELECT dentro do loop.

**b) Batch inserts:**
- Acumular todas as novas entregas num array → 1 `.insert([entrega1, entrega2, ...])`
- Mesmo para instruções, tasks e backlog
- 4 inserts grandes ao invés de 800 individuais

**c) Updates em paralelo com `Promise.all`:**
- Os updates ainda precisam ser por linha, mas podem rodar em paralelo (chunks de 20)

**d) Feedback de progresso:**
- Trocar "Salvando..." por barra de progresso real: "Salvando entregas (3/13)..."
- Um `useState` com `{etapa: 'entregas', current: N, total: M}`

**Ganho esperado:** de ~60–120s para **3–8s** no seu caso real.

### 3. Pequenas melhorias de UX

- Botão "Pré-visualizar SQL" (opcional, debug)
- Toast com resumo após salvar: "13 entregas, 409 passos criados em 4.2s"
- Manter o botão "Cancelar" funcional durante o save (abort controller)

## Arquivos a editar

1. `src/components/admin/business/GeracaoEntregasModal.tsx` — novos handlers de edit/add/remove em estado local + reescrita do `handleSalvar` com batch/paralelo + barra de progresso.
2. `src/components/admin/business/DroppableFase.tsx` — props de edição, botões de lápis/lixeira/adicionar, inputs inline.
3. (Possível) `src/components/admin/business/EntregaEditavel.tsx` — extrair card editável de entrega pra manter o `DroppableFase` legível.

Sem migration de banco. Sem mudança em edge function.

## Resultado esperado

- Você revisa, edita título/descrição/prompt/dicas de qualquer item, adiciona ou remove entregas/passos diretamente no modal antes de clicar em **Salvar**.
- Salvamento de 400+ itens cai de ~1–2 minutos para poucos segundos, com barra de progresso real.
- Possibilidade de cancelar no meio sem deixar dados pela metade (transação por bloco).

