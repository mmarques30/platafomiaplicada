

# Refazer Overview Cards com design StatCard (count-up + trend)

## Referencia
O componente referenciado exibe cards com:
- Valor numerico grande com animacao count-up (framer-motion)
- Sufixo (ex: `%`)
- Titulo descritivo abaixo
- Linha de tendencia com icone (seta up/down), percentual de mudanca e descricao
- Cards com borda sutil, rounded, fundo limpo

## Adaptacao para dados reais

Os 4 cards atuais serao adaptados:

1. **Saude do Projeto** - Valor: texto "Saudavel"/"Em Risco"/"Avancado" (sem count-up, apenas fade-in). Trend: comparacao entregas vs cronograma com icone e cor contextual.

2. **Roadmap** - Valor numerico: numero da fase atual (count-up). Sufixo: nenhum. Trend: "fase atual em andamento".

3. **Cronograma** - Valor numerico: percentual (count-up). Sufixo: `%`. Trend: dias restantes.

4. **Entregas** - Valor numerico: concluidas (count-up). Sufixo: `/${total}`. Trend: percentual concluido.

## Alteracoes

### `src/components/meu-sistema/ProjetoOverviewCards.tsx`
Reescrever completamente:
- Criar sub-componente `StatCard` interno com:
  - Animacao count-up usando `framer-motion` `useMotionValue` + `useTransform` + `animate`
  - Layout: valor grande (text-4xl font-bold) + sufixo menor + titulo + linha de trend com icone
  - Cores da marca (verde aplicada para positivo, destructive para negativo)
- Card com `border border-border rounded-xl` sem background colorido excessivo
- Grid 2x2 em mobile, 4 colunas em desktop (manter)

Nenhum outro arquivo precisa ser alterado, apenas este componente.

1 arquivo editado.

