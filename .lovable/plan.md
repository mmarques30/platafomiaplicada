

# Criar pagina de detalhe de fase exclusiva para Meu Sistema

## Problema
Atualmente, ao clicar numa fase no RoadMap de "Meu Sistema", o usuario e redirecionado para `/mentoria/etapa/:etapaId` -- a mesma pagina usada em Business Parceria, que foca em gestao de entregas com seletores de status. Para "Meu Sistema", a visao deve ser informativa e estrategica: descrever a fase, sua necessidade, projecao de execucao e impacto.

## Solucao

### 1. Nova pagina `src/pages/MeuSistemaEtapaDetalhe.tsx`
Pagina dedicada com layout diferenciado, contendo:

- **Header**: Nome da fase, numero, badge de status, data prevista/conclusao
- **Card "Sobre esta Fase"**: Objetivo/descricao detalhada da fase com destaque visual
- **Card "Projecao de Execucao"**: Data prevista, data de conclusao (se houver), duracao estimada, barra de progresso das entregas
- **Card "Impacto e Necessidade"**: Listagem dos marcos (`marcos_proxima_etapa`) apresentados como impactos esperados da fase
- **Card "Entregas Previstas"**: Lista simplificada (somente leitura) das entregas vinculadas, com status visual (icone + cor), modulo relacionado e prazo -- sem seletor de status (diferente da Parceria)
- Botao "Voltar" para `/meu-sistema`

### 2. Nova rota em `src/App.tsx`
- Adicionar rota `/meu-sistema/fase/:etapaId` apontando para `MeuSistemaEtapaDetalhe`

### 3. Atualizar `src/components/meu-sistema/TimelineEtapas.tsx`
- Alterar o `onClick` de `/mentoria/etapa/${etapa.id}` para `/meu-sistema/fase/${etapa.id}`

### Diferencas em relacao a pagina de Parceria
| Parceria (`MentoriaEtapa`) | Sistema (`MeuSistemaEtapaDetalhe`) |
|---|---|
| Select para mudar status das entregas | Somente leitura, visual limpo |
| Foco em gestao/tarefas | Foco em clareza, necessidade e impacto |
| Marcos como "proximo encontro" | Marcos como impacto esperado |
| Layout funcional | Layout informativo/estrategico |

### Arquivos editados/criados
1. **Criar** `src/pages/MeuSistemaEtapaDetalhe.tsx`
2. **Editar** `src/App.tsx` -- nova rota
3. **Editar** `src/components/meu-sistema/TimelineEtapas.tsx` -- alterar navegacao

