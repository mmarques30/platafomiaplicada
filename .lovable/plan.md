

# Ajustar cores e adicionar seção visual em MeuSistemaDocumentos

## 1. Corrigir cores dos stat cards

Os 4 stat cards no topo usam `bg-[#1a1a2e]` (azul escuro) e cores como `text-blue-400`, `text-purple-400` que não condizem com a marca. O padrão da plataforma usa `bg-[hsl(var(--chart-4))]` (verde da marca) conforme o `ProjetoOverviewCards`.

**Mudança**: Trocar fundo e cores dos ícones para o padrão verde da marca:
- Fundo dos cards: `bg-[hsl(var(--chart-4))]` (verde escuro da marca)
- Cores dos ícones: tons de `text-white/70` uniformes (como nos StatCards do overview)
- Texto: branco com opacidade como no padrão existente

## 2. Adicionar seção visual abaixo das tabs

Após o conteúdo das tabs, inserir uma seção de **Resumo do Projeto** com 2-3 cards informativos:

- **Evolução das Entregas**: Mini card com progresso visual (barra ou percentual) mostrando entregas concluídas vs total, usando dados do contrato
- **Atividade Recente**: Timeline compacta dos últimos 5 itens adicionados (arquivos, notas, links) com data e tipo, dando noção de movimentação
- **Insight do Projeto**: Card com texto dinâmico baseado nos dados disponíveis (ex: "Você tem X anotações e Y arquivos. Seu projeto está Z% concluído." ou dicas como "Adicione anotações para registrar decisões importantes")

Esses dados já existem no escopo do componente (`documentos`, `notas`, `links`, `contrato`).

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/pages/MeuSistemaDocumentos.tsx` | Editar — cores dos stat cards + nova seção visual |

## Detalhes técnicos

- Usar `contrato.data_inicio`, `contrato.data_fim` para calcular progresso temporal
- Combinar `documentos`, `notas`, `links` ordenados por `created_at` para timeline de atividade recente
- Insight textual gerado client-side com lógica condicional simples (sem IA)
- Cards seguem padrão escuro `bg-[hsl(var(--chart-4))]` com texto branco

