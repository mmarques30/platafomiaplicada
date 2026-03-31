

# StaggerList — entrada escalonada de cards com Framer Motion

## 1. Novo componente: `src/components/ui/StaggerList.tsx`
Criar conforme especificado — `motion.div` com `staggerChildren: 0.06`, cada item com fade+translateY de 6px, duração 200ms. Usar `React.Children.toArray` para lidar com children de forma segura.

## 2. Aplicações

### `src/pages/MentoriaEntregas.tsx`
- **Linha 278-294**: Envolver `etapasOrdenadas.map(renderEtapaSection)` com `<StaggerList>`
- **Linha 289-291**: Envolver `entregasSemEtapa.map(renderEntregaCard)` dentro do grid com `<StaggerList>`

### `src/pages/MentoriaTarefas.tsx`
- **Kanban columns (linha 137-156)**: Envolver `tasks.map(...)` dentro de cada `KanbanColumn` com `<StaggerList>`

### `src/pages/MentoriaSessoes.tsx`
- Usa `<Table>` — StaggerList não se aplica a table rows. **Ignorado.**

### `src/pages/Trilhas.tsx` / `TodasAsTrilhas.tsx`
- Usa `<Carousel>` com Embla — StaggerList conflitaria com o scroll. **Ignorado.**

### Dashboard: `src/components/skills/visao-geral/ResumoPerformanceCards.tsx`
- **Linha 18-24**: Envolver os 4 `<KPICard>` com `<StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">` (substituindo a div grid atual)

## Arquivos
- **Novo**: `src/components/ui/StaggerList.tsx`
- **Editados**: `MentoriaEntregas.tsx`, `MentoriaTarefas.tsx`, `ResumoPerformanceCards.tsx`

