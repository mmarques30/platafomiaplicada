

# Refazer RoadMap com layout estilo Aceternity Timeline

## Design de referencia
O componente Aceternity Timeline usa:
- Linha vertical a esquerda com dot/circulo por item
- Titulo da etapa ao lado do dot (sticky ou destaque)
- Conteudo a direita da linha, com espacamento generoso
- Animacao de scroll com beam que acompanha o progresso (framer-motion `useScroll` + `useTransform`)
- Responsivo: em mobile o conteudo fica abaixo do titulo

## Alteracoes

### `src/components/meu-sistema/TimelineEtapas.tsx`
Reescrever completamente com o layout vertical timeline:

- **Linha vertical**: div absoluta com gradiente, do topo ao fundo do container
- **Scroll beam**: div animada com `framer-motion` `useScroll` + `useTransform` que preenche a linha conforme scroll (cor primary)
- **Dot por etapa**: circulo na linha, com cor contextual (primary para em andamento, green para concluida, muted para pendente)
- **Layout por etapa**:
  - Titulo da etapa como heading grande ao lado do dot (md:sticky top)
  - Conteudo a direita: objetivo, badge de status, datas, barra de progresso de entregas, lista resumida de entregas
- **Responsividade**: em mobile, layout empilhado (titulo acima, conteudo abaixo); em desktop, titulo a esquerda e conteudo a direita
- **Clique**: manter navegacao para `/meu-sistema/fase/{id}`
- **Cores**: usar cores da marca (primary, muted-foreground, green-500, destructive) em vez dos neutrals do Aceternity

1 arquivo editado.

