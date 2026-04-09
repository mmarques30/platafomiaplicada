

# Fix: Conteúdo da página Entregas se adaptar ao espaço disponível (sidebar aberta/fechada)

## Problema
Quando o menu lateral está aberto, o conteúdo da página Entregas não se adapta ao espaço reduzido. Os placeholders do empty state não usam o Embla carousel (não têm `ref`), então os 6 cards ficam todos visíveis e estouram a largura. Apenas com o menu fechado o layout fica correto.

## Causa raiz
1. Os empty states de Telas e Vídeos **não usam `emblaRef`** — os cards ficam em `flex` simples sem controle de scroll
2. Os cards do empty state usam `w-[calc(33.333%-11px)]` que calcula baseado no container, mas com 6 cards o flex não quebra linha — todos ficam em uma linha só

## Solução

**Arquivo**: `src/pages/MeuSistemaEntregas.tsx`

### 1. Aplicar `emblaRef` nos empty states
Atribuir `emblaRef` ao container do empty state de Telas e `emblaRefVideos` ao de Vídeos. Isso faz o Embla controlar o scroll e as setas funcionarem nos placeholders também.

### 2. Trocar largura dos cards para largura fixa compatível com carrossel
Em vez de `w-[calc(33.333%-11px)]`, usar a mesma largura fixa dos cards reais (`w-[240px] md:w-[300px] lg:w-[340px]` para telas e `w-[220px] md:w-[280px] lg:w-[320px]` para vídeos). Isso garante que os cards não tentem ocupar 33% do container — o Embla controla quantos ficam visíveis.

### 3. Remover `pointer-events-none` parcial
Manter `opacity-50` nos cards mas permitir que as setas de navegação funcionem normalmente.

### Mudanças concretas

**Empty state Telas (linhas 236-254):**
- `<div className="overflow-hidden">` → `<div className="overflow-hidden" ref={emblaRef}>`
- Cards: `w-[calc(33.333%-11px)] min-w-[200px]` → `w-[240px] md:w-[300px] lg:w-[340px]`

**Empty state Vídeos (linhas ~310-340):**
- `<div className="overflow-hidden">` → `<div className="overflow-hidden" ref={emblaRefVideos}>`
- Cards: mesma mudança de largura para `w-[220px] md:w-[280px] lg:w-[320px]`

**Tabela de processos (linhas 90-91):**
- Adicionar `<div className="overflow-x-auto">` envolvendo a `<table>` para que em telas menores a tabela role horizontalmente dentro do container

