

# Remover informações duplicadas na Evolução para Business Parceria

## Problema

Na página Evolução, para usuários Business, dois componentes são renderizados em sequência:

1. **BusinessProgressoConteudo** — mostra: Vídeos Assistidos, Prompts Consumidos, Interações + Atividade Recente (sem filtros)
2. **BusinessEvolucaoAprendizado** — mostra: Tempo de Tela, Prompts Consumidos, Ferramentas Criadas + Atividade Recente (com filtros)

Isso gera duplicação visível de métricas (prompts, tempo de vídeo) e duas seções "Atividade Recente" idênticas, como mostrado nos screenshots.

## Solução

Remover o `BusinessProgressoConteudo` da página Evolução, mantendo apenas o `BusinessEvolucaoAprendizado` que é mais completo (possui filtros, expand/collapse, favoritos).

## Alteração

**Arquivo**: `src/pages/Evolucao.tsx`

- Remover o import de `BusinessProgressoConteudo` (linha 13)
- Remover a renderização `{isBusiness && <BusinessProgressoConteudo />}` (linha 64)

Nenhum outro arquivo alterado. O componente `BusinessProgressoConteudo` continua existindo para uso na página de Mentoria onde ele é renderizado separadamente.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/Evolucao.tsx` | Editado — remove componente duplicado |

