

# Consolidar hover patterns e limpar CSS legado

## 1. `src/index.css` — Consolidar hovers

**Remover** (linhas 5-12): `.card-micro-hover` e `.card-micro-hover:hover`

**Atualizar** (linhas 14-24): `.card-interactive` — mudar `border-color` de `hsl(var(--muted-foreground) / 0.3)` para `rgba(175,192,64,0.25)` conforme especificado.

**Remover** (linhas 231-242): primeira definição de `.card-enhanced` e `.card-enhanced:hover`

**Remover** (linhas 466-472): segunda definição duplicada de `.card-enhanced`

## 2. `src/App.css` — Limpar todo o arquivo

Esvaziar completamente (ou remover). Todo o conteúdo é legado do template Vite: `.logo`, `.card`, `.read-the-docs`, `logo-spin`.

## 3. Substituir `card-micro-hover` → `card-interactive` nos componentes

- `src/components/dashboard/WeeklyProgressCard.tsx` (linha 72)
- `src/components/dashboard/NovidadesSemana.tsx` (linha 34)
- `src/components/dashboard/CentralConteudo.tsx` (linha 28)

## 4. Substituir `card-enhanced` → `card-interactive` nos componentes

- `src/components/shared/ProgressCard.tsx` (linha 28) — único uso encontrado

## 5. Temas: `adminTheme.ts` vs `painelTheme.ts`

Os dois arquivos servem propósitos diferentes — `adminTheme` define tokens para o painel administrativo (tabelas, filtros, stats cards), enquanto `painelTheme` define tokens para o Painel de Diagnóstico do mentorado (com variante Academy/Business). Os tokens não se sobrepõem significativamente. **Manter separados** e adicionar comentário explicativo no topo de cada arquivo clarificando o escopo.

## Arquivos

- **Editados**: `src/index.css`, `src/App.css`, `WeeklyProgressCard.tsx`, `NovidadesSemana.tsx`, `CentralConteudo.tsx`, `ProgressCard.tsx`, `adminTheme.ts`, `painelTheme.ts`

