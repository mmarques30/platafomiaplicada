
# Corrigir cores e titulo do Gantt

## Problema
1. As barras do Gantt usam cores apagadas/cinza (especialmente "pendente" com `muted-foreground/0.4` e textos em `text-muted-foreground`)
2. O titulo tem um icone `CalendarDays` que deve ser removido

## Solucao

### 1. Cores mais vivas no STATUS_CONFIG (linhas 27-32)
- `concluida`: bg verde forte `#738925` com opacidade total
- `em_andamento`: bg azul/primary com opacidade 100%
- `pendente`: trocar de `muted-foreground/0.4` para um amarelo/amber visivel como `#D4A017` 
- `cancelada`: vermelho mais visivel, opacidade maior

### 2. Remover icone do titulo (linhas 169-171)
- Remover `<CalendarDays>` do CardTitle principal
- Manter apenas o texto "Cronograma de Entregas"

### 3. Textos da sidebar mais visiveis (linha 240)
- Trocar `text-muted-foreground` dos titulos das entregas por `text-foreground` para ficarem legiveis

### 4. Texto nas barras (linha 363)
- Garantir que o texto dentro das barras use branco `#FFFFFF` em vez de `hsl(var(--card))` que pode ser cinza

1 arquivo editado: `GanttEntregas.tsx`
