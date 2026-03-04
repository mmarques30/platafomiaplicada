

# Ajustar Overview Cards

## Alteracoes

### 1. `src/components/meu-sistema/ProjetoOverviewCards.tsx`
- **Progresso Geral**: Remover a barra de progresso (`Progress`), manter apenas o valor percentual
- **Fase Atual → Roadmap**: Renomear label para "Roadmap", mostrar "Fase X" (numero da etapa) em vez do titulo completo
- **Cronograma**: Adicionar percentual junto com os dias, ex: `50/181 dias (28%)`
- **Etapas → Entregas**: Renomear para "Entregas", mostrar concluidas/total

### 2. `src/pages/MeuSistema.tsx`
- Passar novos props: `etapaAtualNumero`, `entregasConcluidas`, `totalEntregas`
- Calcular o numero da etapa atual (posicao na lista)

### Props atualizados
```
interface ProjetoOverviewCardsProps {
  progressoGeral: number;
  etapaAtualNumero: number | null;
  dataInicio: string | null;
  dataFim: string | null;
  entregasConcluidas: number;
  totalEntregas: number;
}
```

2 arquivos editados.

