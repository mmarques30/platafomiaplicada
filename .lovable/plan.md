

# Ajustar Timeline de Etapas

## Problema
A secao de etapas (TimelineEtapas) esta com os cards nao ocupando a largura total disponivel, devido aos nodes circulares (icones) na lateral esquerda que consomem espaco. O usuario quer remover esses icones e fazer os cards ocuparem toda a largura.

## Alteracoes

### `src/components/meu-sistema/TimelineEtapas.tsx`
- Remover os nodes circulares (icones de status) que ficam antes de cada card
- Remover as linhas verticais de conexao (background line e animated fill line)
- Remover a coluna flex dos nodes, fazendo o Card ocupar 100% da largura
- Manter o restante do layout (badges de status, datas, progresso de entregas)

1 arquivo editado.

