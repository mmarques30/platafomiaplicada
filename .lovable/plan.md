

# Adicionar prioridades P1 / P2 / P3 nos projetos Skills

## Problema atual
O campo de prioridade dos projetos usa os valores "Alta / Media / Baixa", mas o usuario precisa de **P1 / P2 / P3** como sistema de priorizacao.

## Solucao

Alterar os valores armazenados e exibidos de prioridade em todos os componentes do modulo Skills (backlog) para usar `p1`, `p2`, `p3` em vez de `alta`, `media`, `baixa`.

### Arquivos a alterar

| Arquivo | O que muda |
|---|---|
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Select: trocar opcoes para P1, P2, P3. Atualizar mapa de cores `prioridadeCores` para usar `p1`, `p2`, `p3` |
| `src/components/skills/backlog/BacklogCard.tsx` | Atualizar mapa `prioridadeCores` e label exibido para P1/P2/P3 |
| `src/components/skills/backlog/BacklogTable.tsx` | Atualizar mapa `prioridadeCores` e label exibido para P1/P2/P3 |
| `src/components/skills/backlog/AddProjetoModal.tsx` | Select de prioridade: trocar opcoes de Alta/Media/Baixa para P1/P2/P3 |
| `src/components/skills/backlog/BacklogView.tsx` | Filtro de prioridade: ajustar label para exibir "P1/P2/P3" em vez de "Alta/Media/Baixa" |

### Detalhes

- **Valores no banco**: `p1`, `p2`, `p3` (substituindo `alta`, `media`, `baixa`)
- **Labels de exibicao**: "P1", "P2", "P3"
- **Cores**: P1 = vermelho (mesmo da "alta"), P2 = amarelo/verde (mesmo da "media"), P3 = verde claro (mesmo da "baixa")
- **Opcao "Sem prioridade"**: mantida como esta (valor `null`)
- Dados existentes com valores antigos ("alta", "media", "baixa") continuarao exibindo corretamente se o mapa de cores incluir ambos os conjuntos como fallback

Nenhuma alteracao de banco de dados necessaria — o campo `prioridade` e do tipo texto e aceita qualquer valor.

