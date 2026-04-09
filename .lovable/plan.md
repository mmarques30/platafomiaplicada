

# Fix: Anotações — botão salvar, formatação rica e organização por IA

## Problemas identificados

1. **Ao criar uma nova anotação**, ela aparece fechada (Collapsible). O usuário precisa clicar para expandir, e o botão Salvar só aparece após editar — fluxo confuso
2. **Sem ferramentas de formatação** — não há como inserir emojis, bullet points ou listas numeradas
3. **Sem botão de organização automática** — o usuário quer um botão que estruture o texto escrito de forma mais organizada

## Solução

**Arquivo**: `src/components/admin/business/NotasProjetoSection.tsx`

### 1. Auto-abrir nota recém-criada + botão Salvar sempre visível em modo edição

- Passar um prop `autoOpen` para `NotaCard` quando a nota acabou de ser criada
- O botão **Salvar** ficará sempre visível quando a nota estiver aberta em modo edição (não apenas quando `dirty`). Quando não houver alterações, ficará desabilitado

### 2. Barra de formatação com emojis, bullets e números

Adicionar uma toolbar acima do `Textarea` com botões:
- **Bullet point** (`•`) — insere `• ` no cursor
- **Lista numerada** (`1.`) — insere `1. ` no cursor  
- **Emoji picker** — popover com emojis comuns (categorias: geral, status, objetos) que insere no cursor

A inserção será feita manipulando o valor do textarea na posição do cursor (`selectionStart`).

### 3. Botão "Organizar com IA"

- Ícone de varinha/sparkles com label "Organizar"
- Ao clicar, envia o conteúdo atual para o Lovable AI Gateway (modelo `google/gemini-2.5-flash-lite`) com prompt para:
  - Estruturar o texto em tópicos
  - Corrigir ortografia
  - Manter o conteúdo original, apenas reorganizar
- Substitui o conteúdo do textarea com o resultado e marca como `dirty`
- Loading state no botão durante processamento

### Mudanças concretas

| Arquivo | Ação |
|---|---|
| `src/components/admin/business/NotasProjetoSection.tsx` | Editar — toolbar, auto-open, salvar visível, botão IA |
| `supabase/functions/organizar-nota/index.ts` | Criar — edge function para chamar IA e organizar texto |

### Detalhes técnicos

- Edge function recebe `{ conteudo: string }` e retorna `{ resultado: string }`
- Usa Lovable AI Gateway para processar o texto
- Emoji picker implementado como Popover com grid de emojis comuns (sem dependência externa)
- `useRef` no textarea para controlar posição do cursor na inserção de formatação

