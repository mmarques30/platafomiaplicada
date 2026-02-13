

# Correcao de Cor dos Titulos nos Headers Escuros

## Problema

Os titulos e descricoes nos headers escuros (`bg-[#0D0D0D]`) dos cards "Impacto vs ROI", "Ranking de Entregas" e "Entregas Projetadas vs Executadas" aparecem com texto escuro ilegivel. Isso ocorre porque o componente `Card` aplica `text-card-foreground` no container raiz, e essa cor e herdada pelos filhos, competindo com `text-white` aplicado via className.

## Solucao

Adicionar `text-white` diretamente no `CardHeader` com fundo escuro para garantir que todos os elementos filhos herdem a cor clara. Isso resolve a heranca de `text-card-foreground` do Card pai.

## Arquivos a Modificar

### 1. `src/components/skills/performance/MemberDonutCharts.tsx` (linhas 124 e 139)
- Mudar `<CardHeader className="bg-[#0D0D0D] rounded-t-xl">` para `<CardHeader className="bg-[#0D0D0D] rounded-t-xl text-white">`
- Manter `text-white/50` no CardDescription para a descricao mais suave

### 2. `src/components/skills/ProjetoSkillsPerformance.tsx` (linha 154)
- Mudar `<CardHeader className="bg-[#0D0D0D] rounded-t-xl">` para `<CardHeader className="bg-[#0D0D0D] rounded-t-xl text-white">`

### 3. `src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx` (linha 45)
- Mudar `<CardHeader className="bg-[#0D0D0D] rounded-t-xl pb-2">` para `<CardHeader className="bg-[#0D0D0D] rounded-t-xl pb-2 text-white">`

## Detalhe Tecnico

O componente `Card` (em `src/components/ui/card.tsx`) aplica `text-card-foreground` no div raiz. O `CardTitle` nao possui classe de cor propria, herdando do pai. Ao adicionar `text-white` no `CardHeader`, quebramos essa heranca e garantimos que tanto o titulo quanto a descricao (que ja tem override via `text-white/50`) fiquem legiveis sobre o fundo preto.

