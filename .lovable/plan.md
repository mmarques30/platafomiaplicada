

# Hover states sutis em cards clicáveis

## Abordagem
Criar uma classe CSS utilitária `card-interactive` em `src/index.css` com o padrão de hover/active especificado, e aplicá-la nos cards clicáveis dos 5 contextos listados.

## 1. Nova classe em `src/index.css`
Adicionar dentro de `@layer components`:
```css
.card-interactive {
  transition: border-color 150ms ease, transform 150ms ease;
}
.card-interactive:hover {
  border-color: hsl(var(--muted-foreground) / 0.3);
  transform: scale(1.003);
}
.card-interactive:active {
  transform: scale(0.998);
}
```

## 2. Integrações (apenas adicionar a classe)

### `MentoriaEntregas.tsx` (linha ~104)
No `renderEntregaCard`, o Card não é clicável (sem onClick/cursor-pointer). **Sem alteração** — entregas não são clicáveis.

### `MentoriaTarefas.tsx` (linha ~139-141)
Card kanban: já tem `cursor-pointer`. Adicionar `card-interactive` à className.

### `MentoriaSessoes.tsx` (linha ~122-124)
TableRow com `cursor-pointer`: adicionar `card-interactive` à className da row.

### `TrilhaCard.tsx` (linha ~19)
O wrapper div dentro do Link: adicionar `card-interactive` à className existente.

### Dashboard — `StatsCard.tsx` (linha ~15)
Quando `onClick` existe: adicionar `card-interactive` à className condicional.

### Dashboard — `ConteudoCard.tsx` e `MaterialCard.tsx`
Cards com `cursor-pointer`: adicionar `card-interactive` à className.

## Arquivos editados
- `src/index.css` (1 classe nova)
- `src/pages/MentoriaTarefas.tsx`
- `src/pages/MentoriaSessoes.tsx`
- `src/components/shared/TrilhaCard.tsx`
- `src/components/admin/StatsCard.tsx`
- `src/components/dashboard/ConteudoCard.tsx`
- `src/components/dashboard/MaterialCard.tsx`

