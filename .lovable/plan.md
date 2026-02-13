
# Correcao do Grafico "Entregas Projetadas vs Executadas"

## Problemas Identificados

1. **Titulo ilegivel**: O titulo do card ainda aparece escuro sobre fundo escuro na pagina de Projetos
2. **Meses vazios**: O grafico mostra 6 meses fixos (ultimos 6 meses), incluindo meses anteriores ao inicio do contrato onde nao havia dados

## Solucao

### Arquivo: `src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx`

**1. Receber `dataInicio` como prop** - O componente passara a receber a data de inicio do contrato para calcular os meses corretos.

**2. Filtrar meses a partir do contrato** - Ao inves de sempre mostrar os ultimos 6 meses, o grafico calculara os meses desde `data_inicio` ate o mes atual, limitando a no maximo 12 meses.

**3. Titulo legivel** - Garantir que o `CardTitle` use `!text-white` (ja aplicado, mas verificar se esta funcionando na pagina de Projetos).

### Arquivo: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

**4. Passar `dataInicio` ao grafico** - Usar o hook `useSkillsEquipe` para obter `equipe.data_inicio` e passar como prop ao componente do grafico.

## Detalhes Tecnicos

### Mudanca na interface do componente:
```typescript
interface Props {
  entregas: Entrega[];
  dataInicio?: string | null; // nova prop
}
```

### Logica de calculo dos meses:
- Se `dataInicio` existe: gerar meses desde essa data ate o mes atual
- Se nao existe: manter comportamento atual (ultimos 6 meses)
- Limitar a no maximo 12 meses para nao sobrecarregar o grafico

### Arquivos modificados:
- `src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx`
- `src/pages/skills/ProjetoSkillsProjetosPage.tsx`
