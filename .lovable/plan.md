

# Corrigir TimelineEtapas (RoadMap) para alinhar com visual dos cards

## Problema
O roadmap atual usa um estilo vertical timeline com dots e linhas finas que nao combina com os cards escuros do dashboard. A barra de progresso e pequena (h-1.5) e o visual geral esta desalinhado.

## Solucao
Refazer o TimelineEtapas para usar o mesmo fundo escuro (`bg-[hsl(var(--chart-4))]`) dos cards, com layout horizontal estilo roadmap visual, barras de progresso maiores, e tipografia em branco consistente.

## Alteracoes em `src/components/meu-sistema/TimelineEtapas.tsx`

1. **Container**: Envolver tudo em um Card com `bg-[hsl(var(--chart-4))]` rounded-xl, titulo "RoadMap" em branco dentro do card
2. **Timeline horizontal**: Linha horizontal conectando nodes (circulos) de cada etapa, com gradiente do verde ao muted
3. **Nodes**: Circulos maiores (w-10 h-10) com icones de status, cores por status (emerald para concluida, primary para em andamento, white/30 para pendente)
4. **Labels**: Titulo da etapa abaixo do node em `text-white/90`, numero da etapa em `text-white/50`
5. **Barra de progresso geral**: Altura maior (h-2.5), gradiente verde, com label "Progresso geral" e contagem de etapas em branco
6. **Scroll horizontal em mobile**: overflow-x-auto para muitas etapas
7. **Animacoes**: framer-motion fade-in staggered nos nodes
8. **Click**: Manter navegacao ao clicar na etapa
9. **Progresso por etapa**: Mostrar % abaixo do titulo de cada node em texto pequeno

1 arquivo editado.

