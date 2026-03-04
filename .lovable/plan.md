

# Painel "Projeto (Empresa)" para Business Sistemas

## Contexto
A pagina `/meu-sistema` esta vazia. O menu `meu_sistema` no banco ainda referencia `business_iaplicada` (precisa atualizar para `business_sistemas`). Os dados ja existem nas tabelas `contratos_business`, `etapas_business` e `entregas_business`.

## Alteracoes

### 1. Migration: corrigir planos_permitidos do menu
Atualizar o registro `meu_sistema` em `menu_config` para `planos_permitidos = ['business_sistemas']`.

### 2. Construir a pagina `MeuSistema.tsx`
Reescrever a pagina seguindo o layout do preview UX (https://dry-mountain-9703.21st.app/), adaptado ao design system atual (dark theme, cores da marca).

**Estrutura da pagina:**

```text
┌─────────────────────────────────────────────────────┐
│  Titulo: "Sistema de Gestao Empresarial"            │
│  Subtitulo: "Cliente: {nome_empresa}"               │
├────────────┬────────────┬────────────┬──────────────┤
│ Progresso  │ Fase Atual │ Cronograma │   Equipe     │
│   65%      │ Implement. │  95/165    │  8 membros   │
├────────────┴────────────┴────────────┴──────────────┤
│                                                     │
│  ┌─ Proximos Passos ──┐  ┌─ Entregas Concluidas ─┐ │
│  │ • item 1           │  │ ✓ entrega 1           │ │
│  │ • item 2           │  │ ✓ entrega 2           │ │
│  └────────────────────┘  └───────────────────────┘ │
│                                                     │
│  Metodologia APLICA - Timeline do Projeto           │
│                                                     │
│  ○ Analise ──── [Card com progresso, datas, ...]   │
│  │                                                  │
│  ○ Planejamento [Card...]                          │
│  │                                                  │
│  ... (7 etapas)                                    │
└─────────────────────────────────────────────────────┘
```

**Dados consumidos:**
- `useContratosBusiness(businessUserId)` — nome_empresa, proximos_passos, data_inicio, data_fim
- `useEtapasBusiness(contrato.id)` — lista de etapas com status, datas, objetivo
- `useEntregasBusiness(contrato.id)` — entregas por etapa com status

**Componentes a criar:**
- `src/components/meu-sistema/ProjetoOverviewCards.tsx` — 4 mini cards (progresso, fase atual, cronograma, equipe)
- `src/components/meu-sistema/ProximosPassosCard.tsx` — lista de proximos passos pendentes
- `src/components/meu-sistema/EntregasConcluidasCard.tsx` — lista de entregas com status concluida
- `src/components/meu-sistema/TimelineEtapas.tsx` — timeline vertical com cards de cada etapa (icone, titulo, descricao, progresso, datas, entregas da etapa)

**Calculo de progresso por etapa:** percentual = entregas concluidas da etapa / total entregas da etapa.

**Calculo de cronograma:** dias decorridos desde `data_inicio` do contrato vs total de dias ate `data_fim`.

**Fase atual:** primeira etapa com status `em_andamento`, ou ultima `concluida` se nenhuma em andamento.

### 3. Atualizar label do menu sidebar
O menu deve exibir "Projeto {nome_empresa}" dinamicamente. Como o `menu_config` e estatico, a label sera ajustada no `AppSidebar.tsx` (similar ao rename de "Meu Progresso" → "Minha Trajetoria") quando o ambiente e `business_sistemas`.

### Arquivos afetados
| Arquivo | Acao |
|---------|------|
| `src/pages/MeuSistema.tsx` | Reescrever com layout completo |
| `src/components/meu-sistema/ProjetoOverviewCards.tsx` | Criar |
| `src/components/meu-sistema/ProximosPassosCard.tsx` | Criar |
| `src/components/meu-sistema/EntregasConcluidasCard.tsx` | Criar |
| `src/components/meu-sistema/TimelineEtapas.tsx` | Criar |
| `src/components/layout/AppSidebar.tsx` | Ajustar label dinamica |
| `src/hooks/useMenuConfig.tsx` | Remover `meu_sistema` da lista hidden de `business_sistemas` (ja esta correto, nao esta na lista) |
| Migration SQL | Atualizar `planos_permitidos` de `business_iaplicada` para `business_sistemas` |

