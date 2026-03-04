

# Refazer Gantt com layout estilo Haydenbleasel/Kibo-UI

## Referencia
O componente Gantt do Haydenbleasel apresenta:
- **Sidebar fixa a esquerda** com itens agrupados por categoria (collapsible groups)
- **Timeline a direita** com scroll horizontal independente
- **Header de meses** fixo no topo da timeline
- **Barras horizontais coloridas** por status, com cantos arredondados
- **Linha "Today"** vertical destacada
- **Layout split**: sidebar + timeline lado a lado
- **Altura fixa** com scroll vertical interno
- Dialog ao clicar na entrega

## Adaptacao para dados reais
- Agrupar entregas por `modulo_relacionado` (ou por etapa se modulo nao existir)
- Barras posicionadas por `created_at` ate `prazo_previsto`
- Cores por status: green (concluida), primary (em_andamento), muted (pendente), destructive (cancelada)
- Manter dialog de detalhes ao clicar

## Alteracoes

### `src/components/meu-sistema/GanttEntregas.tsx`
Reescrever completamente:

- **Layout split**: flex container com altura fixa (~400px), overflow hidden
  - **Sidebar** (w-[220px], border-right): lista de entregas agrupadas por modulo/etapa com headers collapsible, scroll vertical sincronizado
  - **Timeline** (flex-1): scroll horizontal + vertical, com header de meses sticky no topo
- **Header de meses**: cada mes ocupa largura fixa (ex: 150px), com nome capitalizado em pt-BR
- **Barras**: posicionadas absolutamente dentro de cada row, com cor do status, rounded-md, h-7, com label do titulo dentro da barra (truncado)
- **Today line**: linha vertical vermelha/primary cortando toda a timeline
- **Hover**: highlight na row inteira + tooltip
- **Click**: abre Dialog com detalhes (manter existente)
- **Grid lines**: linhas verticais sutis separando meses
- Usar framer-motion para fade-in das barras ao aparecerem

1 arquivo editado.

