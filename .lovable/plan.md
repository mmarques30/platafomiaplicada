

# Substituir cards por Gráfico Gantt de Entregas

## Resumo
Remover os dois cards (Próximos Passos e Entregas Concluídas) e substituir por um gráfico Gantt horizontal customizado com CSS/HTML puro, mostrando as entregas distribuídas por suas datas de prazo (`prazo_previsto`), com barras coloridas por status.

## Alterações

### 1. Criar `src/components/meu-sistema/GanttEntregas.tsx`
Novo componente que renderiza um gráfico Gantt horizontal:
- Recebe `entregas: EntregaBusiness[]` e opcionalmente `dataInicio`/`dataFim` do contrato como range
- Cada entrega vira uma linha com barra posicionada de acordo com `created_at` até `prazo_previsto`
- Entregas sem `prazo_previsto` usam uma largura fixa ou estimada
- Barras coloridas por status: verde (concluída), azul/primary (em andamento), cinza (pendente), vermelho (cancelada)
- Eixo horizontal mostra meses
- Scroll horizontal se necessário, ocupando largura total
- Ao clicar numa barra, abre dialog com detalhes (reutilizar padrão do ProximosPassosCard)
- Componente dentro de um Card com título "Cronograma de Entregas"

### 2. Atualizar `src/pages/MeuSistema.tsx`
- Remover imports de `ProximosPassosCard` e `EntregasConcluidasCard`
- Substituir o `grid md:grid-cols-2` pelos dois cards por `<GanttEntregas>` passando as entregas e datas do contrato
- O Gantt ocupa largura total (sem grid de 2 colunas)

2 arquivos (1 novo, 1 editado).

